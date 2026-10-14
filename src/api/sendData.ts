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
    consent_accepted: "true",
    consent_accepted_at: payload.consent.acceptedAt,
    consent_version: payload.consent.version,
    message: [
      `Имя клиента: ${payload.name}`,
      `Рабочий email: ${payload.email}`,
      `Задача: ${payload.feature}`,
      `Дата и время звонка (Москва, UTC+3): ${appointment}`,
      `Дата и время звонка (UTC): ${payload.date}`,
      "Согласие на обработку персональных данных: получено",
      `Дата согласия (UTC): ${payload.consent.acceptedAt}`,
      `Версия согласия: ${payload.consent.version}`,
    ].join("\n"),
  }).forEach(([name, value]) => formData.append(name, value));

  // Native FormData avoids the JSON request's CORS preflight.
  await postSubmission("https://api.web3forms.com/submit", formData);
};

export const sendData = async (payload: NewClientPayload): Promise<void> => {
  if (payload.consent?.accepted !== true) {
    throw new Error("Необходимо согласие на обработку персональных данных.");
  }

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
