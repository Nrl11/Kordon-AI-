import { STATS } from "@/lib/stats";
import styles from "./RiskStats.module.css";

/* Три цифры из исследований — одной строкой под сценой утечки. */
export default function RiskStats() {
  return (
    <div className={styles.stats}>
      {STATS.map((s) => (
        <figure key={s.source} className={styles.stat}>
          <b>{s.value}</b>
          <figcaption>
            {s.caption}
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              {s.source}
            </a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
