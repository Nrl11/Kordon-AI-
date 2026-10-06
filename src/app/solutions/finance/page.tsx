import type { Metadata } from "next";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Merge from "@/components/finance/Merge";
import PayModels from "@/components/finance/PayModels";
import SpendFlow from "@/components/finance/SpendFlow";
import Limits from "@/components/finance/Limits";
import Calculator from "@/components/finance/Calculator";

export const metadata: Metadata = {
  title: "Для финансов",
  description:
    "Кордон AI для финансового директора: один отчёт по расходам на ИИ вместо разрозненных подписок и счетов, куда уходят деньги по задачам и моделям, три способа оплаты, бюджеты команд в рублях.",
};

const LIMITS = [
  "Лимит в рублях на ключ, команду или проект",
  "На 80 % — уведомление руководителю",
  "На 100 % — отказ, пока лимит не поднимут",
  "Счёт за месяц не больше бюджета",
];

export default function FinancePage() {
  return (
    <>
      <PageHead
        title="ИИ — статья бюджета с прогнозом"
        lead="Подписки на личных картах, счета в долларах и авансовые отчёты Кордон сводит в один отчёт по командам — в рублях, с лимитами и прогнозом."
        visual={<Merge />}
      />

      <Section
        id="spend"
        title="Куда уходят деньги"
        sub="Сложных задач мало, но они съедают большую часть счёта. Кордон отправляет простое в дешёвые модели."
        tone="soft"
      >
        <SpendFlow />
      </Section>

      <Section
        id="pay"
        title="Три способа платить за модели"
        sub="У каждого своя цена и свой риск. Кордон работает с любым — и с несколькими сразу."
      >
        <PayModels />
      </Section>

      <Section id="calc" title="Посчитайте на своих цифрах" tone="soft">
        <Calculator />
      </Section>

      <Section id="limits" title="Бюджет без сюрпризов">
        <div className="split">
          <div className="split-text">
            <p className="lead">Каждая команда тратит в пределах своего бюджета — шлюз следит за этим сам.</p>
            <ul className="list-check">
              {LIMITS.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <Limits />
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
