import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Feed from "@/components/infosec/Feed";
import Investigation from "@/components/infosec/Investigation";
import Compliance from "@/components/infosec/Compliance";
import DataClasses from "@/components/infosec/DataClasses";

export const metadata: Metadata = {
  title: "Для ИБ",
  description:
    "Кордон AI для службы информационной безопасности: каждое обращение к нейросетям в журнале и SIEM, правила для классов данных, поиск по истории обращений, 152-ФЗ и приказ ФСТЭК № 117.",
};

export default function InfosecPage() {
  return (
    <>
      <PageHead
        title="ИБ видит каждый запрос к модели"
        lead="Каждое обращение проходит через шлюз и сохраняется в журнале. Персональные данные заменяются метками, закрытые документы не выходят из контура."
        actions={
          <Link className="more" href="/security">
            Что именно находит шлюз <span aria-hidden="true">→</span>
          </Link>
        }
        visual={<Feed />}
      />

      <Section
        id="classes"
        title="Свои правила для каждого класса данных"
        sub="Чем строже класс, тем ближе к вам модель, которая его увидит."
        tone="soft"
      >
        <DataClasses />
      </Section>

      <Section
        id="investigate"
        title="Любое обращение — за секунды"
        sub="Поиск по сотруднику, ключу или типу данных — без запроса в ИТ."
      >
        <Investigation />
      </Section>

      <Section id="compliance" title="Требования регулятора" tone="soft">
        <Compliance />
      </Section>

      <CtaBand
        title="Покажем журнал на ваших данных"
        text="Поднимем стенд, подключим выгрузку в ваш SIEM и прогоним ваши документы — до решения о покупке."
      />
    </>
  );
}
