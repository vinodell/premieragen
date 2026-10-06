import {
  telegramApi,
  WEB_3_API_ACCESS_KEY,
  type NewClientPayload,
} from "../consts";

const sanitizeDiagnostic = (message: string): string => {
  const safeMessage = WEB_3_API_ACCESS_KEY
    ? message.split(WEB_3_API_ACCESS_KEY).join("[REDACTED]")
    : message;
  return safeMessage.trim().slice(0, 512);
};

const getServiceMessage = (result: unknown): string | undefined => {
  if (typeof result !== "object" || result === null) return;

  let message: unknown;
  if ("message" in result && typeof result.message === "string") {
    message = result.message;
  } else if (
    "body" in result &&
    typeof result.body === "object" &&
    result.body !== null &&
    "message" in result.body
  ) {
    message = result.body.message;
  } else if ("error" in result) {
    message = result.error;
  }

  if (typeof message !== "string" || !message.trim()) return;
  return sanitizeDiagnostic(message);
};

const postSubmission = async (
  url: string,
  body: string | FormData,
): Promise<void> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      method: "POST",
      ...(typeof body === "string"
        ? {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        : {}),
      body,
      signal: controller.signal,
    });
    let result: unknown;
    try {
      result = await response.json();
    } catch {
      throw new Error(`HTTP ${response.status}: некорректный ответ сервера.`);
    }
    if (
      !response.ok ||
      typeof result !== "object" ||
      result === null ||
      !("success" in result) ||
      result.success !== true
    ) {
      const message =
        getServiceMessage(result) ?? "Сервис не подтвердил отправку.";
      throw new Error(`HTTP ${response.status}: ${message}`);
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

  const formData = new FormData();
  Object.entries({
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
  }).forEach(([name, value]) => formData.append(name, value));

  // Native FormData avoids the JSON request's CORS preflight.
  await postSubmission("https://api.web3forms.com/submit", formData);
};

export const sendData = async (payload: NewClientPayload): Promise<void> => {
  const results = await Promise.allSettled([
    sendTelegram(payload),
    sendEmail(payload),
  ]);

  const channels = ["Telegram", "Web3Forms"];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const reason: unknown = result.reason;
      console.warn(
        `Отправка формы: ${channels[index]} не подтвердил отправку.`,
        sanitizeDiagnostic(
          reason instanceof Error ? reason.message : "Неизвестная ошибка.",
        ),
      );
    }
  });

  if (!results.some((result) => result.status === "fulfilled")) {
    throw new Error("Не удалось отправить заявку.");
  }
};
