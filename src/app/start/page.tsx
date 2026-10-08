import type { Metadata } from "next";
import Section from "@/components/site/Section";
import Faq from "@/components/site/Faq";
import RequestCard from "@/components/start/Request";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/start",
  title: "Пилот ИИ-шлюза в вашем контуре",
  description:
    "Оставьте заявку на пилот Кордон AI: обсудим ваши задачи и покажем шлюз в работе до решения о покупке. Ответы на частые вопросы о подключении.",
  og: "start",
  ogTitle: "Начните с пилота",
});

const FAQ = [
  {
    q: "Нужно ли переписывать приложения?",
    a: "Нет. Кордон совместим с OpenAI API: приложения меняют адрес и ключ — две строки.",
  },
  {
    q: "Какие модели можно подключить?",
    a: "Любые с API: зарубежные облачные, российские — GigaChat и YandexGPT — и локальные модели на вашем железе.",
  },
  {
    q: "Можно ли оставить личные подписки?",
    a: "Да. Трафик личных подписок идёт через шлюз — с маскированием и журналом.",
  },
  {
    q: "Где хранятся промпты и журнал?",
    a: "В вашем контуре — в вашем PostgreSQL и Redis. Наружу уходят только запросы к внешним моделям, и только после маскирования.",
  },
  {
    q: "Работает ли без интернета?",
    a: "Да, с модулем «Закрытый контур»: зеркало обновлений и каталога моделей, сверка хешей.",
  },
  {
    q: "Сколько стоит?",
    a: "Лицензия зависит от числа потребителей ИИ и модулей. Назовём цену после разговора и зафиксируем её на три года.",
  },
];

/* Первый экран — сама заявка: как идёт пилот, пропуск и форма. */
export default function StartPage() {
  return (
    <>
      <section className="page-head" aria-label="Заявка на пилот">
        <div className="wrap">
          <RequestCard />
        </div>
      </section>

      <Section id="faq" title="Частые вопросы" tone="soft">
        <Faq items={FAQ} />
      </Section>
    </>
  );
}
