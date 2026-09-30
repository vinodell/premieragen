import type { ReactNode } from "react";

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export type ServiceTone = "teal" | "blue" | "pink";

export interface Service {
  readonly index: string;
  readonly title: string;
  readonly text: string;
  readonly tone: ServiceTone;
}

export interface ProofStat {
  readonly value: string;
  readonly label: string;
}

export interface SectionKickerProps {
  readonly index: string;
  readonly children: ReactNode;
  readonly light?: boolean;
}
