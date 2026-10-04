import { CompanyIcon } from "./icons";
import type {
  ServiceDiagramNode,
  ServiceDiagramConnection,
  Client,
  NavItem,
  ProofStat,
  Service,
  Testimonial,
} from "./types";

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
  testimonials: "testimonials",
} as const;

export const SECTION_LABELS = {
  approach: { index: "01", title: "Мыслим как in-house" },
  services: { index: "02", title: "Что меняется" },
  cases: { index: "03", title: "Цифры говорят громче" },
  testimonials: { index: "04", title: "Люди о работе с нами" },
  contact: { index: "05", title: "Let's make it move" },
} as const;

export const HERO_IMAGE = {
  src: `${process.env.PUBLIC_URL || ""}/kate8.png`,
  alt: "Катя, специалист по маркетингу",
} as const;

export const COPYRIGHT_YEAR = 2026;
export const CONTACT_REQUEST_OPTIONS = [
  "аудит текущей рекламы",
  "сайт есть, мало продаж",
  "нужен сайт и запуск рекламы",
  "продвижение на маркетплейсах",
  "запуск нового бизнеса",
  "brand experience/мероприятие",
  "другое, нашепчу на ушко",
] as const;

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Подход", href: `#${SECTION_IDS.approach}` },
  { label: "Услуги", href: `#${SECTION_IDS.services}` },
  { label: "Опыт", href: `#${SECTION_IDS.cases}` },
];

