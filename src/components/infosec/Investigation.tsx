"use client";

import { useEffect, useState } from "react";
import { useSeen } from "@/components/ui/Reveal";
import { matches, REDUCED } from "@/lib/motion";
import { cx, vars } from "@/lib/css";
import styles from "./Investigation.module.css";

/* An investigation in the audit log: one name in the search box — and the
   employee's whole history by day. The query types itself when the block
   appears. */

type Tag = "mask" | "local" | "stop" | "info";
const QUERY = "K. Bell";
const ROWS: { at: string; what: string; tag: Tag; label: string }[] = [
  { at: "Sep 12 · 2:02 PM", what: "“Export Q3 customers with contact details”", tag: "mask", label: "214 names masked" },
  { at: "Sep 14 · 6:47 PM", what: "“Team salary spreadsheet”", tag: "local", label: "confidential — answered locally" },
  { at: "Sep 15 · 9:00 AM", what: "Offboarded in directory", tag: "info", label: "3 keys revoked" },
  { at: "Sep 15 · 10:41 AM", what: "Request with key vk-…a1b9", tag: "stop", label: "access denied" },
];

export default function Investigation() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.35);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (matches(REDUCED)) {
      const id = requestAnimationFrame(() => setN(QUERY.length));
      return () => cancelAnimationFrame(id);
    }
    /* type one letter at a time; the timer stops once the query is complete */
    let k = 0;
    const t = window.setInterval(() => {
      k += 1;
      setN(k);
      if (k >= QUERY.length) window.clearInterval(t);
    }, 80);
    return () => window.clearInterval(t);
  }, [seen]);

  const typed = n >= QUERY.length;

  return (
    <div ref={ref} className={cx("scene", styles.stage, typed && styles.typed)}>
      <div className={styles.main}>
      <div className={styles.search}>
        <span className={styles.icon} aria-hidden="true" />
        <span className={styles.input}>
          {QUERY.slice(0, n)}
          {!typed && <i className={styles.caret} aria-hidden="true" />}
        </span>
        <span className={styles.hint}>4 events · 4 days</span>
      </div>
      <ol className={styles.rows}>
        {ROWS.map((r, k) => (
          <li key={r.at} style={vars({ "--k": k })}>
            <span className={styles.at}>{r.at}</span>
            <span className={styles.what}>{r.what}</span>
            <span className={styles.tag} data-t={r.tag}>
              {r.label}
            </span>
          </li>
        ))}
      </ol>
      </div>
      <aside className={styles.sum} aria-label="Employee summary">
        <p className={styles.sumLabel}>Employee summary</p>
        <p className={styles.who}>
          K. Bell
          <small>Sales · offboarded Sep 15</small>
        </p>
        <dl>
          <div>
            <dt>AI requests this month</dt>
            <dd>37</dd>
          </div>
          <div>
            <dt>personal data items masked</dt>
            <dd>214</dd>
          </div>
          <div>
            <dt>sent out unmasked</dt>
            <dd className={styles.zero}>0</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
