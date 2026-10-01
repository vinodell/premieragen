import type { CompanyIconProps } from "../types";

export const CompanyIcon = (props: CompanyIconProps) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="5"
      y="5"
      width="22"
      height="22"
      rx="6"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M11 21V11h10v10M16 11v10M11 16h10"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