export const CLIENTS: readonly Client[] = [
  { name: "Яндекс", Icon: CompanyIcon },
  { name: "Avito", Icon: CompanyIcon },
  { name: "СберМаркетинг", Icon: CompanyIcon },
  { name: "OMD", Icon: CompanyIcon },
  { name: "Publicis Group", Icon: CompanyIcon },
  { name: "PepsiCo", Icon: CompanyIcon },
  { name: "Lamoda", Icon: CompanyIcon },
  { name: "SOKOLOV", Icon: CompanyIcon },
  { name: "Золотое Яблоко", Icon: CompanyIcon },
  { name: "Alrosa Diamonds", Icon: CompanyIcon },
  { name: "585 GOLD", Icon: CompanyIcon },
  { name: "12 STOREEZ", Icon: CompanyIcon },
  { name: "ЦУМ", Icon: CompanyIcon },
  { name: "Т‑Банк", Icon: CompanyIcon },
  { name: "Совкомбанк", Icon: CompanyIcon },
  { name: "Альфа‑Банк", Icon: CompanyIcon },
  { name: "BORK", Icon: CompanyIcon },
  { name: "Иль де Боте", Icon: CompanyIcon },
  { name: "Лэтуаль", Icon: CompanyIcon },
  { name: "Рив Гош", Icon: CompanyIcon },
  { name: "X5 Retail Group", Icon: CompanyIcon },
  { name: "Максидом", Icon: CompanyIcon },
  { name: "Hoff", Icon: CompanyIcon },
  { name: "Simple Wine", Icon: CompanyIcon },
  { name: "Эвалар", Icon: CompanyIcon },
  { name: "Биннофарм Групп", Icon: CompanyIcon },
  { name: "36,6", Icon: CompanyIcon },
  { name: "ФармСтандарт", Icon: CompanyIcon },
  { name: "ЗдравСити", Icon: CompanyIcon },
  { name: "Самолет", Icon: CompanyIcon },
  { name: "ПИК", Icon: CompanyIcon },
  { name: "ДонСтрой", Icon: CompanyIcon },
  { name: "LEGENDA", Icon: CompanyIcon },
  { name: "Инвитро", Icon: CompanyIcon },
  { name: "Аскона", Icon: CompanyIcon },
  { name: "М.Видео", Icon: CompanyIcon },
  { name: "Вин Лаб", Icon: CompanyIcon },
  { name: "Акрихин", Icon: CompanyIcon },
  { name: "Лемана ПРО", Icon: CompanyIcon },
  { name: "Бургер Кинг", Icon: CompanyIcon },
  { name: "Светофор", Icon: CompanyIcon },
  { name: "Комус", Icon: CompanyIcon },
  { name: "LibreDerm", Icon: CompanyIcon },
  { name: "Улыбка Радуги", Icon: CompanyIcon },
  { name: "Бронхипрет", Icon: CompanyIcon },
  { name: "БКС", Icon: CompanyIcon },
  { name: "Самокат", Icon: CompanyIcon },
  { name: "Profi.ru", Icon: CompanyIcon },
  { name: "SKILLBOX", Icon: CompanyIcon },
  { name: "Петровакс", Icon: CompanyIcon },
  { name: "Bausch", Icon: CompanyIcon },
  { name: "World Class", Icon: CompanyIcon },
  { name: "Апельсин", Icon: CompanyIcon },
  { name: "Ivi", Icon: CompanyIcon },
  { name: "Okko", Icon: CompanyIcon },
  { name: "Rendez-Vous", Icon: CompanyIcon },
  { name: "Спортмастер", Icon: CompanyIcon },
  { name: "La Redoute", Icon: CompanyIcon },
  { name: "Love Republic", Icon: CompanyIcon },
  { name: "Сантехника онлайн", Icon: CompanyIcon },
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
    tone: "black",
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

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "audit_1",
    name: "НЕДВИЖИМОСТЬ",
    role: "",
    company: "Девелопер / недвижимость",
    service: "Рост лидов · CPA -20% · больше сделок",
    quote:
      "Сначала казалось, что проблема в объёме трафика. В итоге оказалось — в том, как мы его покупаем. Premier пересобрали рекламные кампании, адаптировали сайт под реальный путь клиента и оптимизировали CPA на 20%. При этом кратно выросло количество качественных лидов и сделок.",
  },
  {
    id: "audit_2",
    name: "АВТО",
    role: "",
    company: "Дистрибуция автотранспортных средств",
    service: "Масштабирование РК · рост лидов · маржинальность",
    quote:
      "До Premier мы просто старались получить больше лидов. Вместе с ними впервые начали смотреть на экономику целиком. Масштабировали рекламные кампании, перераспределили бюджет в пользу эффективных каналов и в итоге не только выросли в лидах, но и улучшили маржинальность.",
  },
  {
    id: "audit_3",
    name: "ФАРМА",
    role: "",
    company: "Biotech / Биофармацевтика",
    service: "Digital strategy · оптимизация воронки · эффективность рекламы",
    quote:
      "Для нас было важно не просто увеличить объём трафика, а сохранить качество и управляемость результата. Команда Premier быстро погрузилась в специфику категории, пересобрала digital-воронку и предложила изменения на сайте. В результате получили более качественные лиды и существенно улучшили эффективность рекламных инвестиций.",
  },
  {
    id: "audit_4",
    name: "RETAIL",
    role: "",
    company: "Retail / e-commerce",
    service: "Адаптация сайта · рост лидов · оптимизация воронки",
    quote:
      "Честно говоря, сначала мы думали, что нам просто нужно больше рекламы. Premier показали, где мы теряем клиента ещё до заявки. Адаптировали сайт, пересобрали рекламные кампании и наконец-то связали маркетинг с продажами. Лидов стало кратно больше, а главное — они стали заметно качественнее.",
  },
  {
    id: "audit_5",
    name: "Fashion brand",
    role: "",
    company: "Retail / e-commerce",
    service: "Performance · масштабирование · рост эффективности",
    quote:
      "В агентстве очень быстро поняли наш бренд и при этом не стали делать маркетинг ради маркетинга. Пересобрали performance-часть, масштабировали кампании и помогли выстроить более эффективный customer journey. В итоге выросли и объёмы, и экономика — при этом сохранили необходимое нам качество люкс аудитории. С командой приятно работать - говорят на языке бизнеса",
  },
  {
    id: "audit_6",
    name: "CEO / собственник бизнеса",
    role: "",
    company: "БтиЭ",
    service: "Стратегия · performance · рост бизнеса",
    quote:
      "Приятно поработать с ребятами из Яндекса - невозможно представить сколько они бы стоили в штате. Наконец-то появился подрядчик, который говорит не “давайте увеличим трафик”, а “давайте посмотрим, где вы теряете деньги”. После этого всё стало гораздо интереснее. Сначала я думал, что ребята просто хорошо умеют настраивать рекламу. Оказалось, что они гораздо глубже смотрят на бизнес. Где-то поменяли кампании, где-то сайт, где-то саму логику воронки. Сами настаивают на снижении бюджетов. Удивительно. В итоге кратно приросли в лидах и сделках, масштабировали РК и при этом не потеряли маржинальность.",
  },
  // {
  //   id: "audit-demo",
  //   name: "Твоя мамаша",
  //   role: "Та, что хуячила тебя тапком",
  //   company: "Компания / Retail",
  //   service: "Положительная динамика отрицательного роста",
  //   quote:
  //     "Сначала думала, опять хуйнёй занимаются. Потом посмотрела цифры — хуйнёй, конечно, но уже прибыльной.",
  // },
  // {
  //   id: "audit-demo",
  //   name: "Доча",
  //   role: "Самая младшая. По развитию тоже",
  //   company: "Компания / Retail",
  //   service: "Папина гордость до 18 лет",
  //   quote:
  //     "Я провела конкурентный анализ. У конкурентки сумка дороже. Работаем.",
  // },
  // {
  //   id: "performance-demo",
  //   name: "Батя",
  //   role: "Ушел из дома",
  //   company: "Компания / E-commerce",
  //   service: "хуярить пивко на диване",
  //   quote:
  //     "Появилось ощущение... хочется посрать в унитаз, а не в штаны. В целом, доволен.",
  // },
  // {
  //   id: "performance-demo",
  //   name: "Брат",
  //   role: "Ушел из дома",
  //   company: "Компания / E-commerce",
  //   service: "Перенос задач на понедельник с 2007 года",
  //   quote:
  //     "Раньше я просто не понимал, что происходит. После консультации понял, что не понимаю системно.",
  // },
];

