import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import CtaBand from "@/components/site/CtaBand";
import { nb } from "@/lib/typo";

export const metadata: Metadata = {
  title: "Решения",
  description: "Кордон AI для ИТ-директора, службы информационной безопасности и финансового директора.",
};

const ROLES = [
  {
    href: "/solutions/it",
    who: "ИТ-директор, DevOps",
    title: "Одна точка для всех моделей",
    text: "Личные ключи вместо общих, отзыв доступа через каталог, смена провайдера без правок в приложениях.",
  },
  {
    href: "/solutions/infosec",
    who: "Руководитель ИБ",
    title: "ИБ видит каждый запрос к модели",
    text: "Каждое обращение в журнале и SIEM, история по сотруднику в одном поиске, 152-ФЗ и приказ ФСТЭК № 117.",
  },
  {
    href: "/solutions/finance",
    who: "Финансовый директор",
    title: "ИИ — статья бюджета с прогнозом",
    text: "Сколько стоят API, подписки и общий пул на одной нагрузке, лимиты в рублях, отчёт по командам каждый месяц.",
  },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHead
        title="Один шлюз — три задачи"
        lead="ИТ получает одну точку для всех моделей, ИБ — контроль над данными, финансы — понятный счёт."
      />
      <section className="section" aria-label="Решения по ролям">
        <div className="wrap">
          <ul className="ruled g3">
            {ROLES.map((r) => (
              <li key={r.href}>
                <small>{r.who}</small>
                <b>{r.title}</b>
                <p>{nb(r.text)}</p>
                <Link className="more" href={r.href}>
                  Подробнее <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
