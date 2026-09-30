import { useState } from "react";
import { CLIENTS } from "../consts";
import "./ClientStrip.css";

export const ClientStrip = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section
      className="logo-strip"
      aria-label="Компании, с которыми мы работали"
    >
      <div className="logo-strip-heading">
        <p>
          Опыт людей
          <br />
          из команд
        </p>
        <button
          className="logo-strip-toggle"
          type="button"
          aria-label="Приостановить ленту компаний"
          aria-pressed={isPaused}
          aria-controls="client-track"
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? "Продолжить →" : "Пауза Ⅱ"}
        </button>
      </div>
      <div className="logo-viewport">
        <div
          className={`logo-track${isPaused ? " is-paused" : ""}`}
          id="client-track"
        >
          <ul className="logo-group" aria-label="Компании">
            {CLIENTS.map(({ name, Icon }) => (
              <li className="logo-item" key={name}>
                <Icon
                  className="logo-icon"
                  aria-hidden="true"
                  focusable="false"
                />
                <span>{name}</span>
              </li>
            ))}
          </ul>
          <ul className="logo-group logo-group-copy" aria-hidden="true">
            {CLIENTS.map(({ name, Icon }) => (
              <li className="logo-item" key={name}>
                <Icon
                  className="logo-icon"
                  aria-hidden="true"
                  focusable="false"
                />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
