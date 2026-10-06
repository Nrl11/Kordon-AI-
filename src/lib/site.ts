/* Карта сайта: одна правда для шапки и подвала. О продукте рассказывает
   главная — отдельной страницы нет. */

export const SOLUTIONS = [
  { href: "/solutions/it", label: "Для ИТ", note: "Один API, ключи, агенты" },
  { href: "/solutions/infosec", label: "Для ИБ", note: "Данные, журнал, проверка" },
  { href: "/solutions/finance", label: "Для финансов", note: "Бюджет и счёт за модели" },
] as const;

export const NAV = [
  { href: "/solutions", label: "Решения", children: SOLUTIONS },
  { href: "/security", label: "Безопасность" },
  { href: "/pricing", label: "Стоимость" },
  { href: "/about", label: "О компании" },
] as const;

export const CTA = { href: "/start", label: "Обсудить внедрение" } as const;

export const FOOTER = [
  {
    title: "Продукт",
    links: [
      { href: "/#control", label: "Пульт управления" },
      { href: "/#deploy", label: "Как ставится" },
      { href: "/security", label: "Безопасность" },
      { href: "/pricing", label: "Стоимость" },
      { href: "/start", label: "Как начать" },
    ],
  },
  { title: "Решения", links: SOLUTIONS.map((s) => ({ href: s.href, label: s.label })) },
  {
    title: "Компания",
    links: [
      { href: "/about", label: "О компании" },
      { href: "https://t.me/Webpractik_Ai", label: "Канал Вебпрактик AI" },
      { href: "/privacy", label: "Политика ПДн" },
    ],
  },
] as const;
