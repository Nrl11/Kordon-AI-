import nodemailer from "nodemailer";
import { validateLead, type LeadData } from "@/lib/lead";
import { CONTACTS } from "@/lib/site";

/* Приём заявки на пилот и запрос цены. Заявка уходит сразу в два места:
   — письмом на рабочую почту через SMTP (по умолчанию Mail.ru → ai@webpractik.ru),
     инструкция — docs/leads-email.md;
   — сообщением в чат Telegram от бота, инструкция — docs/leads-telegram.md.
   Заявка принята, если дошла хотя бы до одного из них — так она не теряется,
   когда один сервис недоступен. Пароли и токены — только в переменных окружения.
   В лог пишутся номер и размер компании, без персональных данных. */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.mail.ru";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_TO = process.env.LEADS_MAIL_TO || CONTACTS.email;
const MAIL_FROM = process.env.LEADS_MAIL_FROM || SMTP_USER;
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_CHAT_ID;

/* строка без переводов строк — для темы письма и полей в одну строку */
const line = (v: unknown, max = 300) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const html = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const reason = (e: unknown) => (e instanceof Error ? e.message : "ошибка");

interface Lead {
  id: string;
  when: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  size: string;
  focus: string;
  license: string;
  page: string;
}

/* поля заявки по порядку — одни и те же в письме и в чате */
const fields = (l: Lead): [string, string][] =>
  [
    ["Имя", l.name],
    ["Компания", l.company],
    ["Почта", l.email],
    ["Телефон", l.phone],
    ["Сотрудников с ИИ", l.size],
    ["Что важно", l.focus],
    ["Запрос цены", l.license],
  ].filter((r): r is [string, string] => Boolean(r[1]));

async function toMail(l: Lead) {
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  const rows = fields(l);
  const foot = `${l.when} МСК · страница ${l.page}`;
  await transport.sendMail({
    from: { name: "Кордон AI — сайт", address: MAIL_FROM! },
    to: MAIL_TO,
    replyTo: { name: l.name, address: l.email },
    subject: `Заявка ${l.id} — ${l.company}, ${l.size}`,
    text: [`Заявка ${l.id}`, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", foot, "Ответ на это письмо уйдёт клиенту."].join(
      "\n",
    ),
    html: [
      `<h2 style="margin:0 0 12px;font:700 18px Arial,sans-serif">Заявка ${l.id}</h2>`,
      `<table cellpadding="6" style="border-collapse:collapse;font:14px Arial,sans-serif">`,
      ...rows.map(
        ([k, v]) =>
          `<tr><td style="color:#5b6478;border-bottom:1px solid #e6e8ee">${k}</td><td style="border-bottom:1px solid #e6e8ee"><b>${html(v)}</b></td></tr>`,
      ),
      `</table>`,
      `<p style="margin:12px 0 0;font:12px Arial,sans-serif;color:#5b6478">${html(foot)}<br>Ответ на это письмо уйдёт клиенту.</p>`,
    ].join(""),
  });
}

async function toTelegram(l: Lead) {
  const text = [
    `<b>Новая заявка ${l.id}</b>`,
    "",
    ...fields(l).map(([k, v]) => `${k}: ${html(v)}`),
    "",
    `<i>${html(l.when)} МСК · ${html(l.page)}</i>`,
  ].join("\n");
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
    signal: AbortSignal.timeout(8_000),
  });
  const out = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
  if (!res.ok || !out?.ok) throw new Error(`ответ Telegram ${res.status}${out?.description ? ` — ${out.description}` : ""}`);
}

const failed = () =>
  Response.json(
    {
      ok: false,
      errors: { form: "Заявка не отправилась. Попробуйте ещё раз через минуту или напишите на ai@webpractik.ru." },
    },
    { status: 502 },
  );

export async function POST(request: Request) {
  let body: Partial<LeadData> & { website?: string; license?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, errors: { form: "Не удалось прочитать заявку. Обновите страницу и отправьте ещё раз." } },
      { status: 400 },
    );
  }

  /* поле-ловушка для ботов: человек его не видит и не заполняет */
  if (body.website) return Response.json({ ok: true, id: "K-0000-0000" });

  const errors = validateLead(body);
  if (Object.keys(errors).length > 0) return Response.json({ ok: false, errors }, { status: 422 });

  const now = new Date();
  const stamp = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const id = `K-${stamp}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  let page = "";
  try {
    page = new URL(request.headers.get("referer") ?? "").pathname;
  } catch {}
  const lead: Lead = {
    id,
    when: now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
    name: line(body.name, 100),
    company: line(body.company, 200),
    email: line(body.email, 200),
    phone: line(body.phone, 40),
    size: line(body.size, 40),
    focus: Array.isArray(body.focus) ? line(body.focus.slice(0, 4).join(", "), 200) : "",
    license: line(body.license, 200),
    page: line(page, 100) || "/start",
  };

  const channels: { name: string; send: (l: Lead) => Promise<void> }[] = [];
  if (SMTP_USER && SMTP_PASS && MAIL_FROM) channels.push({ name: "почту", send: toMail });
  if (TG_TOKEN && TG_CHAT) channels.push({ name: "Telegram", send: toTelegram });

  if (channels.length === 0) {
    console.error(`[lead] заявка ${id} не сохранена: не заданы ни почта (SMTP_USER, SMTP_PASS), ни Telegram`);
    /* на боевом сайте честно показываем ошибку, а не теряем заявку молча */
    if (process.env.NODE_ENV === "production") return failed();
  } else {
    const results = await Promise.allSettled(channels.map((c) => c.send(lead)));
    results.forEach((r, k) => {
      if (r.status === "rejected") console.error(`[lead] заявка ${id} не ушла в ${channels[k].name}: ${reason(r.reason)}`);
    });
    if (results.every((r) => r.status === "rejected")) return failed();
  }

  console.info(
    `[lead] заявка ${id}: ${lead.size}${lead.focus ? `, важно: ${lead.focus}` : ""}${lead.license ? `, запрос цены: ${lead.license}` : ""}`,
  );
  return Response.json({ ok: true, id });
}
