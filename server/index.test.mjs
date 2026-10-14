import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  CONSENT_VERSION,
  RETENTION_MS,
  createAppServer,
  purgeExpiredRequests,
} from "./index.mjs";

const INITIAL_TIME = Date.parse("2026-10-14T09:00:00.000Z");
const validPayload = (timestamp = INITIAL_TIME) => ({
  name: "Тестовый посетитель",
  email: "visitor@example.test",
  feature: "Обсудить проект",
  date: new Date(timestamp + 24 * 60 * 60 * 1000).toISOString(),
  consent: {
    accepted: true,
    acceptedAt: new Date(timestamp).toISOString(),
    version: CONSENT_VERSION,
  },
});

const fixture = async (t, options = {}) => {
  const root = await mkdtemp(join(tmpdir(), "premier-server-test-"));
  let server;
  t.after(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections?.();
      });
    }
    await rm(root, { recursive: true, force: true });
  });
  const dataDir = join(root, "private-requests");
  const buildDir = join(root, "build");
  await mkdir(buildDir);
  await writeFile(
    join(buildDir, "index.html"),
    "<!doctype html><title>Test site</title>",
  );
  await writeFile(join(buildDir, "style.css"), "body { color: black; }");
  server = await createAppServer({
    dataDir,
    buildDir,
    now: () => INITIAL_TIME,
    maxRequestsPerWindow: 100,
    ...options,
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const submit = (payload, headers = {}) =>
    fetch(`${baseUrl}/api/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl,
        ...headers,
      },
      body: JSON.stringify(payload),
    });
  return { baseUrl, submit, dataDir, buildDir, root, server };
};

test("accepted same-origin request is durably stored with consent and private permissions", async (t) => {
  const { submit, dataDir } = await fixture(t);
  const payload = validPayload();
  const response = await submit(payload);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  const filenames = await readdir(dataDir);
  assert.equal(filenames.length, 1);
  assert.match(filenames[0], /^[0-9a-f-]{36}\.json$/);
  const record = JSON.parse(
    await readFile(join(dataDir, filenames[0]), "utf8"),
  );
  assert.deepEqual(record, {
    id: filenames[0].slice(0, -5),
    receivedAt: new Date(INITIAL_TIME).toISOString(),
    expiresAt: new Date(INITIAL_TIME + RETENTION_MS).toISOString(),
    ...payload,
  });
  assert.equal((await stat(dataDir)).mode & 0o777, 0o700);
  assert.equal((await stat(join(dataDir, filenames[0]))).mode & 0o777, 0o600);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("each accepted request has an independent record", async (t) => {
  const { submit, dataDir } = await fixture(t);
  const responses = await Promise.all([
    submit(validPayload()),
    submit(validPayload()),
  ]);
  assert.deepEqual(
    responses.map((response) => response.status),
    [200, 200],
  );
  const filenames = await readdir(dataDir);
  assert.equal(filenames.length, 2);
  assert.notEqual(filenames[0], filenames[1]);
});

test("rejects absent, false, unsupported and stale consent", async (t) => {
  const { submit, dataDir } = await fixture(t);
  for (const consent of [
    undefined,
    { ...validPayload().consent, accepted: false },
    { ...validPayload().consent, version: "old-version" },
    { ...validPayload().consent, acceptedAt: "2026-10-14T08:54:59.000Z" },
    { ...validPayload().consent, acceptedAt: "2026-10-14T09:01:01.000Z" },
    { ...validPayload().consent, acceptedAt: "2026-02-31T09:00:00.000Z" },
  ]) {
    const response = await submit({ ...validPayload(), consent });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).success, false);
  }
  assert.deepEqual(await readdir(dataDir), []);
});

test("validates required fields, lengths, email, dates and additional data", async (t) => {
  const { submit, dataDir } = await fixture(t);
  for (const overrides of [
    { name: " " },
    { name: "n".repeat(101) },
    { name: "name\nheader" },
    { email: "not-an-email" },
    { email: `${"n".repeat(250)}@test.test` },
    { feature: "" },
    { feature: "f".repeat(501) },
    { date: "2026-10-14T08:00:00.000Z" },
    { date: "2026-10-15" },
    { date: "2027-02-31T09:00:00.000Z" },
    { phone: "unexpected additional personal data" },
    { consent: { ...validPayload().consent, extra: "unexpected" } },
  ]) {
    const response = await submit({ ...validPayload(), ...overrides });
    assert.equal(response.status, 400);
    await response.json();
  }
  assert.deepEqual(await readdir(dataDir), []);
});

test("only configured origin can submit and non-JSON requests are refused", async (t) => {
  const { submit, dataDir } = await fixture(t, {
    publicOrigin: "https://example.test",
  });
  for (const headers of [
    { Origin: "https://another.test" },
    { Origin: "" },
    { Origin: "https://example.test", "Sec-Fetch-Site": "cross-site" },
  ]) {
    const response = await submit(validPayload(), headers);
    assert.equal(response.status, 403);
    await response.json();
  }
  const wrongType = await submit(validPayload(), {
    Origin: "https://example.test",
    "Content-Type": "text/plain",
  });
  assert.equal(wrongType.status, 415);
  await wrongType.json();
  const accepted = await submit(validPayload(), {
    Origin: "https://example.test",
  });
  assert.equal(accepted.status, 200);
  await accepted.json();
  assert.equal((await readdir(dataDir)).length, 1);
});

test("invalid and oversized JSON does not create a record", async (t) => {
  const { baseUrl, submit, dataDir } = await fixture(t);
  const invalid = await fetch(`${baseUrl}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: baseUrl },
    body: "{invalid json",
  });
  assert.equal(invalid.status, 400);
  await invalid.json();
  const oversized = await submit({
    ...validPayload(),
    feature: "f".repeat(9 * 1024),
  });
  assert.equal(oversized.status, 413);
  await oversized.json();
  const chunkedStatus = await new Promise((resolve, reject) => {
    const request = httpRequest(
      `${baseUrl}/api/requests`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: baseUrl },
      },
      (response) => {
        response.resume();
        response.on("end", () => resolve(response.statusCode));
      },
    );
    request.on("error", reject);
    request.write("{");
    request.write("x".repeat(9 * 1024));
    request.end("}");
  });
  assert.equal(chunkedStatus, 413);
  assert.deepEqual(await readdir(dataDir), []);
});

