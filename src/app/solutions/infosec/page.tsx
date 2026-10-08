import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Feed from "@/components/infosec/Feed";
import Investigation from "@/components/infosec/Investigation";
import Compliance from "@/components/infosec/Compliance";
import DataClasses from "@/components/infosec/DataClasses";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/solutions/infosec",
  title: "ИИ-шлюз для ИБ: журнал обращений к нейросетям",
  description:
    "Каждое обращение к нейросетям — в журнале и SIEM, свои правила для каждого класса данных, поиск по истории за секунды. 152-ФЗ и приказ ФСТЭК № 117.",
  og: "infosec",
  ogTitle: "ИБ видит каждый запрос к модели",
});

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
        title="Журнал обращений с поиском"
        sub="По сотруднику, ключу или типу данных — без запроса в ИТ"
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
