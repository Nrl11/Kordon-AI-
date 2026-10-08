import Link from "next/link";
import { nb } from "@/lib/typo";
import styles from "./Architecture.module.css";

/* Что ставится в ваш контур. Компания — светлый остров на тёмном поле,
   его контур нарисован как знак «Периметр»: один проход справа, у прохода —
   шлюз. Всё, кроме внешних моделей, стоит внутри; наружу ведёт только
   золотой канал через проход. */

const W = 960;
const H = 460;
const C = { x: 28, y: 28, w: 676, h: 404, r: 30 }; // остров компании
const GAP = { y1: 206, y2: 270 }; // проход на правой стороне

type Box = { x: number; y: number; w: number; h: number; t: string; s: string; k?: "gate" | "local" | "entry" };
const BOXES: Box[] = [
  { x: 68, y: 76, w: 230, h: 66, t: "Сотрудники и сервисы", s: "чаты, приложения, агенты", k: "entry" },
  { x: 68, y: 205, w: 170, h: 66, t: "Keycloak", s: "вход через SSO" },
  { x: 290, y: 190, w: 236, h: 96, t: "Шлюз Кордон", s: "правила, маршрут, учёт", k: "gate" },
  { x: 540, y: 76, w: 140, h: 66, t: "Порталы", s: "сотрудник, админ" },
  { x: 68, y: 336, w: 196, h: 66, t: "PostgreSQL и Redis", s: "журнал, кэш" },
  { x: 284, y: 336, w: 196, h: 66, t: "SIEM и мониторинг", s: "события, OTLP" },
  { x: 500, y: 336, w: 180, h: 66, t: "Локальные модели", s: "для закрытого", k: "local" },
];

/* провода внутри контура */
const WIRES = [
  "M 183 142 L 183 166 Q 183 172 189 172 L 340 172 Q 346 172 346 178 L 346 190",
  "M 238 238 L 290 238",
  "M 526 216 L 604 216 Q 610 216 610 210 L 610 142",
  "M 352 286 L 352 312 Q 352 318 346 318 L 172 318 Q 166 318 166 324 L 166 336",
  "M 408 286 L 408 336",
  "M 464 286 L 464 312 Q 464 318 470 318 L 584 318 Q 590 318 590 324 L 590 336",
];
/* наружу: через проход, затем развилка к двум провайдерам */
const OUTS = [
  "M 526 238 L 760 238 Q 772 238 772 226 L 772 168 Q 772 156 784 156 L 792 156",
  "M 526 238 L 760 238 Q 772 238 772 250 L 772 308 Q 772 320 784 320 L 792 320",
];
const EXT = [
  { y: 120, t: "Облачные модели", s: "OpenAI, Anthropic" },
  { y: 284, t: "Российские модели", s: "GigaChat, YandexGPT" },
];
/* что бежит по проводам: запросы к шлюзу, журнал, кэш, закрытое — в локальную */
const FLOWS = [
  { d: 0, dur: 2.4, k: "in", begin: 0 },
  { d: 3, dur: 2.2, k: "db", begin: 0.6 },
  { d: 4, dur: 1.6, k: "log", begin: 0.3 },
  { d: 5, dur: 2.2, k: "local", begin: 1.1 },
  { d: 2, dur: 2.0, k: "in", begin: 0.9 },
];

export default function Architecture() {
  return (
    <div className={styles.stage}>
      <div className={styles.board}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Схема: всё, кроме внешних моделей, стоит в вашем контуре; наружу ведёт один проход через шлюз"
        >
          <defs>
            <filter id="arch-shadow" x="-10%" y="-10%" width="120%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0b1324" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* остров компании: проход справа — единственный выход наружу */}
          <rect className={styles.island} x={C.x} y={C.y} width={C.w} height={C.h} rx={C.r} />
          <rect className={styles.gapMark} x={C.x + C.w - 5} y={GAP.y1} width={10} height={GAP.y2 - GAP.y1} rx={5} />
          <text x={C.x + 24} y={C.y + 32} className={styles.zone}>
            Ваш контур
          </text>
          <text x={C.x + C.w + 40} y={C.y + 32} className={styles.zoneDark}>
            Снаружи
          </text>

          {WIRES.map((d, k) => (
            <path key={k} d={d} className={styles.wire} />
          ))}
          {OUTS.map((d, k) => (
            <g key={d}>
              <path d={d} className={styles.wireOut} />
              <circle r={4.5} className={styles.dot}>
                <animateMotion dur="2.6s" begin={`${k * 1.3}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          ))}
          {FLOWS.map((f, k) => (
            <circle key={k} r={4} className={styles.flow} data-k={f.k}>
              <animateMotion dur={`${f.dur}s`} begin={`${f.begin}s`} repeatCount="indefinite" path={WIRES[f.d]} />
            </circle>
          ))}
          {/* на выходе — только метки */}
          <g transform="translate(548 224)" className={styles.pill}>
            <rect width={136} height={28} rx={14} />
            <text x={68} y={19} textAnchor="middle">
              метки вместо данных
            </text>
          </g>

          {BOXES.map((b) => (
            <g key={b.t} transform={`translate(${b.x} ${b.y})`} className={styles.box} data-k={b.k} filter="url(#arch-shadow)">
              <rect width={b.w} height={b.h} rx={14} />
              <rect className={styles.tick} x={0} y={14} width={4} height={b.h - 28} rx={2} />
              <text x={18} y={b.h / 2 - 2}>
                {b.t}
              </text>
              <text x={18} y={b.h / 2 + 17} className={styles.sub}>
                {b.s}
              </text>
            </g>
          ))}

          {EXT.map((e) => (
            <g key={e.t} transform={`translate(786 ${e.y})`} className={styles.ext}>
              <rect width={166} height={72} rx={14} />
              <text x={14} y={32}>
                {e.t}
              </text>
              <text x={14} y={52} className={styles.subDark}>
                {e.s}
              </text>
            </g>
          ))}
          <text x={C.x + C.w + 40} y={404} className={styles.noteDark}>
            <tspan x={C.x + C.w + 40}>Наружу — только то,</tspan>
            <tspan x={C.x + C.w + 40} dy={18}>
              что разрешают правила
            </tspan>
          </text>
        </svg>
      </div>

      {/* три факта о подключении — колонка высотой со схему */}
      <ul className={styles.facts}>
        <li>
          <b>На вашем сервере или в облаке</b>
          <p>{nb("Docker Compose на одном сервере или Helm в Kubernetes — в вашем дата-центре или облаке.")}</p>
        </li>
        <li>
          <b>Код приложений не меняется</b>
          <p>{nb("API совместим с OpenAI: приложения и агенты меняют только адрес и ключ.")}</p>
        </li>
        {/* выгода для клиента — подсвечена и ведёт к расчёту ниже */}
        <li className={styles.save}>
          <b>Счёт за модели меньше</b>
          <p>{nb("Простое — в дешёвые модели, повторы — из кэша, лимиты держат бюджет.")}</p>
          <Link className="btn btn-gold" href="#savings">
            Сколько это стоит <span className="arr" aria-hidden="true">↓</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
