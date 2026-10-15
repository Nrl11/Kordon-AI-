"use client";

import Link from "next/link";
import { useSeen } from "@/components/ui/Reveal";
import { computeCost } from "@/lib/costModel";
import { cx, vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Savings.module.css";

/* Economics on the home page — no amounts, no promises. Three ways to pay
   for models, as bars on one scale: the dark part is what you pay, the
   hatching is what Kordon cuts. Proportions come from the same math as the
   calculator, but there are no numbers here — visitors run those on their
   own data. */

const R = computeCost(150, "astra");
const MAX = R.apiDirect;

type Way = { key: "api" | "subs" | "pool"; name: string; tag: string; pay: number; cut?: number; note: string; risk?: string };
const WAYS: Way[] = [
  {
    key: "api",
    name: "Provider APIs",
    tag: "pay per request",
    pay: R.api / MAX,
    cut: 1 - R.api / MAX,
    note: "Simple requests go to cheaper models, complex ones to stronger ones",
  },
  {
    key: "subs",
    name: "Per-seat subscriptions",
    tag: "fixed fee per employee",
    pay: (R.subs / MAX) * 0.78,
    cut: (R.subs / MAX) * 0.22,
    note: "You see who isn’t using their seat, so you can drop the extra ones",
  },
  {
    key: "pool",
    name: "Shared pool",
    tag: "a few accounts for everyone",
    pay: R.pool / MAX,
    note: "If an account gets banned, requests fail over to the API — work doesn’t stop",
    risk: "ban risk",
  },
];

export default function Savings() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.35);

  return (
    <section id="savings" className={cx("section", "soft", styles.band)} aria-labelledby="savings-title">
      <div className="wrap">
        <div ref={ref} className={styles.card} data-in={seen || undefined}>
          <div className={styles.copy}>
            <h2 id="savings-title">Three ways to pay for AI</h2>
            <p>
              {nb(
                "Kordon works with all three: it shows who spends what and on what, and trims waste wherever it can",
              )}
            </p>
            <Link className="btn btn-gold" href="/solutions/finance#calc">
              Run your own numbers <span className="arr" aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.visual}>
            <ul className={styles.ways}>
              {WAYS.map((w, i) => (
                <li key={w.key} data-k={w.key} style={vars({ "--i": i, "--pay": w.pay, "--cut": w.cut ?? 0 })}>
                  <div className={styles.name}>
                    <h3>{w.name}</h3>
                    <span>{w.tag}</span>
                  </div>
                  <div className={styles.track} aria-hidden="true">
                    <i className={styles.pay} />
                    {w.cut && <i className={styles.cut} />}
                    {w.risk && <em className={styles.risk}>{w.risk}</em>}
                  </div>
                  <p className={styles.note}>
                    <span>With Kordon:</span> {nb(w.note)}
                  </p>
                </li>
              ))}
            </ul>
            <p className={styles.legend}>
              <i className={styles.keyPay} aria-hidden="true" /> you pay
              <i className={styles.keyCut} aria-hidden="true" /> Kordon cuts
              <span>bar length — monthly bill</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
