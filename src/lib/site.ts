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
  { href: "/contacts", label: "Контакты" },
] as const;

export const CTA = { href: "/start", label: "Обсудить внедрение" } as const;

/* контакты и реквизиты — как на webpractik.ru и webpractik.ai */
export const CONTACTS = {
  phone: "+7 495 540-51-79",
  tel: "+74955405179",
  email: "ai@webpractik.ru",
  address: "Москва, ул. Шаболовка, д. 34, стр. 3",
  telegram: "https://t.me/Webpractik_Ai",
} as const;
/* офисы: Москва — рабочий, Ростов-на-Дону — юридический и почтовый адрес */
export const OFFICES = [
  { city: "Москва", note: "офис", address: "ул. Шаболовка, д. 34, стр. 3", map: "Москва, ул. Шаболовка, 34с3" },
  {
    city: "Ростов-на-Дону",
    note: "юридический и почтовый адрес",
    address: "344006, пр. Ворошиловский, д. 2/2, оф. 55",
    map: "Ростов-на-Дону, Ворошиловский проспект, 2/2",
  },
] as const;export const LEGAL = {
  name: "ООО «Вебпрактик»",
  inn: "6163109767",
  ogrn: "1116195010711",
} as const;
export const PRIVACY = { href: "/privacy", label: "Политика обработки персональных данных" } as const;

export const FOOTER = [
  {
    title: "Продукт",
    links: [
      { href: "/#control", label: "Портал администратора" },
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
      { href: "/contacts", label: "Контакты" },
      { href: "https://webpractik.ai", label: "Вебпрактик AI" },
      { href: "https://t.me/Webpractik_Ai", label: "Канал Вебпрактик AI" },
    ],
  },
] as const;
