import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  mkdir,
  open,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  chmod,
} from "node:fs/promises";
import { createServer } from "node:http";
import { isIP } from "node:net";
import { dirname, extname, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const serverDirectory = dirname(fileURLToPath(import.meta.url));
export const CONSENT_VERSION = "2026-10-14";
export const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 8 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const RECORD_FILENAME = /^[0-9a-f-]{36}\.json$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const jsonResponse = (response, status, body, headers = {}) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  response.end(JSON.stringify(body));
};

const readJson = (request) =>
  new Promise((resolveBody, rejectBody) => {
    let size = 0;
    let rejected = false;
    const chunks = [];
    request.on("data", (chunk) => {
      if (rejected) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        rejected = true;
        chunks.length = 0;
        rejectBody(new RequestError(413, "Request body is too large"));
        return;
      }
      chunks.push(chunk);
    });
    request.on("error", () =>
      rejectBody(new RequestError(400, "Invalid request")),
    );
    request.on("end", () => {
      if (rejected) return;
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        rejectBody(new RequestError(400, "Invalid JSON"));
      }
    });
  });

const isCanonicalDate = (value) =>
  typeof value === "string" &&
  ISO_DATE.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === value;

const validatePayload = (payload, timestamp) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new RequestError(400, "Invalid request fields");
  }
  const allowedFields = ["name", "email", "feature", "date", "consent"];
  if (
    Object.keys(payload).some((key) => !allowedFields.includes(key)) ||
    ["name", "email", "feature"].some(
      (key) => typeof payload[key] !== "string" || !payload[key].trim(),
    )
  ) {
    throw new RequestError(400, "Invalid request fields");
  }
  const name = payload.name.trim();
  const email = payload.email.trim();
  const feature = payload.feature.trim();
  if (
    name.length > 100 ||
    email.length > 254 ||
    feature.length > 500 ||
    /[\u0000-\u001f\u007f]/.test(name) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !isCanonicalDate(payload.date) ||
    Date.parse(payload.date) <= timestamp
  ) {
    throw new RequestError(400, "Invalid fields or appointment date");
  }
  const consent = payload.consent;
  if (
    !consent ||
    typeof consent !== "object" ||
    Array.isArray(consent) ||
    Object.keys(consent).some(
      (key) => !["accepted", "acceptedAt", "version"].includes(key),
    ) ||
    consent.accepted !== true ||
    consent.version !== CONSENT_VERSION ||
    !isCanonicalDate(consent.acceptedAt) ||
    timestamp - Date.parse(consent.acceptedAt) > 5 * 60 * 1000 ||
    Date.parse(consent.acceptedAt) - timestamp > 60 * 1000
  ) {
    throw new RequestError(400, "Current personal data consent is required");
  }
  return {
    name,
    email,
    feature,
    date: payload.date,
    consent: {
      accepted: true,
      acceptedAt: consent.acceptedAt,
      version: consent.version,
    },
  };
};

const storeRecord = async (dataDirectory, payload, timestamp) => {
  const id = randomUUID();
  const record = {
    id,
    receivedAt: new Date(timestamp).toISOString(),
    expiresAt: new Date(timestamp + RETENTION_MS).toISOString(),
    ...payload,
  };
  const temporaryPath = resolve(dataDirectory, `${id}.json.tmp`);
  const finalPath = resolve(dataDirectory, `${id}.json`);
  try {
    const file = await open(temporaryPath, "wx", 0o600);
    try {
      await file.writeFile(`${JSON.stringify(record, null, 2)}\n`, "utf8");
      await file.sync();
    } finally {
      await file.close();
    }
    await rename(temporaryPath, finalPath);
    const directory = await open(dataDirectory, "r");
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  } finally {
    await rm(temporaryPath, { force: true });
  }
};

