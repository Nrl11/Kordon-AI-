import { nb } from "@/lib/typo";
import styles from "./Faq.module.css";

/* Questions and answers as disclosures: the whole list of questions is
   visible, an answer opens on click. The first one starts open so it's clear
   what's inside. Each question is an h3; FAQPage markup for search engines
   sits alongside. */
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
        // questions and answers are page constants, there is no user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
