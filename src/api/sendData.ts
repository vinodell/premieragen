import type { NewClientPayload } from "../consts";

export const sendData = async (payload: NewClientPayload): Promise<void> => {
  if (payload.consent?.accepted !== true) {
    throw new Error("Необходимо согласие на обработку персональных данных.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const result: unknown = await response.json();
    if (
      !response.ok ||
      typeof result !== "object" ||
      result === null ||
      !("success" in result) ||
      result.success !== true
    ) {
      throw new Error("Сервер не подтвердил получение заявки.");
    }
  } finally {
    clearTimeout(timeout);
  }
};
