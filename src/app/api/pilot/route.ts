import { validatePilot, type PilotData } from "@/lib/pilot";

/* Приём заявки на пилот.
   TODO: доставка заявки — канал ещё не выбран (почта, Telegram или CRM).
   Пока заявка проверяется и в лог пишется только номер и размер компании,
   без персональных данных. */
export async function POST(request: Request) {
  let body: Partial<PilotData> & { website?: string; license?: string };
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

  const errors = validatePilot(body);
  if (Object.keys(errors).length > 0) return Response.json({ ok: false, errors }, { status: 422 });

  const now = new Date();
  const stamp = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const id = `K-${stamp}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  /* конфигурация лицензии — не персданные, её можно писать в лог */
  const license = typeof body.license === "string" ? body.license.slice(0, 200) : "";
  console.info(`[pilot] заявка ${id}: ${body.size}${license ? `, запрос цены: ${license}` : ""}`);

  return Response.json({ ok: true, id });
}
