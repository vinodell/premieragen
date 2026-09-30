import { useEffect, useId, useRef, useState } from "react";
import {
  SERVICE_DIAGRAM_CONNECTIONS,
  SERVICE_DIAGRAM_CYCLE_PAUSE_MS,
  SERVICE_DIAGRAM_GROUP_COUNT,
  SERVICE_DIAGRAM_NODES,
  SERVICE_DIAGRAM_STEP_MS,
} from "../consts";
import "./ServiceDiagram.css";

export const ServiceDiagram = () => {
  const titleId = useId();
  const descriptionId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeGroup, setActiveGroup] = useState(1);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (
      typeof window.matchMedia !== "function" ||
      typeof IntersectionObserver === "undefined"
    ) {
      setReducedMotion(true);
      return;
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      preference.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (paused || !visible || reducedMotion) return;
    const timeout = window.setTimeout(
      () =>
        setActiveGroup((group) => (group % SERVICE_DIAGRAM_GROUP_COUNT) + 1),
      SERVICE_DIAGRAM_STEP_MS +
        (activeGroup === SERVICE_DIAGRAM_GROUP_COUNT
          ? SERVICE_DIAGRAM_CYCLE_PAUSE_MS
          : 0),
    );
    return () => window.clearTimeout(timeout);
  }, [activeGroup, paused, visible, reducedMotion]);

  return (
    <div className="service-diagram" ref={containerRef}>
      <div
        className="service-diagram-viewport"
        tabIndex={0}
        role="group"
        aria-label="Схема услуг — на небольшом экране доступна горизонтальная прокрутка"
      >
        <svg
          className="service-diagram-canvas"
          viewBox="0 0 700 687"
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
        >
          <title id={titleId}>Услуги как единая система</title>
          <desc id={descriptionId}>
            Карточки маркетинговых услуг связаны в группы. Подсветка
            последовательно показывает совместную работу направлений.
          </desc>
          {SERVICE_DIAGRAM_CONNECTIONS.map(({ group, paths }) => (
            <g
              key={group}
              className={`service-diagram-links${reducedMotion || activeGroup === group ? " is-active" : ""}`}
            >
              {paths.map((path) => (
                <path key={path} d={path} pathLength={1} />
              ))}
            </g>
          ))}
          {SERVICE_DIAGRAM_NODES.map(({ id, lines, column, row, groups }) => (
            <g
              key={id}
              transform={`translate(${column * 119} ${row * 117})`}
              className={`service-diagram-node${groups.includes(activeGroup) && !reducedMotion ? " is-active" : ""}`}
            >
              <path d="M 0 0 H 82 L 102 20 V 102 H 0 Z" />
              <text x="11" y="68">
                {lines.map((line, index) => (
                  <tspan key={line} x="11" dy={index === 0 ? 0 : 17}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <button
        className="service-diagram-toggle"
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? "Продолжить анимацию →" : "Пауза анимации Ⅱ"}
      </button>
    </div>
  );
};
