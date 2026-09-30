import type { ComponentType, ReactNode, SVGProps } from "react";

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export type ServiceTone = "teal" | "blue" | "pink" | "black";

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

export type CompanyIconProps = SVGProps<SVGSVGElement>;

export interface Client {
  readonly name: string;
  readonly Icon: ComponentType<CompanyIconProps>;
}

export interface Testimonial {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
  readonly service: string;
  readonly quote: string;
  readonly photo?: string;
}

export interface TestimonialCardProps {
  readonly testimonial: Testimonial;
  readonly index: number;
  readonly total: number;
}

export interface ServiceDiagramNode {
  readonly id: string;
  readonly lines: readonly string[];
  readonly column: number;
  readonly row: number;
  readonly groups: readonly number[];
}

export interface ServiceDiagramConnection {
  readonly group: number;
  readonly paths: readonly string[];
}
