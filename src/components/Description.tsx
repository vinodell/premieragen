import { ServiceDiagram } from "./ServiceDiagram";
import { SECTION_IDS, SECTION_LABELS } from "../consts";
import { SectionKicker } from "./SectionKicker";

import "./Description.css";

export const Description = () => {
  return (
    <section className="intro section-pad" id={SECTION_IDS.approach}>
      <SectionKicker index={SECTION_LABELS.approach.index}>
        {SECTION_LABELS.approach.title}
      </SectionKicker>
      <div className="intro-grid">
        <h2>
          Вашему бизнесу
          <br />
          нужны <em>не клики.</em>
        </h2>
        <div className="intro-copy">
          <ServiceDiagram />
          <a className="text-link" href={`#${SECTION_IDS.services}`}>
            Посмотреть, как работаем <span>↘</span>
          </a>
        </div>
      </div>
    </section>
  );
};
