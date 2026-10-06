"use client";

import { useSeen } from "@/components/ui/Reveal";
import { cx } from "@/lib/css";
import styles from "./Growth.module.css";

/* Три года лицензии на одном графике: потребители растут, ступень —
   ступенькой. Запас 10 % заштрихован. На ежегодной сверке видно,
   когда доплаты нет, а когда — переход на ступень выше. */

const W = 720;
const H = 300;
const L = 64;
const R = 16;
const T = 18;
const B = 40;
const MAX = 5600;
const x = (m: number) => L + (m / 36) * (W - L - R);
const y = (v: number) => H - B - (v / MAX) * (H - T - B);

const USERS: [number, number][] = [
  [0, 1500],
  [6, 1760],
  [12, 2100],
  [18, 2380],
  [24, 2600],
  [30, 2950],
  [36, 3300],
];
const line = USERS.map(([m, v]) => `${x(m).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
const tier = `M ${x(0)} ${y(2000)} H ${x(24)} V ${y(5000)} H ${x(36)}`;
const paid = `M ${x(0)} ${y(0)} V ${y(2000)} H ${x(24)} V ${y(5000)} H ${x(36)} V ${y(0)} Z`;

const NOTES = [
  { m: 12, v: 2100, n: 1, title: "Сверка через год", text: "2 100 потребителей\u00a0— в\u00a0запасе 10\u00a0%. Доплаты нет." },
  { m: 24, v: 2600, n: 2, title: "Сверка через два года", text: "2 600\u00a0— переход на\u00a0ступень до\u00a05\u00a0000. Доплата только разницы." },
  { m: 36, v: 3300, n: 3, title: "Три года", text: "Цена каждой ступени всё это время\u00a0— как в\u00a0договоре." },
];

export default function Growth() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.35);
  return (
    <div ref={ref} className={cx(styles.wrap, seen && styles.in)}>
      <figure className={styles.chart}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Рост числа потребителей за три года и ступень лицензии">
          <defs>
            <pattern id="buf" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="var(--gold-soft)" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--gold)" strokeWidth="2" />
            </pattern>
          </defs>

          {/* что оплачено: площадь под ступенью */}
          <path d={paid} className={styles.paid} />
          {/* запас 10 % над ступенью до 2 000 */}
          <rect x={x(0)} y={y(2200)} width={x(24) - x(0)} height={y(2000) - y(2200)} fill="url(#buf)" />
          <rect x={x(24)} y={y(5500)} width={x(36) - x(24)} height={y(5000) - y(5500)} fill="url(#buf)" />

          {[12, 24, 36].map((m) => (
            <line key={m} x1={x(m)} x2={x(m)} y1={T} y2={H - B} className={styles.check} />
          ))}
          <line x1={L} x2={W - R} y1={H - B} y2={H - B} className={styles.axis} />

          {[2000, 5000].map((v) => (
            <text key={v} x={L - 10} y={y(v) + 4} textAnchor="end" className={styles.tick}>
              {v === 2000 ? "2 000" : "5 000"}
            </text>
          ))}
          {["Год 1", "Год 2", "Год 3"].map((t, k) => (
            <text key={t} x={x(k * 12 + 6)} y={H - B + 24} textAnchor="middle" className={styles.tick}>
              {t}
            </text>
          ))}

          <path d={tier} className={styles.tier} />
          <polyline points={line} className={styles.users} pathLength={1} />

          {NOTES.map((n) => (
            <g key={n.n} className={styles.dot} transform={`translate(${x(n.m)} ${y(n.v)})`}>
              <circle r={8} />
            </g>
          ))}

          <text x={x(4)} y={y(2200) - 8} className={styles.lbl}>
            Ступень до 2 000
          </text>
          <text x={x(25)} y={y(5000) + 22} className={styles.lbl}>
            до 5 000
          </text>
          <text x={x(2)} y={y(1500) + 22} className={styles.lblUsers}>
            Потребители
          </text>
        </svg>
        <figcaption className={styles.legend}>
          <span data-k="tier">Оплаченная ступень</span>
          <span data-k="buf">Запас 10 % — без доплаты</span>
          <span data-k="users">Потребители за 30 дней</span>
        </figcaption>
      </figure>

      <ol className={styles.notes}>
        {NOTES.map((n) => (
          <li key={n.n}>
            <span aria-hidden="true" />
            <div>
              <b>{n.title}</b>
              <p>{n.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
