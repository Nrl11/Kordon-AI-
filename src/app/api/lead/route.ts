import nodemailer from "nodemailer";
import { validateLead, type LeadData } from "@/lib/lead";

/* Pilot requests. A request goes to two places at once:
   — an email through your SMTP server to LEADS_MAIL_TO (docs/leads-email.md);
   — a message to a Telegram chat from a bot (docs/leads-telegram.md).
   A request is accepted if it reaches at least one of them, so it isn't lost
   when one service is down. Passwords and tokens live only in environment
   variables. The log gets the request number and company size, no personal data. */

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_TO = process.env.LEADS_MAIL_TO;
const MAIL_FROM = process.env.LEADS_MAIL_FROM || SMTP_USER;
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_CHAT_ID;

/* a single line, no line breaks — for the subject and one-line fields */
const line = (v: unknown, max = 300) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const html = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const reason = (e: unknown) => (e instanceof Error ? e.message : "error");

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

/* request fields in order — the same in the email and in the chat */
const fields = (l: Lead): [string, string][] =>
  [
    ["Name", l.name],
    ["Company", l.company],
    ["Email", l.email],
    ["Phone", l.phone],
    ["People using AI", l.size],
    ["Focus", l.focus],
    ["Pricing request", l.license],
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
  const foot = `${l.when} UTC · page ${l.page}`;
  await transport.sendMail({
    from: { name: "Kordon AI website", address: MAIL_FROM! },
    to: MAIL_TO,
    replyTo: { name: l.name, address: l.email },
    subject: `Request ${l.id} — ${l.company}, ${l.size}`,
    text: [`Request ${l.id}`, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", foot, "Replying to this email goes to the client."].join("\n"),
    html: [
      `<h2 style="margin:0 0 12px;font:700 18px Arial,sans-serif">Request ${l.id}</h2>`,
      `<table cellpadding="6" style="border-collapse:collapse;font:14px Arial,sans-serif">`,
      ...rows.map(
        ([k, v]) =>
          `<tr><td style="color:#5b6478;border-bottom:1px solid #e6e8ee">${k}</td><td style="border-bottom:1px solid #e6e8ee"><b>${html(v)}</b></td></tr>`,
      ),
      `</table>`,
      `<p style="margin:12px 0 0;font:12px Arial,sans-serif;color:#5b6478">${html(foot)}<br>Replying to this email goes to the client.</p>`,
    ].join(""),
  });
}

async function toTelegram(l: Lead) {
  const text = [
    `<b>New request ${l.id}</b>`,
    "",
    ...fields(l).map(([k, v]) => `${k}: ${html(v)}`),
    "",
    `<i>${html(l.when)} UTC · ${html(l.page)}</i>`,
  ].join("\n");
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
    signal: AbortSignal.timeout(8_000),
  });
  const out = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
  if (!res.ok || !out?.ok) throw new Error(`Telegram replied ${res.status}${out?.description ? ` — ${out.description}` : ""}`);
}

const failed = () =>
  Response.json(
    { ok: false, errors: { form: "The request didn’t go through. Please try again in a minute." } },
    { status: 502 },
  );

export async function POST(request: Request) {
  let body: Partial<LeadData> & { website?: string; license?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, errors: { form: "We couldn’t read the request. Refresh the page and send it again." } },
      { status: 400 },
    );
  }

  /* a honeypot field for bots: people never see it and never fill it */
  if (body.website) return Response.json({ ok: true, id: "K-0000-0000" });

  const errors = validateLead(body);
  if (Object.keys(errors).length > 0) return Response.json({ ok: false, errors }, { status: 422 });

  const now = new Date();
  const stamp = `${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const id = `K-${stamp}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  let page = "";
  try {
    page = new URL(request.headers.get("referer") ?? "").pathname;
  } catch {}
  const lead: Lead = {
    id,
    when: now.toISOString().slice(0, 16).replace("T", " "),
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
  if (SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_FROM && MAIL_TO) channels.push({ name: "email", send: toMail });
  if (TG_TOKEN && TG_CHAT) channels.push({ name: "Telegram", send: toTelegram });

  if (channels.length === 0) {
    console.error(`[lead] request ${id} not saved: neither email (SMTP_HOST, SMTP_USER, SMTP_PASS, LEADS_MAIL_TO) nor Telegram is set`);
    /* on the live site we show an honest error instead of silently losing the request */
    if (process.env.NODE_ENV === "production") return failed();
  } else {
    const results = await Promise.allSettled(channels.map((c) => c.send(lead)));
    results.forEach((r, k) => {
      if (r.status === "rejected") console.error(`[lead] request ${id} didn't reach ${channels[k].name}: ${reason(r.reason)}`);
    });
    if (results.every((r) => r.status === "rejected")) return failed();
  }

  console.info(`[lead] request ${id}: ${lead.size}${lead.focus ? `, focus: ${lead.focus}` : ""}${lead.license ? `, pricing: ${lead.license}` : ""}`);
  return Response.json({ ok: true, id });
}
