import { validateLead, type LeadData } from "@/lib/lead";

/* Приём заявки на пилот и запрос цены.
   Заявка уходит в Google Таблицу через веб-приложение Apps Script
   (инструкция — docs/leads-google-sheets.md). Адрес и секрет — только
   в переменных окружения LEADS_WEBHOOK_URL и LEADS_WEBHOOK_SECRET.
   В лог пишутся номер и размер компании, без персональных данных. */

const WEBHOOK = process.env.LEADS_WEBHOOK_URL;
const SECRET = process.env.LEADS_WEBHOOK_SECRET;

/* ячейка не должна начинаться с формулы: «=», «+», «-», «@» */
const cell = (v: unknown, max = 300) => {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
};

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
  const license = typeof body.license === "string" ? body.license.slice(0, 200) : "";
  const focus = Array.isArray(body.focus) ? body.focus.slice(0, 4).join(", ") : "";

  if (!WEBHOOK || !SECRET) {
    console.error(`[lead] заявка ${id} не сохранена: не заданы LEADS_WEBHOOK_URL и LEADS_WEBHOOK_SECRET`);
  } else {
    let page = "";
    try {
      page = new URL(request.headers.get("referer") ?? "").pathname;
    } catch {}
    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: SECRET,
          id,
          created: now.toISOString(),
          name: cell(body.name, 100),
          company: cell(body.company, 200),
          email: cell(body.email, 200),
          phone: cell(body.phone, 40),
          size: cell(body.size, 40),
          focus: cell(focus, 200),
          license: cell(license, 200),
          page: cell(page, 100),
        }),
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      });
      const out = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !out?.ok) throw new Error(`ответ таблицы ${res.status}`);
    } catch (e) {
      console.error(`[lead] заявка ${id} не записана в таблицу: ${e instanceof Error ? e.message : "ошибка"}`);
      return Response.json(
        {
          ok: false,
          errors: { form: "Заявка не отправилась. Попробуйте ещё раз через минуту или напишите на ai@webpractik.ru." },
        },
        { status: 502 },
      );
    }
  }

  console.info(`[lead] заявка ${id}: ${body.size}${focus ? `, важно: ${focus}` : ""}${license ? `, запрос цены: ${license}` : ""}`);
  return Response.json({ ok: true, id });
}
