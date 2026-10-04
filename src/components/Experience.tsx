import { SectionKicker } from "./SectionKicker";
import { PROOF_STATS, SECTION_IDS, SECTION_LABELS } from "../consts";

import "./Experience.css";

export const Experience = () => {
  return (
    <section className="proof-section" id={SECTION_IDS.cases}>
      <div className="proof-art" aria-hidden="true">
        <span className="proof-word">results</span>
        <span className="proof-circle">↗</span>
        <span className="proof-label">
          MEASURE
          <br />
          WHAT
          <br />
          MATTERS
        </span>
      </div>
      <div className="proof-content section-pad">
        <SectionKicker index={SECTION_LABELS.cases.index} light>
          {SECTION_LABELS.cases.title}
        </SectionKicker>
        <h2>
          Опыт, который
          <br />
          <em>работает</em> на вас.
        </h2>
        <p className="proof-text">
          Мы не просто подрядчик по отдельному каналу, а команда уровня IN-HOUSE
          MARKETING DEPARTMENT, которая соединяет стратегию, performance,
          аналитику и клиентский опыт без необходимости содержать ее в штате.
        </p>
        <div className="proof-grid">
          {PROOF_STATS.map(({ value, label }) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
