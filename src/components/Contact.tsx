import "./Contact.css";
import type { FormEvent } from "react";
import { CONTACT_EMAIL, CONTACT_MESSAGE_ROWS, SECTION_IDS, SECTION_LABELS } from "../consts";
import { SectionKicker } from "./SectionKicker";

export const Contact = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
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
            <textarea
              name="message"
              rows={CONTACT_MESSAGE_ROWS}
              placeholder="Например, снизить стоимость заявки"
            />
          </label>
          <button className="button button-dark" type="submit">
            Отправить запрос <span>↗</span>
          </button>
        </form>
      </div>
    </section>
  );
};
