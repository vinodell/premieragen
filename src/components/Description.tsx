import "./Description.css";
import { SECTION_IDS, SECTION_LABELS } from "../consts";
import { SectionKicker } from "./SectionKicker";

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
          <p className="lead">
            Нужны клиенты, продажи и команда, которая видит всю картину.
          </p>
          <p>
            Premier Agency — это senior-специалисты из Яндекса, Avito,
            СберМаркетинга и сетей OMD / Publicis Group. Подключаемся к задаче
            точечно или берём весь digital-контур под ключ.
          </p>
          <a className="text-link" href={`#${SECTION_IDS.services}`}>
            Посмотреть, как работаем <span>↘</span>
          </a>
        </div>
      </div>
    </section>
  );
};
