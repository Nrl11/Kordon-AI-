"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, matches, REDUCED } from "@/lib/motion";
import { useInView } from "@/components/ui/Reveal";
import { useWidth } from "@/lib/useWidth";
import { usd } from "@/lib/format";
import { cx, vars } from "@/lib/css";
import styles from "./SpendFlow.module.css";

/* Where the money goes — a sample month on the pay-as-you-go API. On the
   left, the tasks employees hand to AI; ribbon width is token volume.
   Kordon sends each task to a suitable model and prices it: tokens ×
   model price. On the right, each model's cost in dollars. The point is
   plain: the thick stream of simple tasks costs little, the thin stream
   of complex ones takes most of the bill. The dot shows how one request
   is priced. Hovering a ribbon (or focusing its label from the keyboard)
   highlights it, dims the rest and shows that ribbon's numbers. */

const TASKS = [
  { id: "simple", title: "Simple tasks", sub: "58% of volume", t: 520, bill: 10, hint: "translations, emails, summaries" },
  { id: "normal", title: "Routine tasks", sub: "33% of volume", t: 300, bill: 35, hint: "knowledge base answers, reports" },
  { id: "hard", title: "Complex tasks", sub: "9% of volume", t: 80, bill: 55, hint: "code, financial models, analysis" },
];
const MODELS = [
  { id: "lite", title: "Gemini 3.5 Flash-Lite", sub: "fast and cheap", t: 330, usd: 240 },
  { id: "local", title: "Llama on your servers", sub: "your own hardware", t: 140, usd: 0 },
  { id: "pro", title: "Gemini 3.1 Pro", sub: "long documents", t: 230, usd: 920 },
  { id: "claude", title: "Claude Opus 5.5", sub: "code and deep analysis", t: 200, usd: 1_440 },
];
const TOTAL = MODELS.reduce((s, m) => s + m.usd, 0); // $2,600 at October 2026 list prices
const MAX = Math.max(...MODELS.map((m) => m.usd));
const pct = (v: number) => Math.round((v / TOTAL) * 100);

/* how one request is priced */
const EXAMPLES = [
  { task: "simple", model: "lite", who: "A. Brooks, Legal", what: "“summarize this contract” · 2,300 tokens", cost: "$0.002" },
  { task: "hard", model: "claude", who: "CI pipeline, Engineering", what: "code review · 8,400 tokens", cost: "$0.06" },
  { task: "normal", model: "local", who: "Support bot", what: "knowledge base answer · 1,900 tokens", cost: "$0" },
  { task: "normal", model: "pro", who: "O. Smith, Procurement", what: "email to a supplier · 3,100 tokens", cost: "$0.01" },
];

type Hot = { side: "in" | "out"; id: string } | null;

/* labels must not overlap: push centers at least min apart */
function spread(ys: number[], min: number, top: number, bottom: number) {
  const out = [...ys];
  for (let k = 1; k < out.length; k++) out[k] = Math.max(out[k], out[k - 1] + min);
  if (out[out.length - 1] > bottom) out[out.length - 1] = bottom;
  for (let k = out.length - 2; k >= 0; k--) out[k] = Math.min(out[k], out[k + 1] - min);
  if (out[0] < top) return spread(ys.map((y) => y + (top - out[0])), min, top, bottom + 1000);
  return out;
}

function geometry(w: number) {
  const h = 332;
  const L = 250; // right edge of the task labels
  const R = w - 320; // model bar, labels to its right
  const G = Math.round(L + (R - L) * 0.5);
  const top = 38;
  const usable = 280;
  const gapL = 22;
  const gapR = 14;
  const all = TASKS.reduce((s, x) => s + x.t, 0);
  const k = (usable - gapR * (MODELS.length - 1)) / all;
  const gateH = all * k;
  const gateY = top + (usable - gateH) / 2;

  const lH = all * k + gapL * (TASKS.length - 1);
  let y = top + (usable - lH) / 2;
  const left = TASKS.map((s) => {
    const hh = s.t * k;
    const n = { ...s, y, h: hh };
    y += hh + gapL;
    return n;
  });
  y = top;
  const right = MODELS.map((m) => {
    const hh = m.t * k;
    const n = { ...m, y, h: hh };
    y += hh + gapR;
    return n;
  });

  const ribbon = (x1: number, a1: number, b1: number, x2: number, a2: number, b2: number) => {
    const m = (x1 + x2) / 2;
    return `M${x1},${a1} C${m},${a1} ${m},${a2} ${x2},${a2} L${x2},${b2} C${m},${b2} ${m},${b1} ${x1},${b1} Z`;
  };
  const center = (x1: number, y1: number, x2: number, y2: number) => {
    const m = (x1 + x2) / 2;
    return `M${x1},${y1} C${m},${y1} ${m},${y2} ${x2},${y2}`;
  };
  /* each ribbon has a midpoint: the hover tooltip sits there */
  let gy = gateY;
  const ins = left.map((n) => {
    const a2 = gy;
    gy += n.h;
    return {
      id: n.id,
      d: ribbon(L + 8, n.y, n.y + n.h, G - 6, a2, gy),
      c: center(L + 8, n.y + n.h / 2, G - 6, (a2 + gy) / 2),
      mx: (L + 8 + G - 6) / 2,
      my: (n.y + n.h / 2 + (a2 + gy) / 2) / 2 - n.h * 0.25,
    };
  });
  gy = gateY;
  const outs = right.map((n) => {
    const a1 = gy;
    gy += n.h;
    return {
      id: n.id,
      d: ribbon(G + 6, a1, gy, R, n.y, n.y + n.h),
      c: center(G + 6, (a1 + gy) / 2, R, n.y + n.h / 2),
      mx: (G + 6 + R) / 2,
      my: ((a1 + gy) / 2 + n.y + n.h / 2) / 2 - n.h * 0.25,
    };
  });
  const ly = spread(left.map((n) => n.y + n.h / 2), 52, top + 8, top + usable);
  const ry = spread(right.map((n) => n.y + n.h / 2), 52, top + 8, top + usable + 20);
  return { w, h, L, R, G, gateY, gateH, left, right, ins, outs, ly, ry };
}

