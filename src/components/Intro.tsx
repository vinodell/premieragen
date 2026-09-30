import { BRAND, HERO_IMAGE, SECTION_IDS } from "../consts";

import "./Intro.css";

export const Intro = () => {
  return (
    <section className="hero section-pad" aria-labelledby="hero-title">
      <div className="image-container">
        <img src={HERO_IMAGE.src} alt={HERO_IMAGE.alt} />
        <h1
          className="hero-image-title"
          id="hero-title"
          aria-label={BRAND.name}
        >
          {BRAND.firstLine}
          <br />
          {BRAND.secondLine}
        </h1>
        <div className="hero-image-description">
          <p className="hero-image-lead">
            Мы собрали сильнейших digital-экспертов в одну команду
          </p>
          <p>
            Опыт Яндекса, Avito, СберМаркетинга, OMD и Publicis — теперь
            работает на задачи вашего бизнеса.
          </p>
        </div>
      </div>
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="eyebrow-dot" /> Independent growth team ·
          Санкт-Петербург / online
        </p>
        <div className="hero-bottom">
          <p className="hero-intro">
            Соединяем стратегию, performance и клиентский опыт, чтобы превращать
            внимание в измеримый рост.
          </p>
          <a className="text-link" href={`#${SECTION_IDS.contact}`}>
            Забронировать слот под звонок <span>↗</span>
          </a>
        </div>
      </div>
      <div className="hero-sticker" aria-hidden="true">
        GO
        <br />
        FURTHER<span>✳</span>
      </div>
      <div className="hero-note" aria-hidden="true">
        01 / 04
        <br />
        <strong>
          attention
          <br />
          to detail
        </strong>
      </div>
      <div className="scroll-cue">
        <span>↓</span> scroll to explore
      </div>
    </section>
  );
};
