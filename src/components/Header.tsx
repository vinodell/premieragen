import { Brand } from "./Brand";
import "./Header.css";
import { NAV_ITEMS, BRAND, SECTION_IDS } from "../consts";

export const Header = () => {
  return (
    <header className="site-header">
      <a className="brand" href={`#${SECTION_IDS.top}`} aria-label={`${BRAND.name} — в начало`}>
        <Brand />
      </a>
      <nav className="main-nav" aria-label="Основная навигация">
        {NAV_ITEMS.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="button button-dark button-small" href={`#${SECTION_IDS.contact}`}>
        Обсудить задачу <span>↗</span>
      </a>
    </header>
  );
};
