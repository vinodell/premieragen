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
  src: `${process.env.PUBLIC_URL || ""}/hero.jpg`,
  srcSet: [640, 960, 1179]
    .map(
      (width) => `${process.env.PUBLIC_URL || ""}/hero-${width}.webp ${width}w`,
    )
    .join(", "),
  width: 1179,
  height: 1334,
  alt: "Катя - основатель Premier Agency",
} as const;

export const CONTACT_REQUEST_OPTIONS = [
  "аудит текущей рекламной кампании",
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
  { id: "yandex", name: "Яндекс" },
  { id: "avito", name: "Avito" },
  { id: "alpha", name: "Альфа‑Банк" },
  { id: "pepsi", name: "PepsiCo" },
  { id: "lamoda", name: "Lamoda" },
  {
    id: "goldenapple",
    name: "Золотое Яблоко",
    width: "3.125rem",
    height: "3.125rem",
  },
  {
    id: "twelvestory",
    name: "12 STOREEZ",
  },
  { id: "dlt", name: "ЦУМ" },
  { id: "tbank", name: "Т‑Банк" },
  {
    id: "simplewine",
    name: "Simple Wine",
  },
  {
    id: "bork",
    name: "BORK",
    width: "8.4375rem",
    height: "6rem",
    showName: false,
  },
  {
    id: "legenda",
    name: "LEGENDA",
    width: "8.4375rem",
    height: "6rem",
    showName: false,
  },
  {
    id: "pik",
    name: "ПИК",
    width: "12.4375rem",
    height: "6rem",
    showName: false,
  },
  {
    id: "laredoute",
    name: "La Redoute",
    width: "8.4375rem",
    height: "6rem",
    showName: false,
  },
  {
    id: "alrosa",
    name: "АЛРОСА",
    width: "18.4375rem",
    height: "6rem",
    showName: false,
  },
  { id: "sber", name: "СберМаркетинг", width: "3.125rem", height: "3.125rem" },
  { id: "omd", name: "OMD" },
  { id: "public", name: "Publicis Group", width: "8.4375rem", height: "6rem" },
  {
    id: "sokolov",
    name: "SOKOLOV",
    width: "8.4375rem",
    height: "6rem",
    showName: false,
  },
  { id: "fivegold", name: "585 GOLD" },
  {
    id: "sovcombank",
    name: "Совкомбанк",
  },
  {
    id: "ildebote",
    name: "ИЛЬ ДЕ БОТЭ",
    showName: false,
  },
  { id: "letual", name: "Лэтуаль" },
  { id: "rivgosh", name: "Рив Гош" },
  {
    id: "xfive",
    name: "Retail Group",
  },
  {
    id: "maksidom",
    name: "Максидом",
    width: "8.4375rem",
    height: "6rem",
    showName: false,
  },
  { id: "hoff", name: "Hoff" },
  {
    id: "evalar",
    name: "Эвалар",
    width: "8.4375rem",
    height: "6rem",
    showName: false,
  },
  {
    id: "threesixsix",
    name: "36,6",
    showName: false,
  },
  {
    id: "pharmstandard",
    name: "Фармстандарт",
    width: "14.0625rem",
    height: "3.4375rem",
    showName: false,
  },
  {
    id: "zdravcity",
    name: "ЗдравСити",
  },
  { id: "samolet", name: "Самолет" },
  { id: "donstroi", name: "ДонСтрой" },
  { id: "invitro", name: "Инвитро" },
  {
    id: "askona",
    name: "Askona",
    width: "10.4375rem",
    height: "6rem",
    showName: false,
  },
  { id: "mvideo", name: "М.Видео" },
  {
    id: "winelab",
    name: "ВинЛаб",
    width: "11.25rem",
    height: "2.25rem",
    showName: false,
  },
  {
    id: "lemanapro",
    name: "Лемана ПРО",
  },
  {
    id: "burgerking",
    name: "Бургер Кинг",
  },
  {
    id: "komus",
    name: "Комус",
    width: "8.4375rem",
    height: "6rem",
    showName: false,
  },
  {
    id: "librederm",
    name: "LIBREDERM",
    width: "5.4375rem",
    height: "6rem",
    showName: false,
  },
  {
    id: "ulibkarainbow",
    name: "Улыбка Радуги",
    width: "3.125rem",
    height: "3.125rem",
  },
  {
    id: "bks",
    name: "БКС",
    width: "10.4375rem",
    height: "6rem",
    showName: false,
  },
  { id: "samokat", name: "Самокат" },
  {
    id: "profi",
    name: "Профи",
    width: "13.125rem",
    height: "2.4375rem",
    showName: false,
  },
  { id: "skillbox", name: "Skillbox" },
  {
    id: "petrowax",
    name: "Петровакс",
    width: "12.4375rem",
    height: "6rem",
    showName: false,
  },
  { id: "worldclass", name: "World Class", width: "6.4375rem", height: "6rem" },
  { id: "ivi", name: "Ivi" },
  { id: "okko", name: "Okko" },
  {
    id: "rendevou",
    name: "Rendez-Vous",
    width: "16.4375rem",
    height: "6rem",
    showName: false,
  },
  {
    id: "sportmaster",
    name: "Спортмастер",
  },
  {
    id: "loverepublic",
    name: "LOVE REPUBLIC",
    width: "12.4375rem",
    height: "6rem",
    showName: false,
  },
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

// Ключ Web3Forms должен быть выпущен для адреса CONTACT_EMAIL.
export const WEB_3_API_ACCESS_KEY = "9f101256-0d34-480c-82a5-c11a314fe841";

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
    service:
      "Масштабирование РК · рост лидов · повышена маржинальность сделок за счет сокращения ДРР (доля рекламных расходов)",
    quote:
      "До Premier мы просто старались получить больше лидов. Вместе с ними впервые начали смотреть на экономику целиком. Масштабировали рекламные кампании, перераспределили бюджет в пользу эффективных каналов и в итоге не только выросли в лидах, но и улучшили маржинальность.",
  },
  {
    id: "audit_3",
    name: "ФАРМА",
    role: "",
    company: "Biotech / Биофармацевтика",
    service:
      "Digital strategy · оптимизация воронки · эффективность отдачи бюджета",
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
    service:
      " Performance · масштабирование · рост эффективности продаж через Яндекс Директ",
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
];

