/* Внешние исследования об утечках через ИИ — с источниками. В тексте у цифры
   звёздочка, сам источник — сноской в подвале страницы. */
export const starOf = (i: number) => "*".repeat(i + 1);

export const STATS = [
  {
    value: "≈40%",
    caption: "запросов к публичным нейросетям содержат конфиденциальные данные",
    source: "ГК «Солар», I полугодие 2026",
    href: "https://www.anti-malware.ru/news/2026-08-10-111332/50969",
  },
  {
    value: "×30",
    caption: "больше данных утекло через ИИ-сервисы в 2025 году, чем годом раньше",
    source: "ГК «Солар», 150 компаний",
    href: "https://www.cnews.ru/news/top/2026-02-04_sotrudniki_rossijskih_kompanij",
  },
  {
    value: "23%",
    caption: "компаний внедрили хотя бы базовую защиту ИИ",
    source: "AppSec Solutions и АРПП, 2026",
    href: "https://www1.ru/news/2026/09/23/437754-ii-uze-vnedrili-no-zashhitu-ispolzuiut-lis-23-kompanii.html",
  },
] as const;
