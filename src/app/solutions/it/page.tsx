import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Uptime from "@/components/it/Uptime";
import KeyRoutes from "@/components/it/KeyRoutes";
import Scenarios from "@/components/it/Scenarios";
import AgentRun from "@/components/it/AgentRun";

export const metadata: Metadata = {
  title: "Для ИТ",
  description:
    "Кордон AI для ИТ-директора и DevOps: один адрес для всех моделей и резервная модель при сбое провайдера, личные ключи с правилами и лимитами, отзыв доступа через каталог, доступ агентов к системам по ролям.",
};

const KEY_RULES = [
  "какие модели: все, только дешёвые или только локальные",
  "сколько потратить: лимит в рублях на месяц",
  "до какого числа ключ действует",
  "ключи провайдеров при этом хранятся только в шлюзе",
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
            <p className="lead">Ключ выдаётся сотруднику, сервису или подрядчику. В нём записано, что можно:</p>
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
