import "./Services.css";
import { SERVICES, SECTION_IDS, SECTION_LABELS } from "../consts";
import { SectionKicker } from "./SectionKicker";

export const Services = () => {
  return (
    <section className="service-section section-pad" id={SECTION_IDS.services}>
      <SectionKicker index={SECTION_LABELS.services.index}>
        {SECTION_LABELS.services.title}
      </SectionKicker>
      <div className="section-heading-row">
        <h2>
          От первого
          <br />
          <em>вопроса</em> до роста.
        </h2>
        <p>
          Три режима работы.
          <br />
          Одна цель — больше
          <br />
          ценности с каждого визита.
        </p>
      </div>
      <div className="service-grid">
        {SERVICES.map((service) => (
          <article
            className={`service-card ${service.tone}`}
            key={service.index}
          >
            <div className="card-top">
              <span>{service.index}</span>
              <span className="card-arrow">↗</span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <div className="card-line" />
          </article>
        ))}
      </div>
    </section>
  );
};
