import { telegramApi, NewClientPayload } from "../consts";

export const sendData = async (payload: NewClientPayload): Promise<void> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(new URL("/send-data", telegramApi).href, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Не удалось отправить заявку.");
    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      result === null ||
      !("success" in result) ||
      result.success !== true
    ) {
      throw new Error("Некорректный ответ сервера.");
    }
  } finally {
    clearTimeout(timeout);
  }
};
