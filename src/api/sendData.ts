import {
  telegramApi,
  WEB_3_API_ACCESS_KEY,
  type NewClientPayload,
} from "../consts";

const postSubmission = async (url: string, body: string): Promise<void> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
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

const sendTelegram = async (payload: NewClientPayload): Promise<void> => {
  await postSubmission(
    new URL("/send-data", telegramApi).href,
    JSON.stringify(payload),
  );
};

const sendEmail = async (payload: NewClientPayload): Promise<void> => {
  const appointment = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(payload.date));

  await postSubmission(
    "https://api.web3forms.com/submit",
    JSON.stringify({
      access_key: WEB_3_API_ACCESS_KEY,
      subject: "Новая заявка — Premier Agency",
      from_name: "Premier Agency",
      replyto: payload.email,
      name: payload.name,
      email: payload.email,
      feature: payload.feature,
      date: payload.date,
      message: [
        `Имя клиента: ${payload.name}`,
        `Рабочий email: ${payload.email}`,
        `Задача: ${payload.feature}`,
        `Дата и время звонка (Москва, UTC+3): ${appointment}`,
        `Дата и время звонка (UTC): ${payload.date}`,
      ].join("\n"),
    }),
  );
};

export const sendData = async (payload: NewClientPayload): Promise<void> => {
  const results = await Promise.allSettled([
    sendTelegram(payload),
    sendEmail(payload),
  ]);

  if (!results.some((result) => result.status === "fulfilled")) {
    throw new Error("Не удалось отправить заявку.");
  }
};
