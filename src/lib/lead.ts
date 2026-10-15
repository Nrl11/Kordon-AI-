/* Pilot request: the same fields and checks in the browser and on the server. */

export const SIZES = ["Under 100", "100–500", "500–2,000", "Over 2,000"] as const;
export type Size = (typeof SIZES)[number];

export const FOCUS = ["Spend", "Data", "Access", "Compliance audit"] as const;
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
const PHONE = /^[+\d][\d\s().-]{6,}$/;

export function validateLead(d: Partial<LeadData>): LeadErrors {
  const e: LeadErrors = {};
  const name = (d.name ?? "").trim();
  const company = (d.company ?? "").trim();
  const email = (d.email ?? "").trim();
  const phone = (d.phone ?? "").trim();
  if (name.length < 2) e.name = "Tell us what to call you.";
  else if (name.length > 100) e.name = "Keep the name under 100 characters.";
  if (company.length < 2) e.company = "Add your company so our engineer can prepare.";
  else if (company.length > 200) e.company = "Keep the company name under 200 characters.";
  if (!EMAIL.test(email)) e.email = "Check the email: it should look like name@company.com.";
  if (phone && !PHONE.test(phone)) e.phone = "Check the phone: digits, spaces, dashes, parentheses and + only.";
  if (!d.size || !SIZES.includes(d.size as Size)) e.size = "Choose how many people use AI.";
  if (d.consent !== true) e.consent = "Please accept the Privacy Policy so we can reply.";
  return e;
}
