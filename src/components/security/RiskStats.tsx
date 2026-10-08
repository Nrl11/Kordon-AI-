import { STATS, starOf } from "@/lib/stats";
import styles from "./RiskStats.module.css";

/* Три цифры из исследований. Источник — звёздочкой у цифры, сама ссылка —
   в сносках подвала. */
export default function RiskStats() {
  return (
    <div className={styles.stats}>
      {STATS.map((s, i) => (
        <figure key={s.source} className={styles.stat}>
          <b>
            {s.value}
            <a className={styles.star} href={`#src-${i + 1}`} aria-label={`Источник: ${s.source}`}>
              {starOf(i)}
            </a>
          </b>
          <figcaption>{s.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
