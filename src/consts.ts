import type { NavItem, ProofStat, Service } from "./types";

export const BRAND = {
  name: "Premier Agency",
  mark: "P",
  firstLine: "premier",
  secondLine: "agency",
} as const;

export const SECTION_IDS = {
  top: "top",
  approach: "approach",
  services: "services",
  cases: "cases",
  contact: "contact",
} as const;

export const SECTION_LABELS = {
  approach: { index: "01", title: "Мыслим как in-house" },
  services: { index: "02", title: "Что меняется" },
  cases: { index: "03", title: "Цифры говорят громче" },
  contact: { index: "04", title: "Let's make it move" },
} as const;

export const HERO_IMAGE = {
  src: `${process.env.PUBLIC_URL || ""}/kate.png`,
  alt: "Катя, специалист по маркетингу",
} as const;

export const COPYRIGHT_YEAR = 2026;
export const CONTACT_MESSAGE_ROWS = 3;

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Подход", href: `#${SECTION_IDS.approach}` },
  { label: "Услуги", href: `#${SECTION_IDS.services}` },
  { label: "Опыт", href: `#${SECTION_IDS.cases}` },
];

// TODO:
// Яндекс, Сбер, СберМаркетинг, PepsiCo, Lamoda, 
// SOKOLOV, Золотое Яблоко, Alrosa Diamonds, 585 GOLD, 
// BORK, 12 STOREEZ, ЦУМ, Т‑Банк, Совкомбанк, Альфа‑Банк, 
// Иль де Боте, Лэтуаль, Рив Гош, X5 Retail Group, Максидом, 
// Все Инструменты, Hoff, Simple Wine, Биннофарм Групп, Эвалар, 
// 36,6, ФармСтандарт, ЗдравСити, Самолет
// ПИК, ДонСтрой, LEGENDA, Инвитро, Аскона, М.Видео, 
// Вин Лаб, Акрихин, Лемана ПРО, Бургер Кинг, Светофор, 
// Комус, LibreDerm, Улыбка Радуги, Бронхипрет, БКС, Самокат, 
// Profi.ru, SKILLBOX, Петровакс, Bausch, World Class, Апельсин, 
// Ivi, Okko, Rendez-Vous, Спортмастер, La Redoute, Love Republic, 
// Сантехника Онлайн и другие.

// Бегущая строка
// поменяем на лого

export const CLIENTS: readonly string[] = [
  "Яндекс",
  "Avito",
  "СберМаркетинг",
  "OMD",
  "Publicis Group",
  "PepsiCo",
  "Lamoda",
  "SOKOLOV",
];

export const SERVICES: readonly Service[] = [
  {
    index: "01",
    title: "Аудит и точки роста",
    text: "Разбираем воронку, рекламные кабинеты и аналитику. Показываем, где теряются деньги и что даст эффект в ближайшие 3–6 месяцев.",
    tone: "teal",
  },
  {
    index: "02",
    title: "Performance под ключ",
    text: "Подключаем нужные каналы, собираем кампании, контент и отчётность в одну систему с понятными бизнес-метриками.",
    tone: "blue",
  },
  {
    index: "03",
    title: "Digital-стратегия",
    text: "Находим место бренда на рынке и строим план привлечения клиентов: от первого клика до повторной покупки.",
    tone: "pink",
  },
];

export const PROOF_STATS: readonly ProofStat[] = [
  { value: "10+", label: "лет в маркетинге" },
  { value: "15 млрд ₽", label: "рекламных бюджетов" },
  { value: "100+", label: "аудитов и проектов" },
  { value: "40+", label: "enterprise-клиентов" },
];

export const CONTACT_EMAIL = "katieza@me.com";
export const TELEGRAM_URL = "https://t.me/katieza";
