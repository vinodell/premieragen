import { sendData } from "./sendData";

jest.mock("../consts", () => ({
  telegramApi: "https://telegram.example/",
  WEB_3_API_ACCESS_KEY: "test-web3-key",
  CONTACT_EMAIL: "katieza@me.com",
}));

const telegramUrl = "https://telegram.example/send-data";
const emailUrl = "https://api.web3forms.com/submit";
const payload = {
  name: "Катя",
  email: "kate@example.com",
  feature: "Аудит рекламной кампании",
  date: "2099-04-17T09:45:00.000Z",
};
const originalFetch = global.fetch;
const fetchMock = jest.fn();
let warningSpy: jest.SpyInstance;

const apiResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

const requestOptions = (url: string): RequestInit =>
  fetchMock.mock.calls.find(([input]) => String(input) === url)![1];

const deferredResponse = () => {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((fulfill) => {
    resolve = fulfill;
  });
  return { promise, resolve };
};

const rejectOnAbort = (_input: RequestInfo | URL, options?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    options?.signal?.addEventListener(
      "abort",
      () => reject(new DOMException("Request aborted", "AbortError")),
      { once: true },
    );
  });

const flushPromises = async () => {
  for (let turn = 0; turn < 10; turn += 1) {
    await Promise.resolve();
  }
};

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock.mockReset();
  global.fetch = fetchMock;
  warningSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  global.fetch = originalFetch;
  warningSpy.mockRestore();
});

