"use client";

import { useSeen } from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Scenarios.module.css";

/* Three situations every company runs into, in three columns. When the
   block appears, the manual work without a gateway is struck out line by
   line, column by column, and the single action in Kordon fades in below. */

const CASES = [
  {
    title: "A key leaked",
    before: ["find everywhere it's used", "reissue it with the provider", "update it in every app", "restart services"],
    after: "Revoke the key in the portal",
    note: "Other keys keep working, and everything the revoked key did is in the audit log.",
  },
  {
    title: "An employee left",
    before: ["track down their model access", "cancel personal subscriptions", "rotate shared keys", "send new ones to every team"],
    after: "Disable their directory account",
    note: "Access to every model is cut off at once.",
  },
  {
    title: "Switching providers",
    before: ["find every hardcoded endpoint", "rewrite calls for the new API", "reissue and hand out keys", "retest every app"],
    after: "Change the route in the gateway",
    note: "Apps call the same endpoint with the same keys.",
  },
];

export default function Scenarios() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.35);
  return (
    <div ref={ref} className={styles.grid} data-on={seen || undefined}>
      {CASES.map((c, i) => (
        <article key={c.title} className={styles.case} style={vars({ "--i": i })}>
          <h3>{c.title}</h3>
          <div className={styles.before}>
            <small>Without a gateway — {c.before.length} steps</small>
            <ul>
              {c.before.map((b, k) => (
                <li key={b}>
                  <span className={styles.strike} style={vars({ "--k": k })}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.after}>
            <small>With Kordon — one action</small>
            <b>{c.after}</b>
            <p>{nb(c.note)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
