import { getLocalDateTimeMin } from "../utils/dateTime";
import { EmailIcon, TelegramLogo } from "../icons";
import { useRef, useState, type FormEvent } from "react";
import { sendData } from "../api";
import {
  CONTACT_EMAIL,
  TELEGRAM_URL,
  CONTACT_REQUEST_OPTIONS,
  SECTION_IDS,
  SECTION_LABELS,
} from "../consts";
import { SectionKicker } from "./SectionKicker";

import "./Contact.css";

export const Contact = () => {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const sending = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending.current) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const feature = String(data.get("feature") ?? "");
    const date = String(data.get("appointment") ?? "");
    const appointment = form.elements.namedItem("appointment");
    const nameInput = form.elements.namedItem("name");

    if (nameInput instanceof HTMLInputElement) {
      nameInput.setCustomValidity(name ? "" : "Введите имя.");
    }
    if (appointment instanceof HTMLInputElement) {
      const selectedTime = new Date(date).getTime();
      appointment.setCustomValidity(
        Number.isFinite(selectedTime) && selectedTime > Date.now()
          ? ""
          : "Выберите будущую дату и время.",
      );
    }
    if (!form.reportValidity()) return;

    sending.current = true;
    setStatus("sending");
    try {
      await sendData({
        name,
        email,
        feature,
        date: new Date(date).toISOString(),
      });
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  };

  return (
    <section className="contact-section section-pad" id={SECTION_IDS.contact}>
      <div className="contact-head">
        <SectionKicker index={SECTION_LABELS.contact.index}>
          {SECTION_LABELS.contact.title}
        </SectionKicker>
        <h2>
          Расскажите,
          <br />
          <em>что строите</em>
        </h2>
      </div>
      <div className="contact-grid">
        <div>
          <p className="lead">
            Оставьте контакты — вернёмся с планом аудита или предложением по
            каналу, который даст вашему бизнесу следующий рывок.
          </p>
          <p className="contact-meta">
            Обычно отвечаем в течение рабочего дня
            <br />
            <a className="contact-telegram" href={`mailto:${CONTACT_EMAIL}`}>
              <EmailIcon aria-hidden="true" focusable="false" />
              <span>{CONTACT_EMAIL}</span>
            </a>
          </p>
          <a
            className="contact-telegram"
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в Telegram — откроется в новой вкладке"
          >
            <TelegramLogo aria-hidden="true" focusable="false" />
            <span>
              Написать в Telegram <span aria-hidden="true">↗</span>
            </span>
          </a>
        </div>
        <form
          className="contact-form"
          onSubmit={handleSubmit}
          aria-busy={status === "sending"}
        >
          <label>
            Ваше имя
            <input
              type="text"
              name="name"
              autoComplete="name"
              maxLength={100}
              onChange={(event) => event.currentTarget.setCustomValidity("")}
              placeholder="Как к Вам можно обращаться?"
              required
            />
          </label>
          <label>
            Рабочий email
            <input
              type="email"
              name="email"
              autoComplete="email"
              maxLength={254}
              placeholder="name@company.ru"
              required
            />
          </label>
          <label>
            Что нужно улучшить?
            <select name="feature" defaultValue="" required>
              <option value="" disabled>
                Выберите задачу
              </option>
              {CONTACT_REQUEST_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Удобная дата и время звонка
            <input
              type="datetime-local"
              name="appointment"
              required
              min={getLocalDateTimeMin()}
              aria-describedby="appointment-hint"
              onFocus={(event) => {
                event.currentTarget.min = getLocalDateTimeMin();
              }}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
              }}
            />
          </label>
          <button
            className="button button-dark"
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Отправляем…" : "Отправить запрос"}{" "}
            <span aria-hidden="true">↗</span>
          </button>
          <p className="contact-form-message" role="status">
            {status === "success" &&
              "Заявка отправлена! Скоро свяжемся с вами."}
            {status === "error" &&
              "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram."}
          </p>
        </form>
      </div>
    </section>
  );
};
