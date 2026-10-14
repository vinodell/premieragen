import {
  BRAND,
  CONTACT_EMAIL,
  TELEGRAM_URL,
  SECTION_IDS,
  PERSONAL_DATA_DOCUMENT_URLS,
} from "../consts";
import { Brand } from "./Brand";

import "./Footer.css";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <a
        className="brand"
        href={`#${SECTION_IDS.top}`}
        aria-label={`${BRAND.name} — в начало`}
      >
        <Brand />
      </a>
      <p>
        Growth marketing
        <br />
        for ambitious businesses.
      </p>
      <div>
        <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">
          Telegram ↗
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`}>Email ↗</a>
        <a
          href={PERSONAL_DATA_DOCUMENT_URLS.policy}
          target="_blank"
          rel="noopener noreferrer"
        >
          Политика обработки данных
        </a>
      </div>
      <span className="footer-year">© {currentYear}</span>
    </footer>
  );
};
