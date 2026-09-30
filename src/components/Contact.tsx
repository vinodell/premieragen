import { getLocalDateTimeMin } from "../utils/dateTime";
import { EmailIcon } from "./icons/EmailIcon";
import { TelegramLogo } from "./icons/TelegramLogo";
import "./Contact.css";
import type { FormEvent } from "react";
import { CONTACT_EMAIL, TELEGRAM_URL, CONTACT_REQUEST_OPTIONS, SECTION_IDS, SECTION_LABELS } from "../consts";
import { SectionKicker } from "./SectionKicker";

export const Contact = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const appointment = event.currentTarget.elements.namedItem("appointment");
    if (appointment instanceof HTMLInputElement && appointment.value) {
      const selectedTime = new Date(appointment.value).getTime();
      if (!Number.isFinite(selectedTime) || selectedTime <= Date.now()) {
        appointment.setCustomValidity("Выберите будущую дату и время.");
        appointment.reportValidity();
        return;
      }
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
          <em>что строите.</em>
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
            <span>Написать в Telegram <span aria-hidden="true">↗</span></span>
          </a>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Ваше имя
            <input
              type="text"
              name="name"
              placeholder="Как к Вам можно обращаться?"
              required
            />
          </label>
          <label>
            Рабочий email
            <input
              type="email"
              name="email"
              placeholder="name@company.ru"
              required
            />
          </label>
          <label>
            Что нужно улучшить?
            <select name="message" defaultValue="">
              <option value="" disabled>Выберите задачу</option>
              {CONTACT_REQUEST_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Удобная дата и время звонка
            <input
              type="datetime-local"
              name="appointment"
              min={getLocalDateTimeMin()}
              aria-describedby="appointment-hint"
              onFocus={(event) => {
                event.currentTarget.min = getLocalDateTimeMin();
              }}
              onChange={(event) => event.currentTarget.setCustomValidity("")}
            />
          </label>
          <input type="hidden" name="timeZone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
          <button className="button button-dark" type="submit">
            Отправить запрос <span>↗</span>
          </button>
        </form>
      </div>
    </section>
  );
};
