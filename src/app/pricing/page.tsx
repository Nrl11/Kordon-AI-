import type { Metadata } from "next";
import Section from "@/components/site/Section";
import CtaBand from "@/components/site/CtaBand";
import Faq from "@/components/site/Faq";
import Pricing from "@/components/pricing/Pricing";
import Included from "@/components/pricing/Included";
import Growth from "@/components/pricing/Growth";
import ServiceTrack from "@/components/pricing/ServiceTrack";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/pricing",
  title: "Стоимость лицензии ИИ-шлюза",
  description:
    "Лицензия Кордон AI считается по числу потребителей ИИ: база и модули, запас 10 % без доплаты, цена на три года и бессрочная лицензия для CAPEX.",
  og: "pricing",
  ogTitle: "Цена — по числу потребителей ИИ",
});

const FAQ = [
  {
    q: "Кого считаем потребителем?",
    a: "Любого, кто обращался к ИИ через шлюз за последние 30 дней: сотрудника, сервисный ключ или агента. Кто не обращался — не считается.",
  },
  {
    q: "Что если нас станет больше?",
    a: "Запас 10 % сверх ступени — без доплаты. Если вышли за запас, на ежегодной сверке переходите на ступень выше и доплачиваете только разницу.",
  },
  {
    q: "За модели платим отдельно?",
    a: "Да: провайдерам — по их тарифам, локальные модели работают на вашем железе. Кордон делает этот счёт меньше: маршрут по цене, кэш, лимиты.",
  },
  {
    q: "Почему на сайте нет цены?",
    a: "Она зависит от ступени и модулей. Назовём после разговора и зафиксируем на три года.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Pricing
        title="Цена — по числу потребителей ИИ"
        lead="Выберите, сколько у вас потребителей и какие модули нужны, — покажем ступень лицензии. Цена ступени фиксируется на три года."
      />

      <Section id="included" title="База и модули" tone="soft">
        <Included />
      </Section>

      <Section id="growth" title="Лицензия растёт вместе с компанией">
        <Growth />
      </Section>

      <Section id="services" title="Внедрение и поддержка" tone="soft">
        <ServiceTrack />
      </Section>

      <Section id="faq" title="Вопросы о лицензии">
        <Faq items={FAQ} />
      </Section>

      <CtaBand
        title="Назовём цену для вашей ступени"
        text="Посчитаем ступень и модули под ваш контур и зафиксируем цену на три года."
        action="Получить цену"
      />
    </>
  );
}
