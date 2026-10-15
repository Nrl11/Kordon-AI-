import styles from "./Bench.module.css";

/* How we measure protection. No numbers here on purpose: they come from a run
   on your documents. Left: a labeled sample that shows what each metric
   counts; right: the metrics themselves, as formulas. */

type Mark = "hit" | "miss" | "false";
type Part = string | { t: string; m: Mark };

const SAMPLE: Part[] = [
  "The Northwind contract was signed by ",
  { t: "Maria Lopez", m: "hit" },
  ", SSN ",
  { t: "123-45-6789", m: "hit" },
  ". Send the invoice to ",
  { t: "m.lopez@example.com", m: "hit" },
  " by Friday. Office: ",
  { t: "500 Pine St", m: "miss" },
  ", ",
  { t: "Austin", m: "false" },
  ".",
];

const METRICS = [
  { name: "Recall", what: "how much personal data was found", top: "found correctly", bottom: "all personal data in the text" },
  { name: "Precision", what: "how much of what was found is personal data", top: "found correctly", bottom: "everything masked" },
  { name: "Attacks blocked", what: "how many benchmark attacks never reached the model", top: "attacks blocked", bottom: "all attacks in the set" },
  { name: "False blocks", what: "how many normal requests were blocked by mistake", top: "blocked by mistake", bottom: "all normal requests" },
  { name: "Latency", what: "how much time the gateway adds", top: "time with Kordon", bottom: "time without Kordon" },
];

export default function Bench() {
  return (
    <div className={styles.bench}>
      <figure className={styles.sample}>
        <figcaption>Labeled sample</figcaption>
        <p>
          {SAMPLE.map((p, k) =>
            typeof p === "string" ? (
              p
            ) : (
              <mark key={k} data-m={p.m}>
                {p.t}
              </mark>
            ),
          )}
        </p>
        <ul className={styles.legend}>
          <li data-m="hit">found correctly — 3</li>
          <li data-m="miss">missed — 1</li>
          <li data-m="false">flagged in error — 1</li>
        </ul>
        <p className={styles.calc}>
          In this example, recall is 3 of 4 and precision is 3 of 4.
        </p>
      </figure>

      <ul className={styles.metrics}>
        {METRICS.map((m) => (
          <li key={m.name}>
            <div>
              <b>{m.name}</b>
              <small>{m.what}</small>
            </div>
            <span className={styles.frac} aria-label={`${m.top} divided by ${m.bottom}`}>
              <span>{m.top}</span>
              <span>{m.bottom}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
