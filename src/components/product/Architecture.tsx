import Link from "next/link";
import { nb } from "@/lib/typo";
import styles from "./Architecture.module.css";

/* What gets installed in your network. The company is a light island on a
   dark field, its outline drawn like the "Perimeter" mark: one opening on the
   right, with the gateway next to it. Everything except external models sits
   inside; the only way out is the gold channel through the opening. */

const W = 960;
const H = 460;
const C = { x: 28, y: 28, w: 676, h: 404, r: 30 }; // company island
const GAP = { y1: 206, y2: 270 }; // opening on the right side

type Box = { x: number; y: number; w: number; h: number; t: string; s: string; k?: "gate" | "local" | "entry" };
const BOXES: Box[] = [
  { x: 68, y: 76, w: 230, h: 66, t: "Employees and services", s: "chats, apps, agents", k: "entry" },
  { x: 68, y: 205, w: 170, h: 66, t: "Okta, Entra ID", s: "SSO sign-in" },
  { x: 290, y: 190, w: 236, h: 96, t: "Kordon gateway", s: "rules, routing, usage tracking", k: "gate" },
  { x: 540, y: 76, w: 140, h: 66, t: "Portals", s: "employee, admin" },
  { x: 68, y: 336, w: 196, h: 66, t: "PostgreSQL, Redis", s: "audit log, cache" },
  { x: 284, y: 336, w: 196, h: 66, t: "SIEM, monitoring", s: "events, OTLP" },
  { x: 500, y: 336, w: 180, h: 66, t: "Local models", s: "for restricted data", k: "local" },
];

/* wires inside the network */
const WIRES = [
  "M 183 142 L 183 166 Q 183 172 189 172 L 340 172 Q 346 172 346 178 L 346 190",
  "M 238 238 L 290 238",
  "M 526 216 L 604 216 Q 610 216 610 210 L 610 142",
  "M 352 286 L 352 312 Q 352 318 346 318 L 172 318 Q 166 318 166 324 L 166 336",
  "M 408 286 L 408 336",
  "M 464 286 L 464 312 Q 464 318 470 318 L 584 318 Q 590 318 590 324 L 590 336",
];
/* outbound: through the opening, then a fork to two providers */
const OUTS = [
  "M 526 238 L 760 238 Q 772 238 772 226 L 772 168 Q 772 156 784 156 L 792 156",
  "M 526 238 L 760 238 Q 772 238 772 250 L 772 308 Q 772 320 784 320 L 792 320",
];
const EXT = [
  { y: 120, t: "Cloud providers", s: "OpenAI, Anthropic" },
  { y: 284, t: "Other providers", s: "Google, Mistral" },
];
/* what runs along the wires: requests to the gateway, the log, the cache, restricted data to the local model */
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
          aria-label="Diagram: everything except external models runs inside your network; the only way out is one opening through the gateway"
        >
          <defs>
            <filter id="arch-shadow" x="-10%" y="-10%" width="120%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0b1324" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* company island: the opening on the right is the only way out */}
          <rect className={styles.island} x={C.x} y={C.y} width={C.w} height={C.h} rx={C.r} />
          <rect className={styles.gapMark} x={C.x + C.w - 5} y={GAP.y1} width={10} height={GAP.y2 - GAP.y1} rx={5} />
          <text x={C.x + 24} y={C.y + 32} className={styles.zone}>
            Your network
          </text>
          <text x={C.x + C.w + 40} y={C.y + 32} className={styles.zoneDark}>
            Outside
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
          {/* only placeholders on the way out */}
          <g transform="translate(548 224)" className={styles.pill}>
            <rect width={136} height={28} rx={14} />
            <text x={68} y={19} textAnchor="middle">
              placeholders only
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
            <tspan x={C.x + C.w + 40}>Only what your rules</tspan>
            <tspan x={C.x + C.w + 40} dy={18}>
              allow ever leaves
            </tspan>
          </text>
        </svg>
      </div>

      {/* three facts about setup — a column as tall as the diagram */}
      <ul className={styles.facts}>
        <li>
          <b>Your servers or your cloud</b>
          <p>{nb("Docker Compose on a single server or Helm on Kubernetes — in your data center or cloud.")}</p>
        </li>
        <li>
          <b>No changes to app code</b>
          <p>{nb("The API is OpenAI-compatible: apps and agents change only the endpoint and key.")}</p>
        </li>
        {/* the customer benefit — highlighted, leads to the calculation below */}
        <li className={styles.save}>
          <b>A smaller model bill</b>
          <p>{nb("Simple tasks go to cheaper models, repeat questions come from cache, budgets cap spend.")}</p>
          <Link className="btn btn-gold" href="#savings">
            See what it costs <span className="arr" aria-hidden="true">↓</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
