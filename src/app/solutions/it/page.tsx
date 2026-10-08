import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Uptime from "@/components/it/Uptime";
import KeyRoutes from "@/components/it/KeyRoutes";
import Scenarios from "@/components/it/Scenarios";
import AgentRun from "@/components/it/AgentRun";
import { pageMeta } from "@/lib/seo";
import { nb } from "@/lib/typo";

export const metadata: Metadata = pageMeta({
  path: "/solutions/it",
  title: "ИИ-шлюз для ИТ: один API ко всем моделям",
  description:
    "Один адрес для всех нейросетей, резервная модель при сбое провайдера, личные ключи с лимитами и доступ ИИ-агентов к системам по ролям — в вашем контуре.",
  og: "it",
  ogTitle: "Одна точка для всех моделей",
});

const KEY_RULES = [
  "свои модели — например, боту поддержки только локальная",
  "лимит в рублях на месяц",
  "срок действия",
];

export default function ItPage() {
  return (
    <>
      <PageHead
        title="Одна точка для всех моделей"
        lead="Один адрес и один ключ — любая модель: облачная, российская или локальная. Если провайдер не отвечает, Кордон сам отправляет запрос в резервную модель."
        actions={
          <>
            <Link className="btn btn-primary" href="/start">
              Обсудить подключение <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link className="more" href="/#deploy">
              Как ставится <span aria-hidden="true">→</span>
            </Link>
          </>
        }
        visual={<Uptime />}
      />

      <Section id="keys" title="У каждого свой ключ с правилами" tone="soft">
        <div className="split">
          <div className="split-text">
            <p className="lead">
              {nb("Ключ выдаётся сотруднику, сервису или подрядчику, а ключи провайдеров остаются в шлюзе. У каждого ключа:")}
            </p>
            <ul className="list-check">
              {KEY_RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <KeyRoutes />
        </div>
      </Section>

      <Section id="cases" title="Три ситуации — одно действие">
        <Scenarios />
      </Section>

      <Section
        id="agents"
        title="Агенты работают только в своей роли"
        sub="Всё, что вне роли, останавливается на шлюзе — даже если команду подсунули в письме."
        tone="soft"
      >
        <AgentRun />
      </Section>

      <CtaBand
        title="Разберём вашу схему подключения моделей"
        text="Инженер посмотрит, где у вас ключи и как ходят запросы, и поднимет стенд — Docker Compose или Helm."
      />
    </>
  );
}
