"use client";

import { useSeen } from "@/components/ui/Reveal";
import { cx, vars } from "@/lib/css";
import styles from "./Growth.module.css";

/* Three years of the license in one picture. The license is a cobalt
   staircase with the 10% buffer in gold above each tier; the AI-user curve
   climbs along it. Callouts sit right on the annual true-up points: after
   year one — within the buffer, nothing extra to pay; after year two — a
   move up one tier. Above year three — tier prices stay locked. */

const W = 1000;
const H = 380;
const L = 72;
const R = 28;
const T = 28;
const B = 46;
const MAX = 6000;
const x = (m: number) => L + (m / 36) * (W - L - R);
const y = (v: number) => H - B - (v / MAX) * (H - T - B);

const USERS: [number, number][] = [
  [0, 1480],
  [6, 1760],
  [12, 2100],
  [18, 2380],
  [24, 2600],
  [30, 2950],
  [36, 3300],
];

/* smooth curve with no overshoot past the points (monotone) */
function smooth(pts: [number, number][]) {
  const n = pts.length;
  const m: number[] = [];
  for (let k = 0; k < n - 1; k++) m[k] = (pts[k + 1][1] - pts[k][1]) / (pts[k + 1][0] - pts[k][0]);
  const t: number[] = [m[0]];
  for (let k = 1; k < n - 1; k++) t[k] = m[k - 1] * m[k] <= 0 ? 0 : (m[k - 1] + m[k]) / 2;
  t[n - 1] = m[n - 2];
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let k = 0; k < n - 1; k++) {
    const h = (pts[k + 1][0] - pts[k][0]) / 3;
    d += ` C${(pts[k][0] + h).toFixed(1)},${(pts[k][1] + t[k] * h).toFixed(1)} ${(pts[k + 1][0] - h).toFixed(1)},${(pts[k + 1][1] - t[k + 1] * h).toFixed(1)} ${pts[k + 1][0].toFixed(1)},${pts[k + 1][1].toFixed(1)}`;
  }
  return d;
}

const curve = smooth(USERS.map(([m, v]) => [x(m), y(v)]));
const tier = `M${x(0)},${y(2000)} H${x(24)} V${y(5000)} H${x(36)}`;
const paid = `${tier} V${y(0)} H${x(0)} Z`;

/* true-up points: where each callout sits and what it says */
const CHECKS = [
  {
    m: 12,
    v: 2100,
    tone: "ok",
    title: "Year-one true-up",
    text: "2,100 AI users — within the 10% buffer, no extra charge",
    side: "pin",
  },
  {
    m: 24,
    v: 2600,
    tone: "up",
    title: "Year-two true-up",
    text: "2,600 — move to the 5,000 tier, you pay only the difference",
    side: "upleft",
  },
] as const;

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

export default function Growth() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.3);
  return (
    <figure ref={ref} className={cx(styles.card, seen && styles.in)}>
      <figcaption className={styles.legend}>
        <span data-k="tier">Paid tier</span>
        <span data-k="buf">10% buffer — no extra charge</span>
        <span data-k="users">AI users, last 30 days</span>
      </figcaption>

      <div className={styles.plot}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="AI user growth over three years against the license tier">
          <defs>
            <linearGradient id="gr-paid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a47d6" stopOpacity="0.16" />
              <stop offset="1" stopColor="#2a47d6" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="gr-buf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0b04a" stopOpacity="0.05" />
              <stop offset="1" stopColor="#e0b04a" stopOpacity="0.38" />
            </linearGradient>
            <linearGradient id="gr-users" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0b1324" stopOpacity="0.55" />
              <stop offset="1" stopColor="#0b1324" />
            </linearGradient>
          </defs>

          {/* years as bands, the second one slightly darker */}
          <rect x={x(12)} y={T - 10} width={x(24) - x(12)} height={H - B - T + 10} className={styles.band} />

          {/* the paid tier and the buffer above it */}
          <path d={paid} fill="url(#gr-paid)" className={styles.fill} />
          <g className={styles.buf}>
            <rect x={x(0)} y={y(2200)} width={x(24) - x(0)} height={y(2000) - y(2200)} fill="url(#gr-buf)" />
            <rect x={x(24)} y={y(5500)} width={x(36) - x(24)} height={y(5000) - y(5500)} fill="url(#gr-buf)" />
            <path d={`M${x(0)},${y(2200)} H${x(24)} M${x(24)},${y(5500)} H${x(36)}`} className={styles.bufEdge} />
          </g>
          <path d={tier} className={styles.tier} pathLength={1} />

          {/* true-ups as full-height dashed lines */}
          {[12, 24].map((m) => (
            <line key={m} x1={x(m)} x2={x(m)} y1={T - 10} y2={H - B} className={styles.check} />
          ))}
          <line x1={L} x2={W - R} y1={H - B} y2={H - B} className={styles.axis} />

          {[2000, 5000].map((v) => (
            <text key={v} x={L - 14} y={y(v) + 5} textAnchor="end" className={styles.tick}>
              {v === 2000 ? "2,000" : "5,000"}
            </text>
          ))}
          {["Year 1", "Year 2", "Year 3"].map((t, k) => (
            <text key={t} x={x(k * 12 + 6)} y={H - B + 28} textAnchor="middle" className={styles.year}>
              {t}
            </text>
          ))}

          <text x={x(1)} y={y(2200) - 12} className={styles.tierLbl}>
            Tier up to 2,000
          </text>
          <text x={x(25)} y={y(5000) + 26} className={styles.tierLbl}>
            Tier up to 5,000
          </text>

          {/* the AI-user curve and its "head" */}
          <path d={curve} className={styles.users} stroke="url(#gr-users)" pathLength={1} />
          {CHECKS.map((c, k) => (
            <circle key={c.m} cx={x(c.m)} cy={y(c.v)} r={7} className={styles.dot} data-tone={c.tone} style={vars({ "--k": k })} />
          ))}
          <circle cx={x(36)} cy={y(3300)} r={6} className={styles.head} />
        </svg>

        {/* callouts on the true-up points */}
        {CHECKS.map((c, k) => (
          <div
            key={c.m}
            className={styles.callout}
            data-side={c.side}
            data-tone={c.tone}
            style={{ left: pct(x(c.m), W), top: pct(y(c.v), H), ...vars({ "--k": k }) }}
          >
            <b>{c.title}</b>
            <span>{c.text}</span>
          </div>
        ))}

        {/* above year three — tier prices do not change */}
        <div className={styles.fixed} style={{ left: pct(x(24), W), right: pct(R, W), top: pct(T - 6, H) }}>
          Tier prices locked by contract for three years
        </div>
      </div>

      {/* on a narrow screen the callouts become a list under the chart */}
      <ul className={styles.list}>
        {CHECKS.map((c) => (
          <li key={c.m} data-tone={c.tone}>
            <b>{c.title}</b>
            <span>{c.text}</span>
          </li>
        ))}
        <li data-tone="fixed">
          <b>Three years</b>
          <span>Tier prices locked by contract</span>
        </li>
      </ul>
    </figure>
  );
}
