import { nb } from "@/lib/typo";
import styles from "./Faq.module.css";

/* Вопросы и ответы — открыты сразу, без раскрывашек: читать, а не кликать. */
export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <dl className={styles.faq}>
      {items.map((it) => (
        <div key={it.q} className={styles.item}>
          <dt>{nb(it.q)}</dt>
          <dd>{nb(it.a)}</dd>
        </div>
      ))}
    </dl>
  );
}
