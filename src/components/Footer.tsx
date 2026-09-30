import {
  CONTACT_EMAIL,
  TELEGRAM_URL,
  COPYRIGHT_YEAR,
  SECTION_IDS,
} from "../consts";
import { Brand } from "./Brand";

import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="site-footer">
      <a className="brand" href={`#${SECTION_IDS.top}`}>
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
      </div>
      <span className="footer-year">© {COPYRIGHT_YEAR}</span>
    </footer>
  );
};
