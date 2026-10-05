import styles from "./Inside.module.css";

/* Схема маршрута в пикселях полосы: слева — зона компании, справа —
   внешние модели (без имён: их много, и это неважно). Кордон стоит на
   границе зон — это шлюз. Из него путь наружу веером к моделям или вниз,
   в локальную модель внутри контура. Точка запроса едет по этим путям,
   а GSAP находит их по data-r. */

export function routeGeometry(w: number) {
  const narrow = w < 560;
  const h = narrow ? 204 : 212;
  const cy = Math.round(h * 0.47);
  const bx = Math.round(w * (narrow ? 0.55 : 0.6)); // граница и Кордон
  const gap = 10;
  const who = { x: narrow ? 22 : 46, y: cy };
  const mx = w - (narrow ? 26 : 56); // внешние модели
  const spread = narrow ? 48 : 54;
  const models = [cy - spread, cy, cy + spread].map((y) => ({ x: mx, y }));
  const hub = Math.round(bx + (mx - bx) * (narrow ? 0.42 : 0.5));
  const k = (mx - hub) * 0.55;
  /* на телефоне узел ближе к Кордону — подписи слева хватает места */
  const local = { x: Math.round(narrow ? bx - 40 : bx * 0.58), y: h - (narrow ? 30 : 32) };
  const turn = Math.max(local.x + 12, bx - (narrow ? 34 : 70));
  return {
    narrow,
    w,
    h,
    cy,
    bx,
    gap,
    who,
    models,
    local,
    paths: {
      in: `M${who.x},${cy} H${bx}`,
      ext: models.map((m) => `M${bx},${cy} H${hub} C${hub + k},${cy} ${mx - k},${m.y} ${mx},${m.y}`),
      local: `M${bx},${cy} C${bx},${cy + (local.y - cy) * 0.75} ${bx - 6},${local.y} ${turn},${local.y} H${local.x}`,
    },
  };
}
export type Geometry = ReturnType<typeof routeGeometry>;

/* искра — знак модели */
const spark = (x: number, y: number, s: number) =>
  `M${x},${y - s} C${x + s * 0.18},${y - s * 0.18} ${x + s * 0.18},${y - s * 0.18} ${x + s},${y} C${x + s * 0.18},${y + s * 0.18} ${x + s * 0.18},${y + s * 0.18} ${x},${y + s} C${x - s * 0.18},${y + s * 0.18} ${x - s * 0.18},${y + s * 0.18} ${x - s},${y} C${x - s * 0.18},${y - s * 0.18} ${x - s * 0.18},${y - s * 0.18} ${x},${y - s}Z`;

export default function Route({ g, who, closed }: { g: Geometry; who: string; closed: boolean }) {
  const { w, h, cy, bx, gap, local, models, paths, narrow } = g;
  const cross = bx + gap + (narrow ? 14 : 22); // отметка проверки сразу за границей
  return (
    <svg className={styles.routeSvg} width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Маршрут запроса через Кордон">
      {/* зоны */}
      <rect className={styles.zoneIn} x={0.5} y={0.5} width={bx - gap - 1} height={h - 1} rx={18} />
      <rect className={styles.zoneOut} x={bx + gap + 0.5} y={0.5} width={w - bx - gap - 1} height={h - 1} rx={18} />
      <text className={styles.zoneLabel} x={16} y={26}>
        Внутри компании
      </text>
      <text className={styles.zoneLabel} x={bx + gap + 14} y={26}>
        Внешние модели
      </text>

      {/* пути: тонкая основа и подсветка, которая прорисовывается за точкой */}
      <path className={styles.base} d={paths.in} />
      <path className={styles.base} d={paths.local} />
      {paths.ext.map((d, i) => (
        <path key={i} className={styles.base} d={d} />
      ))}
      <path className={styles.hl} data-l="in" data-r="hl-in" d={paths.in} />
      <path className={styles.hl} data-l="local" data-r="hl-local" d={paths.local} />
      {paths.ext.map((d, i) => (
        <path key={i} className={styles.hl} data-l="ext" data-r={`hl-ext-${i}`} d={d} />
      ))}

      {/* проверка на границе: маскирование — можно, закрытое — нельзя */}
      <g className={styles.check} data-r="check" data-closed={closed || undefined}>
        <circle cx={cross} cy={cy} r={9} />
        {closed ? (
          <path d={`M${cross - 3.5},${cy - 3.5} l7,7 M${cross + 3.5},${cy - 3.5} l-7,7`} />
        ) : (
          <path d={`M${cross - 4},${cy + 0.5} l2.8,2.8 l5.2,-5.6`} />
        )}
        {!narrow && (
          <text x={cross + 16} y={cy - 16}>
            {closed ? "наружу нельзя" : "маскирование — можно"}
          </text>
        )}
      </g>

      {/* сотрудник */}
      <g className={styles.node} data-n="who" data-r="who">
        <circle cx={g.who.x} cy={cy} r={7} />
        <text x={g.who.x - 7} y={cy - 18}>
          {who}
        </text>
      </g>

      {/* локальная модель */}
      <g className={styles.node} data-n="local" data-r="local">
        <rect x={local.x - 13} y={local.y - 13} width={26} height={26} rx={8} />
        <path className={styles.spark} d={spark(local.x, local.y, 6)} />
        <text x={local.x - 22} y={local.y + 5} textAnchor="end">
          Локальная модель
        </text>
      </g>

      {/* внешние модели — без имён */}
      {models.map((m, i) => (
        <g key={i} className={styles.node} data-n="model" data-r={`model-${i}`}>
          <rect x={m.x - 13} y={m.y - 13} width={26} height={26} rx={8} />
          <path className={styles.spark} d={spark(m.x, m.y, 6)} />
        </g>
      ))}

      {/* Кордон — знак «Периметр» на границе: контур, проход, ядро */}
      <g className={styles.core} data-r="core" transform={`translate(${bx - 22},${cy - 22})`}>
        <rect className={styles.coreBg} x={-4} y={-4} width={52} height={52} rx={16} />
        <circle className={styles.busy} cx={22} cy={22} r={30} />
        <path
          className={styles.coreContour}
          d="M40 17V13.5a8.5 8.5 0 0 0-8.5-8.5h-19A8.5 8.5 0 0 0 4 13.5v17A8.5 8.5 0 0 0 12.5 39h19a8.5 8.5 0 0 0 8.5-8.5V27"
        />
        <path className={styles.coreChannel} d="M22 22H41" />
        <circle className={styles.coreDot} cx={22} cy={22} r={6} />
        <text x={-12} y={62} textAnchor="end">
          Кордон
        </text>
      </g>

      {/* вспышка в точке прибытия и сама точка запроса */}
      <circle className={styles.pulse} data-r="pulse" cx={0} cy={0} r={10} />
      <circle className={styles.dot} data-r="dot" cx={g.who.x} cy={cy} r={0} />
    </svg>
  );
}
