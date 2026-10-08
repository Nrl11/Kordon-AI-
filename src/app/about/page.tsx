import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import Section from "@/components/site/Section";
import Reveal from "@/components/ui/Reveal";
import VendorCard from "@/components/about/VendorCard";
import Leaders from "@/components/about/Leaders";
import Clients from "@/components/about/Clients";
import { vars } from "@/lib/css";
import { pageMeta } from "@/lib/seo";
import { nb } from "@/lib/typo";
import styles from "@/components/about/About.module.css";

export const metadata: Metadata = pageMeta({
  path: "/about",
  title: "О компании Вебпрактик — разработчике Кордон AI",
  description:
    "Кордон AI разрабатывает Вебпрактик: с 2011 года, 130+ специалистов, 300+ проектов, лицензии ФСТЭК и ФСБ. Вебпрактик AI внедряет ИИ в крупных компаниях.",
  og: "about",
  ogTitle: "Мы — команда Вебпрактик",
});

const AI_WORK = [
  { tag: "До старта", b: "Аудит и архитектура", s: "Находим процессы, где ИИ окупится, и проектируем, как он встроится." },
  { tag: "Разработка", b: "ИИ-агенты", s: "Мультиагентные системы, которые доводят задачу до результата." },
  { tag: "Разработка", b: "Базы знаний", s: "Поиск и ответы по документам компании — RAG." },
  { tag: "Разработка", b: "Интеграции", s: "1С, SAP, CRM и ERP — без перестройки инфраструктуры." },
  { tag: "Безопасность", b: "Закрытый контур", s: "Развёртывание on-premise по требованиям ИБ и 152-ФЗ. Отсюда вырос Кордон.", key: true },
  { tag: "Запуск", b: "Обучение", s: "Сотрудники учатся работать с ИИ, изменения закрепляются." },
];

/* по блоку наград на webpractik.ru и рейтингу Рунета 2026 */
const AWARDS = [
  { place: 1, what: "Внедрение ИИ для финтеха", where: "Рейтинг Рунета", year: "2025" },
  { place: 1, what: "ИИ-разработка и внедрения для госструктур", where: "Рейтинг Рунета", year: "2026" },
  { place: 1, what: "Комплексное агентство для финтеха", where: "Рейтинг Рунета", year: "2025" },
  { place: 1, what: "Разработка и продвижение сайтов банков", where: "Рейтинг Рунета", year: "2025" },
];

const RUBRICS = ["Разборы внедрений", "Стек и архитектура", "Исследования рынка", "On-premise и безопасность"];

export default function AboutPage() {
  return (
    <>
      <PageHead
        title="Мы — команда Вебпрактик"
        lead="С 2011 года строим цифровые продукты для банков, промышленности и госсектора. Шлюз видит все запросы компании к нейросетям, поэтому за Кордон мы отвечаем сами: от разработки до поддержки."
        actions={
          <>
            <Link className="btn btn-primary" href="#leaders">
              Кто за это отвечает <span className="arr" aria-hidden="true">→</span>
            </Link>
            <a className="more" href="https://webpractik.ru" target="_blank" rel="noopener noreferrer">
              webpractik.ru <span aria-hidden="true">→</span>
            </a>
          </>
        }
        visual={<VendorCard />}
      />

      <Section
        id="ai"
        title="Наше ИИ-направление"
        sub="Вебпрактик AI внедряет ИИ в крупных компаниях. В Кордоне мы собрали то, что служба ИБ требует от каждого такого проекта."
        tone="soft"
      >
        <div className={styles.aiPanel}>
          <div className={styles.aiTop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/clients/webpractik-ai.svg" alt="Вебпрактик AI" width={190} height={27} />
            <a href="https://webpractik.ai" target="_blank" rel="noopener noreferrer">
              webpractik.ai <span aria-hidden="true">→</span>
            </a>
          </div>
          <Reveal className={styles.aiList} threshold={0.2}>
            {AI_WORK.map((w, i) => (
              <div key={w.b} data-reveal="" data-key={w.key || undefined} style={vars({ "--i": i % 3 })}>
                <small>{w.tag}</small>
                <b>{w.b}</b>
                <p>{nb(w.s)}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </Section>

      <Section id="leaders" title="Кто за это отвечает">
        <Leaders />
      </Section>

      <Section
        id="clients"
        title="С кем мы работаем"
        sub="Банки, промышленность и госсектор — заказчики с самыми строгими требованиями к безопасности."
        tone="soft"
      >
        <Clients />
      </Section>

      <Section id="awards" title="Рейтинги и награды">
        <Reveal className={styles.awards} threshold={0.2}>
          {AWARDS.map((a, i) => (
            <article key={a.what} data-reveal="" style={vars({ "--i": i })}>
              <b className={styles.place}>
                <small>№</small>
                {a.place}
              </b>
              <h3>{nb(a.what)}</h3>
              <span>
                {a.where}, {a.year}
              </span>
            </article>
          ))}
        </Reveal>
      </Section>

      {/* последний шаг страницы — к Вебпрактик AI: проект или канал */}
      <section className="section" aria-labelledby="wpai-title">
        <div className="wrap">
          <div className={styles.channel}>
            <div className={styles.wpai}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.wpaiLogo} src="/clients/webpractik-ai.svg" alt="Вебпрактик AI" width={190} height={27} />
              <h2 id="wpai-title">{"Нужен ИИ не только в шлюзе?"}</h2>
              <p>{nb("Вебпрактик AI внедряет ИИ в крупных компаниях — от аудита процессов до агентов, которые работают в закрытом контуре")}</p>
              <a className="btn btn-gold" href="https://webpractik.ai" target="_blank" rel="noopener noreferrer">
                Перейти на webpractik.ai <span className="arr" aria-hidden="true">→</span>
              </a>
            </div>
            <div className={styles.feed}>
              <small>Канал Вебпрактик AI</small>
              <b>Корпоративный ИИ без воды</b>
              <ul className={styles.rubrics} aria-label="О чём пишем">
                {RUBRICS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <a className={styles.feedLink} href="https://t.me/Webpractik_Ai" target="_blank" rel="noopener noreferrer">
                Читать @Webpractik_Ai <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
