import { BRAND } from "../consts";
import "./Brand.css";

export const Brand = () => {
  return (
    <span className="brand-mark-wrap">
      <span className="brand-mark">{BRAND.mark}</span>
      <span>
        {BRAND.firstLine}
        <br />
        {BRAND.secondLine}
      </span>
    </span>
  );
};

