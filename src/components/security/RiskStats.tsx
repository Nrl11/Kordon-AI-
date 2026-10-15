import { STATS, starOf } from "@/lib/stats";
import styles from "./RiskStats.module.css";

/* Three figures from research. The source is marked with an asterisk next to
   the figure; the link itself is in the footer notes. */
export default function RiskStats() {
  return (
    <div className={styles.stats}>
      {STATS.map((s, i) => (
        <figure key={s.value} className={styles.stat}>
          <b>
            {s.value}
            <a className={styles.star} href={`#src-${i + 1}`} aria-label={`Source: ${s.source}`}>
              {starOf(i)}
            </a>
          </b>
          <figcaption>{s.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
