/* Заявка на разбор и стенд: поля и проверка — одни и те же в браузере и на сервере. */

export const SIZES = ["до 100", "100–500", "500–2 000", "больше 2 000"] as const;
export type Size = (typeof SIZES)[number];

export const FOCUS = ["Расходы", "Данные", "Доступы", "Проверка регулятора"] as const;
export type Focus = (typeof FOCUS)[number];

export interface LeadData {
  name: string;
  company: string;
  email: string;
  phone: string;
  size: Size | "";
  focus: Focus[];
  consent: boolean;
}

export type LeadField = "name" | "company" | "email" | "phone" | "size" | "consent";
export type LeadErrors = Partial<Record<LeadField | "form", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s()-]{6,}$/;

export function validateLead(d: Partial<LeadData>): LeadErrors {
  const e: LeadErrors = {};
  const name = (d.name ?? "").trim();
  const company = (d.company ?? "").trim();
  const email = (d.email ?? "").trim();
  const phone = (d.phone ?? "").trim();
  if (name.length < 2) e.name = "Напишите, как к вам обращаться.";
  else if (name.length > 100) e.name = "Имя длиннее 100 символов — сократите, пожалуйста.";
  if (company.length < 2) e.company = "Укажите компанию — так инженер подготовится к разбору.";
  else if (company.length > 200) e.company = "Название длиннее 200 символов — сократите, пожалуйста.";
  if (!EMAIL.test(email)) e.email = "Проверьте почту: нужен адрес вида name@company.ru.";
  if (phone && !PHONE.test(phone)) e.phone = "Проверьте телефон: только цифры, пробелы, скобки и +.";
  if (!d.size || !SIZES.includes(d.size as Size)) e.size = "Выберите, сколько сотрудников пользуются ИИ.";
  if (d.consent !== true) e.consent = "Без согласия на обработку данных мы не сможем ответить.";
  return e;
}