export const SERVICE_DIAGRAM_GROUP_COUNT = 5;
export const SERVICE_DIAGRAM_STEP_MS = 3000;
export const SERVICE_DIAGRAM_CYCLE_PAUSE_MS = 1000;

export const SERVICE_DIAGRAM_NODES: readonly ServiceDiagramNode[] = [
  { id: "marketing", lines: ["Маркетинг", "стратегия"], column: 2, row: 0, groups: [5] },
  { id: "web-design", lines: ["Веб-", "дизайн"], column: 0, row: 1, groups: [1] },
  { id: "content", lines: ["Создание", "контента"], column: 3, row: 1, groups: [1] },
  { id: "social", lines: ["Социальные", "сети"], column: 4, row: 1, groups: [3] },
  { id: "brand-strategy", lines: ["Стратегия", "бренда"], column: 1, row: 2, groups: [2] },
  { id: "seo", lines: ["SEO-", "продвижение"], column: 2, row: 2, groups: [5] },
  { id: "video", lines: ["Видео-", "маркетинг"], column: 3, row: 2, groups: [] },
  { id: "ppc", lines: ["Контекстная", "реклама"], column: 5, row: 2, groups: [3] },
  { id: "identity", lines: ["Айдентика", "бренда"], column: 0, row: 3, groups: [2, 4] },
  { id: "email", lines: ["Email-", "маркетинг"], column: 3, row: 3, groups: [5] },
  { id: "pr", lines: ["PR и", "коммуникации"], column: 2, row: 4, groups: [2, 4] },
  { id: "development", lines: ["Разработка", "сайтов"], column: 3, row: 4, groups: [] },
  { id: "campaign", lines: ["Рекламная", "стратегия"], column: 4, row: 4, groups: [3] },
  { id: "support", lines: ["Поддержка", "проектов"], column: 1, row: 5, groups: [] },
  { id: "ux", lines: ["UX-", "аудит"], column: 4, row: 5, groups: [] },
  { id: "print", lines: ["Печатный", "дизайн"], column: 5, row: 5, groups: [] },
];

export const SERVICE_DIAGRAM_CONNECTIONS: readonly ServiceDiagramConnection[] =
  [
    { group: 1, paths: ["M 102 168 H 357"] },
    {
      group: 2,
      paths: ["M 170 336 V 402 H 102", "M 170 336 V 402 H 289 V 468"],
    },
    { group: 3, paths: ["M 527 219 V 468", "M 595 285 H 534 V 468"] },
    { group: 4, paths: ["M 51 453 V 519 H 238"] },
    { group: 5, paths: ["M 289 102 V 402 H 357"] },
  ];

export const telegramApi = "https://premier.max-khamitov.workers.dev/";

export interface TelegramResponse {
  readonly success: boolean;
  readonly error?: string;
}

export interface NewClientPayload {
  readonly name: string;
  readonly email: string;
  readonly date: string;
  readonly feature: string;
}
