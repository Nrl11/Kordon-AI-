"use client";

import { useSeen } from "@/components/ui/Reveal";
import { cx, vars } from "@/lib/css";
import styles from "./Growth.module.css";

/* Три года лицензии одной картинкой. Лицензия — кобальтовая лестница,
   над ступенью золотом запас 10 %, по ней поднимается кривая
   потребителей. Пояснения стоят прямо на точках ежегодной сверки:
   через год — в запасе, доплаты нет; через два — переход на ступень
   выше. Над третьим годом — цена ступеней зафиксирована. */

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

/* плавная кривая без выбросов за точки (монотонная) */
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

/* точки сверки: где стоит пояснение и что в нём */
const CHECKS = [
  {
    m: 12,
    v: 2100,
    tone: "ok",
    title: "Сверка через год",
    text: "2 100 потребителей — в запасе 10 %, доплаты нет",
    side: "pin",
  },
  {
    m: 24,
    v: 2600,
    tone: "up",
    title: "Сверка через два года",
    text: "2 600 — переход на ступень до 5 000, доплата только разницы",
    side: "upleft",
  },
] as const;

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;

export default function Growth() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.3);
  return (
    <figure ref={ref} className={cx(styles.card, seen && styles.in)}>
      <figcaption className={styles.legend}>
        <span data-k="tier">Оплаченная ступень</span>
        <span data-k="buf">Запас 10 % — без доплаты</span>
        <span data-k="users">Потребители за 30 дней</span>
      </figcaption>

      <div className={styles.plot}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Рост числа потребителей за три года и ступень лицензии">
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

          {/* годы — полосами, второй чуть темнее */}
          <rect x={x(12)} y={T - 10} width={x(24) - x(12)} height={H - B - T + 10} className={styles.band} />

          {/* оплаченная ступень и запас над ней */}
          <path d={paid} fill="url(#gr-paid)" className={styles.fill} />
          <g className={styles.buf}>
            <rect x={x(0)} y={y(2200)} width={x(24) - x(0)} height={y(2000) - y(2200)} fill="url(#gr-buf)" />
            <rect x={x(24)} y={y(5500)} width={x(36) - x(24)} height={y(5000) - y(5500)} fill="url(#gr-buf)" />
            <path d={`M${x(0)},${y(2200)} H${x(24)} M${x(24)},${y(5500)} H${x(36)}`} className={styles.bufEdge} />
          </g>
          <path d={tier} className={styles.tier} pathLength={1} />

          {/* сверки — пунктиром на всю высоту */}
          {[12, 24].map((m) => (
            <line key={m} x1={x(m)} x2={x(m)} y1={T - 10} y2={H - B} className={styles.check} />
          ))}
          <line x1={L} x2={W - R} y1={H - B} y2={H - B} className={styles.axis} />

          {[2000, 5000].map((v) => (
            <text key={v} x={L - 14} y={y(v) + 5} textAnchor="end" className={styles.tick}>
              {v === 2000 ? "2 000" : "5 000"}
            </text>
          ))}
          {["Год 1", "Год 2", "Год 3"].map((t, k) => (
            <text key={t} x={x(k * 12 + 6)} y={H - B + 28} textAnchor="middle" className={styles.year}>
              {t}
            </text>
          ))}

          <text x={x(1)} y={y(2200) - 12} className={styles.tierLbl}>
            Ступень до 2 000
          </text>
          <text x={x(25)} y={y(5000) + 26} className={styles.tierLbl}>
            Ступень до 5 000
          </text>

          {/* кривая потребителей и её «голова» */}
          <path d={curve} className={styles.users} stroke="url(#gr-users)" pathLength={1} />
          {CHECKS.map((c, k) => (
            <circle key={c.m} cx={x(c.m)} cy={y(c.v)} r={7} className={styles.dot} data-tone={c.tone} style={vars({ "--k": k })} />
          ))}
          <circle cx={x(36)} cy={y(3300)} r={6} className={styles.head} />
        </svg>

        {/* пояснения на точках сверки */}
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

        {/* над третьим годом — цена ступеней не меняется */}
        <div className={styles.fixed} style={{ left: pct(x(24), W), right: pct(R, W), top: pct(T - 6, H) }}>
          Цена ступеней — как в договоре все три года
        </div>
      </div>

      {/* на узком экране пояснения — списком под графиком */}
      <ul className={styles.list}>
        {CHECKS.map((c) => (
          <li key={c.m} data-tone={c.tone}>
            <b>{c.title}</b>
            <span>{c.text}</span>
          </li>
        ))}
        <li data-tone="fixed">
          <b>Три года</b>
          <span>Цена ступеней — как в договоре</span>
        </li>
      </ul>
    </figure>
  );
}
