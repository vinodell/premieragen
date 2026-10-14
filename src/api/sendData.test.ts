import { sendData } from "./sendData";
import type { NewClientPayload } from "../consts";

const payload: NewClientPayload = {
  name: "Катя",
  email: "kate@example.com",
  feature: "Аудит рекламной кампании",
  date: "2099-04-17T09:45:00.000Z",
  consent: {
    accepted: true,
    acceptedAt: "2026-10-14T12:00:00.000Z",
    version: "2026-10-14",
  },
};
const originalFetch = global.fetch;
const fetchMock = jest.fn();

const apiResponse = (body: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  global.fetch = originalFetch;
});

test("sends only to the site's own API and includes evidence of consent", async () => {
  fetchMock.mockResolvedValue(apiResponse({ success: true }));
  await sendData(payload);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/requests",
    expect.objectContaining({
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );
  expect(jest.getTimerCount()).toBe(0);
});

test("does not send a request if consent is missing", async () => {
  const invalidPayload = { ...payload, consent: undefined };
  await expect(
    sendData(invalidPayload as unknown as NewClientPayload),
  ).rejects.toThrow(/согласие/);
  expect(fetchMock).not.toHaveBeenCalled();
});

test.each([
  ["HTTP failure", { success: true }, 503],
  ["rejected request", { success: false }, 200],
  ["missing confirmation", {}, 200],
  ["null JSON", null, 200],
  ["invalid success value", { success: "true" }, 200],
])("does not report success for %s", async (_label, body, status) => {
  fetchMock.mockResolvedValue(apiResponse(body, status));
  await expect(sendData(payload)).rejects.toThrow();
  expect(jest.getTimerCount()).toBe(0);
});

test("rejects HTML fallback or a malformed server response", async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: jest.fn().mockRejectedValue(new SyntaxError("Unexpected token <")),
  });
  await expect(sendData(payload)).rejects.toThrow();
  expect(jest.getTimerCount()).toBe(0);
});

test("rejects network errors and clears the timeout", async () => {
  fetchMock.mockRejectedValue(new Error("Network unavailable"));
  await expect(sendData(payload)).rejects.toThrow();
  expect(jest.getTimerCount()).toBe(0);
});

test("aborts a hanging request after 15 seconds", async () => {
  fetchMock.mockImplementation(
    (_input, options: RequestInit) =>
      new Promise((_resolve, reject) => {
        options.signal?.addEventListener("abort", () =>
          reject(new Error("Aborted")),
        );
      }),
  );
  const result = sendData(payload);
  const signal = (fetchMock.mock.calls[0][1] as RequestInit).signal;
  jest.advanceTimersByTime(14999);
  expect(signal?.aborted).toBe(false);
  jest.advanceTimersByTime(1);
  await expect(result).rejects.toThrow();
  expect(signal?.aborted).toBe(true);
  expect(jest.getTimerCount()).toBe(0);
});