export default function SpendFlow() {
  const box = useRef<HTMLDivElement>(null);
  const width = useWidth(box, 1200);
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const wide = width >= 760;
  const g = geometry(Math.max(width, 760));
  const [n, setN] = useState(0);
  const [at, setAt] = useState<"task" | "gate" | "model">("task");
  const ex = EXAMPLES[n];
  /* the dot is its own layer above the diagram: only its transform moves,
     the diagram underneath is not repainted */
  const dot = useRef<HTMLSpanElement>(null);
  const paths = useRef<Record<string, SVGPathElement | null>>({});
  /* the ribbon under the cursor or in focus lights up; the example keeps running */
  const [hot, setHot] = useState<Hot>(null);
  const isHot = (side: "in" | "out", id: string) => hot?.side === side && hot.id === id;
  const point = (side: "in" | "out", id: string) => ({
    onMouseEnter: () => setHot({ side, id }),
    onMouseLeave: () => setHot(null),
  });

  useEffect(() => {
    const c = dot.current;
    const a = paths.current[`in-${ex.task}`];
    const b = paths.current[`out-${ex.model}`];
    if (!wide || !c || !a || !b) return;
    const place = (x: number, y: number) => {
      c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    if (!inView || matches(REDUCED)) {
      const end = b.getPointAtLength(b.getTotalLength());
      place(end.x, end.y);
      gsap.set(c, { opacity: 1 });
      const id = requestAnimationFrame(() => setAt("model"));
      return () => cancelAnimationFrame(id);
    }
    const run = (p: SVGPathElement, dur: number) => {
      const L = p.getTotalLength();
      const o = { t: 0 };
      return gsap.to(o, {
        t: 1,
        duration: dur,
        ease: "power1.inOut",
        onUpdate: () => {
          const pt = p.getPointAtLength(o.t * L);
          place(pt.x, pt.y);
        },
      });
    };
    const s = a.getPointAtLength(0);
    const ga = a.getPointAtLength(a.getTotalLength());
    const gb = b.getPointAtLength(0);
    const hop = { x: ga.x, y: ga.y };
    const tl = gsap.timeline({ onComplete: () => setN((x) => (x + 1) % EXAMPLES.length) });
    tl.call(() => setAt("task"));
    tl.set(c, { opacity: 0 });
    tl.call(() => place(s.x, s.y));
    tl.to(c, { opacity: 1, duration: 0.25 });
    tl.add(run(a, 1.1));
    tl.call(() => setAt("gate"));
    /* inside Kordon the task gets a model and a price */
    tl.to(hop, { x: gb.x, y: gb.y, duration: 0.6, ease: "power2.inOut", onUpdate: () => place(hop.x, hop.y) }, "+=0.35");
    tl.add(run(b, 1.1), "+=0.4");
    tl.call(() => setAt("model"));
    tl.to({}, { duration: 1.8 });
    tl.to(c, { opacity: 0, duration: 0.3 });
    return () => {
      tl.kill();
    };
  }, [n, inView, wide, ex.task, ex.model, width]);

  /* tooltip for the ribbon under the cursor */
  const tip = (() => {
    if (!hot || !wide) return null;
    if (hot.side === "in") {
      const r = g.ins.find((x) => x.id === hot.id);
      const t = TASKS.find((x) => x.id === hot.id);
      if (!r || !t) return null;
      return { x: r.mx, y: r.my, title: t.title, note: t.hint, value: `${t.sub} · ${t.bill}% of the bill` };
    }
    const r = g.outs.find((x) => x.id === hot.id);
    const m = MODELS.find((x) => x.id === hot.id);
    if (!r || !m) return null;
    return {
      x: r.mx,
      y: r.my,
      title: m.title,
      note: `${m.t}M tokens a month`,
      value: `${usd(m.usd)} · ${pct(m.usd)}% of the bill`,
    };
  })();

  return (
    <div ref={ref} className={cx(styles.flow, inView && styles.in)}>
      <div ref={box} className={styles.box}>
        {wide ? (
          <div className={styles.canvas} style={{ height: g.h }} data-hover={hot ? "" : undefined}>
            <svg className={styles.svg} width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden="true">
              {g.ins.map((r, i) => (
                <g
                  key={r.id}
                  className={styles.ribbonIn}
                  data-on={(!hot && r.id === ex.task && at !== "model") || undefined}
                  data-hot={isHot("in", r.id) || undefined}
                  style={vars({ "--i": i })}
                  {...point("in", r.id)}
                >
                  <path d={r.d} />
                  <path
                    ref={(el) => {
                      paths.current[`in-${r.id}`] = el;
                    }}
                    className={styles.center}
                    d={r.c}
                  />
                </g>
              ))}
              {g.outs.map((r, i) => (
                <g
                  key={r.id}
                  className={styles.ribbonOut}
                  data-on={(!hot && r.id === ex.model && at === "model") || undefined}
                  data-hot={isHot("out", r.id) || undefined}
                  style={vars({ "--i": i })}
                  {...point("out", r.id)}
                >
                  <path d={r.d} />
                  <path
                    ref={(el) => {
                      paths.current[`out-${r.id}`] = el;
                    }}
                    className={styles.center}
                    d={r.c}
                  />
                </g>
              ))}

              {g.left.map((s) => (
                <rect key={s.id} className={styles.barSrc} x={g.L} y={s.y} width={8} height={s.h} rx={2} />
              ))}
              {g.right.map((t) => (
                <rect key={t.id} className={styles.barTeam} x={g.R} y={t.y} width={8} height={t.h} rx={2} />
              ))}

              <rect className={styles.gate} x={g.G - 6} y={g.gateY} width={12} height={g.gateH} rx={4} />
              <g transform={`translate(${g.G - 15},${g.gateY - 46})`} className={styles.mark}>
                <path d="M27 11.6V9.2a5.8 5.8 0 0 0-5.8-5.8H8.8A5.8 5.8 0 0 0 3 9.2v11.6a5.8 5.8 0 0 0 5.8 5.8h12.4a5.8 5.8 0 0 0 5.8-5.8v-2.4" />
                <path className={styles.markCore} d="M15 15H28" />
                <circle className={styles.markDot} cx={15} cy={15} r={4} />
              </g>
            </svg>
            <span ref={dot} className={styles.dot} aria-hidden="true" />

            {g.left.map((s, k) => (
              <div
                key={s.id}
                className={styles.label}
                data-on={(!hot && s.id === ex.task && at !== "model") || undefined}
                data-hot={isHot("in", s.id) || undefined}
                style={{ left: 0, width: g.L - 14, top: g.ly[k] }}
                tabIndex={0}
                aria-label={`${s.title}: ${s.sub}, ${s.bill}% of the bill`}
                {...point("in", s.id)}
                onFocus={() => setHot({ side: "in", id: s.id })}
                onBlur={() => setHot(null)}
              >
                <b>{s.title}</b>
                <span>{s.sub}</span>
              </div>
            ))}

            {g.right.map((m, k) => (
              <div
                key={m.id}
                className={cx(styles.label, styles.team)}
                data-on={(!hot && m.id === ex.model && at === "model") || undefined}
                data-hot={isHot("out", m.id) || undefined}
                style={{ left: g.R + 20, top: g.ry[k] }}
                tabIndex={0}
                aria-label={`${m.title}: ${m.t}M tokens, ${usd(m.usd)}, ${pct(m.usd)}% of the bill`}
                {...point("out", m.id)}
                onFocus={() => setHot({ side: "out", id: m.id })}
                onBlur={() => setHot(null)}
              >
                <b>{m.title}</b>
                <span className={styles.cost}>
                  <i style={vars({ "--w": m.usd / MAX, "--i": k })} />
                  <em>{usd(m.usd)}</em>
                </span>
              </div>
            ))}

            {tip && (
              <div key={`${hot?.side}-${hot?.id}`} className={styles.tip} style={{ left: tip.x, top: tip.y }} aria-hidden="true">
                <b>{tip.title}</b>
                <span>{tip.note}</span>
                <em>{tip.value}</em>
              </div>
            )}
          </div>
        ) : (
          <ul className={styles.list}>
            {MODELS.map((m, i) => (
              <li key={m.id}>
                <b>{m.title}</b>
                <span>
                  {m.sub} · {m.t}M tokens
                </span>
                <span className={styles.cost}>
                  <i style={vars({ "--w": m.usd / MAX, "--i": i })} />
                  <em>{usd(m.usd)}</em>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>Simple tasks</dt>
          <dd>58% of volume — 10% of the bill</dd>
        </div>
        <div>
          <dt>Complex tasks</dt>
          <dd>9% of volume — 55% of the bill</dd>
        </div>
        <div>
          <dt>Local model</dt>
          <dd>Confidential tasks — $0 in token fees</dd>
        </div>
      </dl>
      <p className="sr-only">Monthly total on the pay-as-you-go API: {usd(TOTAL)}.</p>
    </div>
  );
}
