import Link from "next/link";
import Hero from "@/components/hero/Hero";
import Section from "@/components/site/Section";
import Inside from "@/components/inside/Inside";
import Portal from "@/components/home/Portal";
import Architecture from "@/components/product/Architecture";
import Team from "@/components/home/Team";
import PilotCta from "@/components/home/PilotCta";

/* Главная рассказывает о продукте целиком: защита, которая окупает себя,
   портал, где видны все нейросети компании, как защищены данные, как
   ставится и сколько экономит, кто делает — и поле для пилота в конце. */
export default function Home() {
  return (
    <>
      <Hero />

      <Section
        id="control"
        title="Все нейросети компании — в одном окне"
        sub="Кто пользуется моделями, на каких условиях и сколько это стоит."
        tone="soft"
      >
        <Portal />
      </Section>

      <Section
        id="protect"
        title="Персональные данные не уходят наружу"
        sub="Кордон проверяет каждый запрос до того, как он уйдёт из компании."
        aside={
          <Link className="more" href="/security">
            Как устроена защита <span aria-hidden="true">→</span>
          </Link>
        }
      >
        <Inside bare />
      </Section>

      <Section
        id="deploy"
        title="Ставится в ваш контур"
        sub="И сразу снижает счёт за модели."
        tone="soft"
      >
        <Architecture />
      </Section>

      <Team />
      <PilotCta />
    </>
  );
}
