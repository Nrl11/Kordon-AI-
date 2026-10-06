import styles from "./Scene.module.css";

/* Кордон в схемах — знак «Периметр»: контур с проходом, золотой канал
   и ядро. Центр знака — в точке (x, y). */
export default function Gate({ x, y, size = 44, label, busy }: { x: number; y: number; size?: number; label?: string; busy?: boolean }) {
  const s = size / 44;
  return (
    <g className={styles.gate} data-busy={busy || undefined} transform={`translate(${x - 22 * s},${y - 22 * s}) scale(${s})`}>
      <rect className={styles.gateBg} x={-5} y={-5} width={54} height={54} rx={16} />
      <circle className={styles.gateBusy} cx={22} cy={22} r={31} />
      <path
        className={styles.gateContour}
        d="M40 17V13.5a8.5 8.5 0 0 0-8.5-8.5h-19A8.5 8.5 0 0 0 4 13.5v17A8.5 8.5 0 0 0 12.5 39h19a8.5 8.5 0 0 0 8.5-8.5V27"
      />
      <path className={styles.gateChannel} d="M22 22H41" />
      <circle className={styles.gateDot} cx={22} cy={22} r={6} />
      {label && (
        <text className={styles.gateLabel} x={22} y={-14} textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}
