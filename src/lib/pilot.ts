/* Заявка на пилот: поля и проверка — одни и те же в браузере и на сервере. */

export const SIZES = ["до 100", "100–500", "500–2 000", "больше 2 000"] as const;
export type Size = (typeof SIZES)[number];

export interface PilotData {
  name: string;
  company: string;
  email: string;
  size: Size | "";
  consent: boolean;
}

export type PilotField = keyof PilotData;
export type PilotErrors = Partial<Record<PilotField | "form", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validatePilot(d: Partial<PilotData>): PilotErrors {
  const e: PilotErrors = {};
  const name = (d.name ?? "").trim();
  const company = (d.company ?? "").trim();
  const email = (d.email ?? "").trim();
  if (name.length < 2) e.name = "Напишите, как к вам обращаться.";
  else if (name.length > 100) e.name = "Имя длиннее 100 символов — сократите, пожалуйста.";
  if (company.length < 2) e.company = "Укажите компанию — так мы подготовим пилот под ваш контур.";
  else if (company.length > 200) e.company = "Название длиннее 200 символов — сократите, пожалуйста.";
  if (!EMAIL.test(email)) e.email = "Проверьте почту: нужен адрес вида name@company.ru.";
  if (!d.size || !SIZES.includes(d.size as Size)) e.size = "Выберите, сколько сотрудников пользуются ИИ.";
  if (d.consent !== true) e.consent = "Без согласия на обработку данных мы не сможем ответить.";
  return e;
}