test("rate limit expires without persisting client addresses", async (t) => {
  let timestamp = INITIAL_TIME;
  const { submit, dataDir } = await fixture(t, {
    maxRequestsPerWindow: 2,
    now: () => timestamp,
  });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await submit(validPayload(timestamp));
    assert.equal(response.status, 200);
    await response.json();
  }
  const limited = await submit(validPayload(timestamp));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "900");
  await limited.json();
  timestamp += 15 * 60 * 1000;
  const retry = await submit(validPayload(timestamp));
  assert.equal(retry.status, 200);
  await retry.json();
  const records = await Promise.all(
    (await readdir(dataDir)).map((file) =>
      readFile(join(dataDir, file), "utf8"),
    ),
  );
  assert.ok(
    records.every(
      (record) =>
        !record.includes("127.0.0.1") && !record.includes("remoteAddress"),
    ),
  );
});

test("storage failure never reports a successful submission", async (t) => {
  const { submit, dataDir } = await fixture(t);
  await rm(dataDir, { recursive: true });
  const response = await submit(validPayload());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    success: false,
    error: "Request storage is unavailable",
  });
});

test("serves the site while keeping private records outside public routes", async (t) => {
  const { baseUrl, submit, dataDir } = await fixture(t);
  const submitted = await submit(validPayload());
  await submitted.json();
  const [filename] = await readdir(dataDir);
  const site = await fetch(`${baseUrl}/`);
  assert.equal(site.status, 200);
  assert.match(await site.text(), /Test site/);
  const policy = await fetch(`${baseUrl}/privacy`);
  assert.equal(policy.status, 200);
  assert.match(await policy.text(), /Test site/);
  const css = await fetch(`${baseUrl}/style.css`, { method: "HEAD" });
  assert.equal(css.status, 200);
  assert.match(css.headers.get("content-type"), /text\/css/);
  assert.equal(await css.text(), "");
  for (const path of [
    `/..%2fprivate-requests/${filename}`,
    `/private-requests/${filename}`,
    "/api/unknown",
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 404);
    assert.ok(!(await response.text()).includes("visitor@example.test"));
  }
  const apiGet = await fetch(`${baseUrl}/api/requests`);
  assert.equal(apiGet.status, 405);
  assert.equal(apiGet.headers.get("allow"), "POST");
});

test("expired records are deleted based on receipt time, without touching unrelated files", async (t) => {
  const { dataDir } = await fixture(t);
  const expired = `${randomUUID()}.json`;
  const active = `${randomUUID()}.json`;
  await writeFile(
    join(dataDir, expired),
    JSON.stringify({
      receivedAt: new Date(INITIAL_TIME - RETENTION_MS).toISOString(),
      expiresAt: "2099-01-01T00:00:00.000Z",
    }),
  );
  await writeFile(
    join(dataDir, active),
    JSON.stringify({
      receivedAt: new Date(INITIAL_TIME - RETENTION_MS + 1).toISOString(),
    }),
  );
  await writeFile(join(dataDir, "operator-notes.txt"), "unrelated file");
  await purgeExpiredRequests(dataDir, INITIAL_TIME);
  assert.deepEqual(
    (await readdir(dataDir)).sort(),
    [active, "operator-notes.txt"].sort(),
  );
  await purgeExpiredRequests(dataDir, INITIAL_TIME + 1);
  assert.deepEqual(await readdir(dataDir), ["operator-notes.txt"]);
});

test("startup refuses a private data directory inside the public build", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "premier-server-config-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await assert.rejects(
    createAppServer({ buildDir: root, dataDir: join(root, "private") }),
    /outside the public build/,
  );
});
