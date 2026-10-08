import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Stream from "@/components/security/Stream";
import RiskStats from "@/components/security/RiskStats";
import TokenSheet from "@/components/security/TokenSheet";
import Bench from "@/components/security/Bench";
import Injections from "@/components/security/Injections";

export const metadata: Metadata = pageMeta({
  path: "/security",
  title: "Защита данных при работе с нейросетями",
  description:
    "Кордон проверяет каждый запрос к нейросетям до отправки: персданные и ключи заменяет метками, скрытые команды останавливает, закрытое оставляет локальной модели.",
  og: "security",
  ogTitle: "Модель видит только разрешённое",
});

export default function SecurityPage() {
  return (
    <>
      <PageHead
        title="Модель видит только разрешённое"
        lead="Кордон проверяет каждый запрос до отправки: персональные данные и ключи заменяет метками, скрытые команды останавливает, закрытые документы оставляет локальной модели."
        actions={
          <>
            <Link className="btn btn-primary" href="/start">
              Проверить на наших документах <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link className="more" href="#bench">
              Как измеряем качество <span aria-hidden="true">→</span>
            </Link>
          </>
        }
        visual={<Stream />}
      />

      <Section id="risk" title="Что уходит без шлюза" tone="soft">
        <RiskStats />
      </Section>

      <Section id="found" title="Что Кордон находит в тексте">
        <TokenSheet />
      </Section>

      <Section
        id="injections"
        title="Скрытые команды не доходят до модели"
        sub="Команду можно спрятать в письме, на сайте или в «игре». Кордон находит её до того, как запрос уйдёт к модели."
        tone="soft"
      >
        <Injections />
      </Section>

      <Section
        id="bench"
        title="Как измеряем качество"
        sub="Маскирование — на размеченных документах, защиту от инъекций — на открытых бенчмарках атак. Цифры — в отчёте по стенду."
      >
        <Bench />
      </Section>

      <CtaBand
        title="Проверим маскирование на ваших документах"
        text="Поднимем стенд и прогоним проверки на ваших данных — отчёт с цифрами до решения о покупке."
      />
    </>
  );
}