export const SERVICE_DIAGRAM_GROUP_COUNT = 5;
export const SERVICE_DIAGRAM_STEP_MS = 3000;
export const SERVICE_DIAGRAM_CYCLE_PAUSE_MS = 1000;

export const SERVICE_DIAGRAM_NODES: readonly ServiceDiagramNode[] = [
  {
    id: "marketing",
    lines: ["Маркетинг", "стратегия"],
    column: 2,
    row: 0,
    groups: [5],
  },
  {
    id: "web-design",
    lines: ["Веб-", "дизайн"],
    column: 0,
    row: 1,
    groups: [1],
  },
  {
    id: "content",
    lines: ["Создание", "контента"],
    column: 3,
    row: 1,
    groups: [1],
  },
  {
    id: "social",
    lines: ["Социальные", "сети"],
    column: 4,
    row: 1,
    groups: [3],
  },
  {
    id: "brand-strategy",
    lines: ["Стратегия", "бренда"],
    column: 1,
    row: 2,
    groups: [2],
  },
  { id: "seo", lines: ["SEO-", "продвижение"], column: 2, row: 2, groups: [5] },
  {
    id: "video",
    lines: ["Видео-", "маркетинг"],
    column: 3,
    row: 2,
    groups: [],
  },
  {
    id: "ppc",
    lines: ["Контекстная", "реклама"],
    column: 5,
    row: 2,
    groups: [3],
  },
  {
    id: "identity",
    lines: ["Айдентика", "бренда"],
    column: 0,
    row: 3,
    groups: [2, 4],
  },
  {
    id: "email",
    lines: ["Email-", "маркетинг"],
    column: 3,
    row: 3,
    groups: [5],
  },
  {
    id: "pr",
    lines: ["PR и", "коммуникации"],
    column: 2,
    row: 4,
    groups: [2, 4],
  },
  {
    id: "development",
    lines: ["Разработка", "сайтов"],
    column: 3,
    row: 4,
    groups: [],
  },
  {
    id: "campaign",
    lines: ["Рекламная", "стратегия"],
    column: 4,
    row: 4,
    groups: [3],
  },
  {
    id: "support",
    lines: ["Поддержка", "проектов"],
    column: 1,
    row: 5,
    groups: [],
  },
  { id: "ux", lines: ["UX-", "аудит"], column: 4, row: 5, groups: [] },
  { id: "print", lines: ["Дизайн", "макетов"], column: 5, row: 5, groups: [] },
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

export interface NewClientPayload {
  readonly name: string;
  readonly email: string;
  readonly date: string;
  readonly feature: string;
}
