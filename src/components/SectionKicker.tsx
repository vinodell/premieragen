import type { SectionKickerProps } from "../types";
import "./SectionKicker.css";

export const SectionKicker = ({ index, children, light = false }: SectionKickerProps) => (
  <div className={`section-kicker${light ? " light" : ""}`}>
    <span>{index}</span>
    <span>{children}</span>
  </div>
);
