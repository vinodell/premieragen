import { useLayoutEffect, useRef, useState } from "react";
import { SECTION_IDS, SECTION_LABELS, TESTIMONIALS } from "../consts";
import type { TestimonialCardProps } from "../types";
import { SectionKicker } from "./SectionKicker";

import "./Feedback.css";

const FeedbackCard = ({ testimonial, index, total }: TestimonialCardProps) => {
  return (
    <article
      className="testimonial-card"
      aria-roledescription="слайд"
      aria-label={`${index + 1} из ${total}: ${testimonial.name}`}
    >
      <header className="testimonial-context">
        <div className="testimonial-industry">
          <span className="testimonial-label">Область / компания</span>
          <h3>{testimonial.name}</h3>
          <p>{testimonial.company}</p>
          {testimonial.role && <p>{testimonial.role}</p>}
        </div>
        <div className="testimonial-direction">
          <span className="testimonial-label">Направление работы</span>
          <p>{testimonial.service}</p>
        </div>
        <span className="testimonial-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </header>
      <div className="testimonial-story">
        <span className="testimonial-quote-mark" aria-hidden="true">
          “
        </span>
        <div
          className="testimonial-quote-scroll"
          tabIndex={0}
          role="region"
          aria-label={`Текст отзыва: ${testimonial.name}`}
        >
          <blockquote>{testimonial.quote}</blockquote>
        </div>
      </div>
    </article>
  );
};

export const Feedback = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const card = track?.children.item(activeIndex);
    if (!track || !(card instanceof HTMLElement)) return;

    const updateHeight = () => {
      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      track.style.setProperty(
        "--testimonial-height",
        `${card.getBoundingClientRect().height / rootFontSize}rem`,
      );
    };

    updateHeight();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateHeight);
    observer.observe(card);
    return () => observer.disconnect();
  }, [activeIndex]);

  const goToSlide = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth });
  };

  return (
    <section
      className="testimonials section-pad"
      id={SECTION_IDS.testimonials}
      aria-labelledby="testimonials-title"
      aria-roledescription="карусель"
    >
      <SectionKicker index={SECTION_LABELS.testimonials.index}>
        {SECTION_LABELS.testimonials.title}
      </SectionKicker>
      <div className="testimonials-heading">
        <h2 id="testimonials-title">
          Лучше нас —<br />
          <em>наши клиенты</em>
        </h2>
        <p>
          За каждым проектом — люди.
          <br />
          За каждым отзывом — совместная работа.
        </p>
      </div>
      <div className="testimonials-toolbar">
        <div className="testimonials-controls">
          <span
            className="testimonials-counter"
            aria-live="polite"
            aria-atomic="true"
          >
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(TESTIMONIALS.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            aria-label="Предыдущий отзыв"
            aria-controls="testimonials-track"
            disabled={activeIndex === 0}
            onClick={() => goToSlide(activeIndex - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Следующий отзыв"
            aria-controls="testimonials-track"
            disabled={activeIndex === TESTIMONIALS.length - 1}
            onClick={() => goToSlide(activeIndex + 1)}
          >
            →
          </button>
        </div>
      </div>
      <div
        className="testimonials-track"
        id="testimonials-track"
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label="Отзывы клиентов, используйте стрелки или прокрутку"
        onScroll={(event) => {
          const track = event.currentTarget;
          if (track.clientWidth) {
            setActiveIndex(
              Math.max(
                0,
                Math.min(
                  TESTIMONIALS.length - 1,
                  Math.round(track.scrollLeft / track.clientWidth),
                ),
              ),
            );
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            goToSlide(
              Math.max(
                0,
                Math.min(
                  TESTIMONIALS.length - 1,
                  activeIndex + (event.key === "ArrowRight" ? 1 : -1),
                ),
              ),
            );
          }
        }}
      >
        {TESTIMONIALS.map((testimonial, index) => (
          <FeedbackCard
            key={testimonial.id}
            testimonial={testimonial}
            index={index}
            total={TESTIMONIALS.length}
          />
        ))}
      </div>
      <div className="testimonials-pagination" aria-label="Выбрать отзыв">
        {TESTIMONIALS.map((testimonial, index) => (
          <button
            key={testimonial.id}
            type="button"
            aria-label={`Отзыв ${index + 1}: ${testimonial.name}`}
            aria-current={activeIndex === index ? "true" : undefined}
            aria-controls="testimonials-track"
            onClick={() => goToSlide(index)}
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  );
};
