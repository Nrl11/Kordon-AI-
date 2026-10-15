import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./PayModels.module.css";

/* Three ways to pay for models — described, not calculated: what each is,
   rated on three scales — price, ban risk, model choice. Readers can run
   their own case in the calculator below. */

type Scale = 1 | 2 | 3;
const WAYS: { key: string; title: string; text: string; tag: string; price: Scale; risk: Scale; flex: Scale }[] = [
  {
    key: "api",
    title: "Provider APIs",
    text: "You pay for every request at the model's rate. Any model is available, but the bill grows with usage.",
    tag: "flexible but pricier",
    price: 3,
    risk: 1,
    flex: 3,
  },
  {
    key: "subs",
    title: "Seat per employee",
    text: "A fixed price per employee, within the plan's usage limits. A banned account affects one person.",
    tag: "predictable",
    price: 2,
    risk: 1,
    flex: 1,
  },
  {
    key: "pool",
    title: "Shared seat pool",
    text: "A few accounts for the whole company — the cheapest option. But OpenAI and Anthropic terms prohibit account sharing: one ban cuts everyone off.",
    tag: "cheap but risky",
    price: 1,
    risk: 3,
    flex: 2,
  },
];

const SCALES: { key: "price" | "risk" | "flex"; name: string; words: [string, string, string] }[] = [
  { key: "price", name: "Price", words: ["low", "medium", "high"] },
  { key: "risk", name: "Ban risk", words: ["low", "medium", "high"] },
  { key: "flex", name: "Model choice", words: ["narrow", "medium", "any"] },
];

export default function PayModels() {
  return (
    <Reveal className={styles.grid} threshold={0.2}>
      {WAYS.map((w, i) => (
        <article key={w.key} className={styles.card} data-reveal="" data-k={w.key} style={vars({ "--i": i })}>
          <span className={styles.tag}>{w.tag}</span>
          <h3>{w.title}</h3>
          <p>{nb(w.text)}</p>
          <dl className={styles.scales}>
            {SCALES.map((s) => {
              const v = w[s.key];
              return (
                <div key={s.key} data-k={s.key}>
                  <dt>{s.name}</dt>
                  <dd>
                    <span className={styles.dots} aria-hidden="true">
                      {[1, 2, 3].map((d) => (
                        <i key={d} data-on={d <= v || undefined} />
                      ))}
                    </span>
                    {s.words[v - 1]}
                  </dd>
                </div>
              );
            })}
          </dl>
        </article>
      ))}
    </Reveal>
  );
}
