import { telegramApi, NewClientPayload, TelegramResponse } from "../consts";

export const sendData = async (payload: NewClientPayload): Promise<void> => {
  const response = await fetch(telegramApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as TelegramResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Telegram send failed");
  }
}
