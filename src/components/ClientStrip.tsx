import { useEffect, useRef, useState } from "react";
import { CLIENTS } from "../consts";

import "./ClientStrip.css";

export const ClientStrip = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let isInViewport = false;
    const updateAnimation = () => {
      setShouldAnimate(isInViewport && document.visibilityState === "visible");
    };
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(([entry]) => {
            isInViewport = entry.isIntersecting;
            updateAnimation();
          })
        : undefined;

    if (observer) {
      observer.observe(viewport);
    } else {
      isInViewport = true;
      updateAnimation();
    }
    document.addEventListener("visibilitychange", updateAnimation);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", updateAnimation);
    };
  }, []);

  return (
    <section
      className="logo-strip"
      aria-label="Компании, с которыми мы работали"
    >
      <div className="logo-strip-heading">
        <p>
          наш профессиональный
          <br />
          опыт
        </p>
        <button
          className="logo-strip-toggle"
          type="button"
          aria-label={
            isPaused
              ? "Продолжить ленту компаний"
              : "Приостановить ленту компаний"
          }
          aria-pressed={isPaused}
          aria-controls="client-track"
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? "Продолжить →" : "Пауза Ⅱ"}
        </button>
      </div>
      <div className="logo-viewport" ref={viewportRef}>
        <div
          className={`logo-track${isPaused || !shouldAnimate ? " is-paused" : ""}`}
          id="client-track"
        >
          <ul className="logo-group" aria-label="Компании">
            {CLIENTS.map(({ id, name, width, height, showName }) => (
              <li className="logo-item" key={id}>
                <img
                  className="logo-icon"
                  src={`${process.env.PUBLIC_URL || ""}/clients/${id}.svg`}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  style={{ width, height }}
                />
                <span>
                  {showName === false ? (
                    <span className="visually-hidden">{name}</span>
                  ) : (
                    name
                  )}
                </span>
              </li>
            ))}
          </ul>
          <ul className="logo-group logo-group-copy" aria-hidden="true">
            {CLIENTS.map(({ id, name, width, height, showName }) => (
              <li className="logo-item" key={id}>
                <img
                  className="logo-icon"
                  src={`${process.env.PUBLIC_URL || ""}/clients/${id}.svg`}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  style={{ width, height }}
                />
                <span>{showName === false ? "" : name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
