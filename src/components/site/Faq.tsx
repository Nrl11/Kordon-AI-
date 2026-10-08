import { nb } from "@/lib/typo";
import styles from "./Faq.module.css";

/* Вопросы и ответы раскрывашками: видно весь список вопросов, ответ
   открывается по клику. Первый открыт сразу — понятно, что внутри.
   Вопрос — заголовок h3; рядом разметка FAQPage для поисковиков. */
export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return (
    <div className={styles.faq}>
      {items.map((it, i) => (
        <details key={it.q} className={styles.item} open={i === 0}>
          <summary>
            <h3>{nb(it.q)}</h3>
            <i className={styles.toggle} aria-hidden="true" />
          </summary>
          <p>{nb(it.a)}</p>
        </details>
      ))}
      <script
        type="application/ld+json"
        // вопросы и ответы — константы страницы, пользовательского ввода нет
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