describe("sendData", () => {
  it.each([
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ])(
    "reports the combined result when Telegram succeeds: %s and email succeeds: %s",
    async (telegramSuccess, emailSuccess) => {
      fetchMock
        .mockResolvedValueOnce(apiResponse({ success: telegramSuccess }))
        .mockResolvedValueOnce(apiResponse({ success: emailSuccess }));

      const result = sendData(payload);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const success = await result.then(
        () => true,
        () => false,
      );
      expect(success).toBe(telegramSuccess || emailSuccess);
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  it("posts email details with the configured access key and the visitor Reply-To", async () => {
    fetchMock.mockResolvedValue(apiResponse({ success: true }));

    await sendData(payload);

    const telegram = requestOptions(telegramUrl);
    expect(telegram.method).toBe("POST");
    expect(telegram.headers).toEqual(
      expect.objectContaining({ "Content-Type": "application/json" }),
    );
    expect(JSON.parse(String(telegram.body))).toEqual(payload);

    const email = requestOptions(emailUrl);
    expect(email.method).toBe("POST");
    expect(email).not.toHaveProperty("headers");
    expect(email.body).toBeInstanceOf(FormData);
    const body = Object.fromEntries((email.body as FormData).entries());
    expect(body).toMatchObject({
      ...payload,
      access_key: "test-web3-key",
      subject: "Новая заявка — Premier Agency",
      from_name: "Premier Agency",
      replyto: payload.email,
    });
    expect(body).not.toHaveProperty("to");
    expect(body).not.toHaveProperty("recipient");
    expect(body.message).toContain(payload.name);
    expect(body.message).toContain(payload.email);
    expect(body.message).toContain(payload.feature);
    expect(body.message).toContain("Москва");
    expect(body.message).toContain("12:45");
    expect(body.message).toContain(payload.date);
  });

  it("starts both requests before either response completes and awaits both results", async () => {
    const telegram = deferredResponse();
    const email = deferredResponse();
    fetchMock
      .mockReturnValueOnce(telegram.promise)
      .mockReturnValueOnce(email.promise);
    let settled = false;

    const result = sendData(payload);
    result.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requestOptions(telegramUrl).signal).not.toBe(
      requestOptions(emailUrl).signal,
    );

    telegram.resolve(apiResponse({ success: true }));
    await flushPromises();
    expect(settled).toBe(false);
    expect(requestOptions(emailUrl).signal?.aborted).toBe(false);

    email.resolve(apiResponse({ success: false }));
    await expect(result).resolves.toBeUndefined();
    expect(jest.getTimerCount()).toBe(0);
    expect(requestOptions(telegramUrl).signal?.aborted).toBe(false);
    expect(requestOptions(emailUrl).signal?.aborted).toBe(false);
  });

  it.each(["Telegram", "email"])(
    "still sends the other request when %s throws synchronously",
    async (failedChannel) => {
      fetchMock.mockImplementation((input) => {
        if (
          String(input) ===
          (failedChannel === "Telegram" ? telegramUrl : emailUrl)
        ) {
          throw new Error("Network unavailable");
        }
        return Promise.resolve(apiResponse({ success: true }));
      });

      await expect(sendData(payload)).resolves.toBeUndefined();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  it("rejects when both independent network requests fail", async () => {
    fetchMock.mockRejectedValue(new Error("Network unavailable"));

    await expect(sendData(payload)).rejects.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(0);
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining("Telegram"),
      expect.stringContaining("Network unavailable"),
    );
    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining("Web3Forms"),
      expect.stringContaining("Network unavailable"),
    );
  });

  it.each([
    [
      403,
      { success: false, message: "Access key is invalid." },
      "HTTP 403",
      "Access key is invalid.",
    ],
    [
      422,
      { success: false, body: { message: "Email field is invalid." } },
      "HTTP 422",
      "Email field is invalid.",
    ],
    [
      200,
      { success: false, message: "This domain is not allowed." },
      "",
      "This domain is not allowed.",
    ],
    [
      200,
      { success: false, error: "Submission was rejected by the provider." },
      "",
      "Submission was rejected by the provider.",
    ],
  ])(
    "preserves the email provider detail at HTTP %s while Telegram success resolves",
    async (status, body, expectedStatus, expectedDetail) => {
      fetchMock
        .mockResolvedValueOnce(apiResponse({ success: true }))
        .mockResolvedValueOnce(apiResponse(body, status));

      await expect(sendData(payload)).resolves.toBeUndefined();

      expect(warningSpy).toHaveBeenCalledTimes(1);
      expect(warningSpy).toHaveBeenCalledWith(
        expect.stringContaining("Web3Forms"),
        expect.stringContaining(expectedDetail),
      );
      expect(String(warningSpy.mock.calls[0][1])).toContain(expectedStatus);
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  it("logs the HTTP status when the rejected email response is not JSON", async () => {
    fetchMock
      .mockResolvedValueOnce(apiResponse({ success: true }))
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest
          .fn()
          .mockRejectedValue(new SyntaxError("Unexpected token <")),
      } as unknown as Response);

    await expect(sendData(payload)).resolves.toBeUndefined();

    expect(warningSpy).toHaveBeenCalledWith(
      expect.stringContaining("Web3Forms"),
      expect.stringContaining("HTTP 500"),
    );
  });

  it("logs a malformed successful email response without changing Telegram success", async () => {
    fetchMock
      .mockResolvedValueOnce(apiResponse({ success: true }))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new SyntaxError("Invalid JSON")),
      } as unknown as Response);

    await expect(sendData(payload)).resolves.toBeUndefined();

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy.mock.calls[0][0]).toContain("Web3Forms");
    expect(warningSpy.mock.calls[0][1]).toEqual(expect.any(String));
    expect(String(warningSpy.mock.calls[0][1]).length).toBeGreaterThan(0);
  });

  it("redacts every access key occurrence and excludes returned form data from diagnostics", async () => {
    fetchMock
      .mockResolvedValueOnce(apiResponse({ success: true }))
      .mockResolvedValueOnce(
        apiResponse(
          {
            success: false,
            message: "Access key test-web3-key is invalid: test-web3-key",
            data: { ...payload, access_key: "test-web3-key" },
          },
          403,
        ),
      );

    await expect(sendData(payload)).resolves.toBeUndefined();

    const warning = warningSpy.mock.calls.flat().join(" ");
    expect(warning).toContain("Access key");
    expect(warning).not.toContain("test-web3-key");
    Object.values(payload).forEach((value) => {
      expect(warning).not.toContain(value);
    });
  });

  it("does not turn a returned data object into an error message", async () => {
    fetchMock
      .mockResolvedValueOnce(apiResponse({ success: true }))
      .mockResolvedValueOnce(
        apiResponse({ success: false, data: payload }, 422),
      );

    await expect(sendData(payload)).resolves.toBeUndefined();

    const warning = warningSpy.mock.calls.flat().join(" ");
    expect(warning).toContain("HTTP 422");
    Object.values(payload).forEach((value) => {
      expect(warning).not.toContain(value);
    });
  });

  it("redacts the access key from a rejected network error", async () => {
    fetchMock
      .mockResolvedValueOnce(apiResponse({ success: true }))
      .mockRejectedValueOnce(
        new Error("Request test-web3-key failed for test-web3-key"),
      );

    await expect(sendData(payload)).resolves.toBeUndefined();

    expect(warningSpy).toHaveBeenCalledTimes(1);
    const warning = warningSpy.mock.calls.flat().join(" ");
    expect(warning).toContain("Web3Forms");
    expect(warning).toContain("Request");
    expect(warning).not.toContain("test-web3-key");
  });

  it("bounds provider diagnostics to 512 characters", async () => {
    fetchMock
      .mockResolvedValueOnce(apiResponse({ success: true }))
      .mockResolvedValueOnce(
        apiResponse({ success: false, message: "x".repeat(2000) }, 403),
      );

    await expect(sendData(payload)).resolves.toBeUndefined();

    expect(String(warningSpy.mock.calls[0][1]).length).toBeLessThanOrEqual(512);
  });

  it("does not log errors when both providers confirm success", async () => {
    fetchMock.mockResolvedValue(apiResponse({ success: true }));

    await expect(sendData(payload)).resolves.toBeUndefined();

    expect(warningSpy).not.toHaveBeenCalled();
  });

  it.each([
    [
      "HTTP failure with a success body",
      () => apiResponse({ success: true }, 503),
    ],
    ["explicit rejection", () => apiResponse({ success: false })],
    ["missing confirmation", () => apiResponse({})],
    ["null JSON", () => apiResponse(null)],
    ["a non-boolean success field", () => apiResponse({ success: "true" })],
    [
      "malformed JSON",
      () =>
        ({
          ok: true,
          status: 200,
          json: jest.fn().mockRejectedValue(new SyntaxError("Invalid JSON")),
        }) as unknown as Response,
    ],
  ] as const)(
    "rejects when both providers return %s",
    async (_label, response) => {
      fetchMock.mockImplementation(async () => response());

      await expect(sendData(payload)).rejects.toThrow();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  it("aborts each hanging request after 15 seconds and rejects when both time out", async () => {
    fetchMock.mockImplementation(rejectOnAbort);

    const result = sendData(payload);
    const telegramSignal = requestOptions(telegramUrl).signal;
    const emailSignal = requestOptions(emailUrl).signal;
    expect(telegramSignal).toBeInstanceOf(AbortSignal);
    expect(emailSignal).toBeInstanceOf(AbortSignal);
    expect(telegramSignal).not.toBe(emailSignal);
    expect(jest.getTimerCount()).toBe(2);

    jest.advanceTimersByTime(14999);
    expect(telegramSignal?.aborted).toBe(false);
    expect(emailSignal?.aborted).toBe(false);
    jest.advanceTimersByTime(1);

    await expect(result).rejects.toThrow();
    expect(telegramSignal?.aborted).toBe(true);
    expect(emailSignal?.aborted).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  });

  it.each(["Telegram", "email"])(
    "keeps the other channel successful when %s hangs until its own timeout",
    async (hangingChannel) => {
      const hangingUrl = hangingChannel === "Telegram" ? telegramUrl : emailUrl;
      const successfulUrl =
        hangingChannel === "Telegram" ? emailUrl : telegramUrl;
      fetchMock.mockImplementation((input, options) =>
        String(input) === hangingUrl
          ? rejectOnAbort(input, options)
          : Promise.resolve(apiResponse({ success: true })),
      );

      const result = sendData(payload);
      await flushPromises();
      const hangingSignal = requestOptions(hangingUrl).signal;
      const successfulSignal = requestOptions(successfulUrl).signal;
      expect(hangingSignal?.aborted).toBe(false);
      expect(successfulSignal?.aborted).toBe(false);
      expect(jest.getTimerCount()).toBe(1);

      jest.advanceTimersByTime(15000);

      await expect(result).resolves.toBeUndefined();
      expect(hangingSignal?.aborted).toBe(true);
      expect(successfulSignal?.aborted).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    },
  );
});