export const purgeExpiredRequests = async (
  dataDirectory,
  timestamp = Date.now(),
) => {
  const filenames = await readdir(dataDirectory);
  for (const filename of filenames) {
    if (!RECORD_FILENAME.test(filename)) continue;
    const pathname = resolve(dataDirectory, filename);
    try {
      const fileInfo = await stat(pathname);
      if (!fileInfo.isFile()) continue;
      let expiresAt = fileInfo.mtimeMs + RETENTION_MS;
      try {
        const record = JSON.parse(await readFile(pathname, "utf8"));
        if (isCanonicalDate(record.receivedAt)) {
          // The server's receipt time, rather than any client-supplied date,
          // controls the maximum storage duration.
          expiresAt = Date.parse(record.receivedAt) + RETENTION_MS;
        }
      } catch {
        // Even an unreadable record expires based on its filesystem timestamp.
      }
      if (expiresAt <= timestamp) await rm(pathname, { force: true });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
};

const serveBuild = async (request, response, buildDirectory, pathname) => {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    throw new RequestError(400, "Invalid path");
  }
  let filePath = resolve(buildDirectory, `.${decodedPath}`);
  if (
    !filePath.startsWith(`${buildDirectory}${sep}`) &&
    filePath !== buildDirectory
  ) {
    throw new RequestError(404, "Not found");
  }
  if (decodedPath === "/") filePath = resolve(buildDirectory, "index.html");
  let fileInfo;
  try {
    fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) throw new Error("Not a file");
  } catch {
    if (extname(decodedPath)) throw new RequestError(404, "Not found");
    filePath = resolve(buildDirectory, "index.html");
    try {
      fileInfo = await stat(filePath);
      if (!fileInfo.isFile()) throw new Error("Not a file");
    } catch {
      throw new RequestError(503, "Website build is not available");
    }
  }
  response.writeHead(200, {
    "Content-Type":
      CONTENT_TYPES[extname(filePath)] || "application/octet-stream",
    "Content-Length": fileInfo.size,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  if (request.method === "HEAD") response.end();
  else await pipeline(createReadStream(filePath), response);
};

/** A single same-origin server; application data never leaves this process. */
export const createAppServer = async ({
  dataDir = resolve(serverDirectory, "data"),
  buildDir = resolve(serverDirectory, "../build"),
  publicOrigin,
  trustLocalProxy = false,
  now = Date.now,
  maxRequestsPerWindow = MAX_REQUESTS_PER_WINDOW,
} = {}) => {
  const dataDirectory = resolve(dataDir);
  const buildDirectory = resolve(buildDir);
  if (
    dataDirectory === buildDirectory ||
    dataDirectory.startsWith(`${buildDirectory}${sep}`)
  ) {
    throw new Error("DATA_DIR must be outside the public build directory");
  }
  const expectedOrigin = publicOrigin
    ? new URL(publicOrigin).origin
    : undefined;
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  await chmod(dataDirectory, 0o700);
  await purgeExpiredRequests(dataDirectory, now());
  const rateLimits = new Map();
  let cleanupRunning = false;
  const cleanupTimer = setInterval(async () => {
    if (cleanupRunning) return;
    cleanupRunning = true;
    try {
      const timestamp = now();
      for (const [key, state] of rateLimits) {
        if (state.expiresAt <= timestamp) rateLimits.delete(key);
      }
      await purgeExpiredRequests(dataDirectory, now());
    } catch {
      console.error("Request retention cleanup failed");
    } finally {
      cleanupRunning = false;
    }
  }, 60 * 1000);
  cleanupTimer.unref();

  const handleRequest = async (request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname !== "/api/requests") {
      if (pathname.startsWith("/api/"))
        throw new RequestError(404, "Not found");
      if (!["GET", "HEAD"].includes(request.method))
        throw new RequestError(405, "Method not allowed");
      return serveBuild(request, response, buildDirectory, pathname);
    }
    if (request.method !== "POST") {
      return jsonResponse(
        response,
        405,
        { success: false, error: "Method not allowed" },
        { Allow: "POST" },
      );
    }
    const origin = expectedOrigin || `http://${request.headers.host}`;
    if (
      request.headers.origin !== origin ||
      request.headers["sec-fetch-site"] === "cross-site"
    ) {
      throw new RequestError(403, "Origin not allowed");
    }
    if (
      request.headers["content-type"]?.split(";")[0].trim().toLowerCase() !==
        "application/json" ||
      (request.headers["content-encoding"] &&
        request.headers["content-encoding"] !== "identity")
    ) {
      throw new RequestError(415, "Expected JSON");
    }
    const timestamp = now();
    for (const [key, state] of rateLimits) {
      if (state.expiresAt <= timestamp) rateLimits.delete(key);
    }
    let clientAddress = request.socket.remoteAddress || "unknown";
    const proxyAddress = request.headers["x-real-ip"];
    if (
      trustLocalProxy &&
      ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(clientAddress) &&
      typeof proxyAddress === "string" &&
      isIP(proxyAddress)
    )
      clientAddress = proxyAddress;
    const state = rateLimits.get(clientAddress) || {
      count: 0,
      expiresAt: timestamp + RATE_WINDOW_MS,
    };
    if (
      state.count >= maxRequestsPerWindow ||
      (!rateLimits.has(clientAddress) && rateLimits.size >= 10000)
    ) {
      return jsonResponse(
        response,
        429,
        { success: false, error: "Too many requests" },
        {
          "Retry-After": Math.max(
            1,
            Math.ceil((state.expiresAt - timestamp) / 1000),
          ),
        },
      );
    }
    state.count += 1;
    rateLimits.set(clientAddress, state);
    if (Number(request.headers["content-length"]) > MAX_BODY_BYTES) {
      request.resume();
      throw new RequestError(413, "Request body is too large");
    }
    const payload = validatePayload(await readJson(request), timestamp);
    try {
      await storeRecord(dataDirectory, payload, timestamp);
    } catch {
      throw new RequestError(503, "Request storage is unavailable");
    }
    jsonResponse(response, 200, { success: true });
  };

  const server = createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      if (response.headersSent || response.destroyed) {
        response.destroy();
        return;
      }
      request.resume();
      jsonResponse(
        response,
        error instanceof RequestError ? error.status : 500,
        {
          success: false,
          error:
            error instanceof RequestError
              ? error.message
              : "Internal server error",
        },
      );
    });
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.maxHeadersCount = 50;
  server.on("close", () => clearInterval(cleanupTimer));
  return server;
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT must be a valid port number");
  const server = await createAppServer({
    dataDir: process.env.DATA_DIR || resolve(serverDirectory, "data"),
    buildDir: process.env.BUILD_DIR || resolve(serverDirectory, "../build"),
    publicOrigin: process.env.PUBLIC_ORIGIN,
    trustLocalProxy: process.env.TRUST_LOCAL_PROXY === "1",
  });
  server.listen(port, host, () =>
    console.info(`Premier website listening on ${host}:${port}`),
  );
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
