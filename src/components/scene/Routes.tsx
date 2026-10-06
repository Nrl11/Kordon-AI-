"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, matches, REDUCED } from "@/lib/motion";
import { useInView } from "@/components/ui/Reveal";
import { useWidth } from "@/lib/useWidth";
import Gate from "./Gate";
import styles from "./Scene.module.css";

/* Сцена-маршрут по шагам: запрос идёт от источника к Кордону, Кордон
   принимает решение (подпись у знака), и запрос либо уходит к цели,
   либо останавливается на шлюзе. Раскладку строит вызывающий компонент
   по ширине: широкая — слева направо, узкая — сверху вниз. */

export type Tone = "ok" | "stop" | "local";

export interface RNode {
  id: string;
  x: number;
  y: number;
  side: "src" | "dst";
  title: string;
  sub?: string;
  note?: string;
  kind?: "local";
}

export interface RGeo {
  w: number;
  h: number;
  vertical?: boolean;
  gate: { x: number; y: number };
  verdict: { x: number; y: number };
  zones?: { x: number; y: number; w: number; h: number; kind: "in" | "out"; label: string }[];
  nodes: RNode[];
}

export interface RStep {
  from: string;
  to: string | null;
  verdict: string;
  tone: Tone;
  caption: ReactNode;
}

const G = 26; // радиус знака: пути начинаются и кончаются у его края

function inPath(n: RNode, g: RGeo) {
  const { x: gx, y: gy } = g.gate;
  if (g.vertical) {
    const d = (gy - n.y) * 0.5;
    return `M${n.x},${n.y} C${n.x},${n.y + d} ${gx},${gy - G - d} ${gx},${gy - G}`;
  }
  const d = (gx - n.x) * 0.5;
  return `M${n.x},${n.y} C${n.x + d},${n.y} ${gx - G - d},${gy} ${gx - G},${gy}`;
}
function outPath(n: RNode, g: RGeo) {
  const { x: gx, y: gy } = g.gate;
  if (g.vertical) {
    const d = (n.y - gy) * 0.5;
    return `M${gx},${gy + G} C${gx},${gy + G + d} ${n.x},${n.y - d} ${n.x},${n.y}`;
  }
  const d = (n.x - gx) * 0.5;
  return `M${gx + G},${gy} C${gx + G + d},${gy} ${n.x - d},${n.y} ${n.x},${n.y}`;
}

function nodeStyle(n: RNode, vertical?: boolean) {
  if (vertical) {
    return { left: n.x, top: n.y, transform: n.side === "src" ? "translate(-50%, -100%)" : "translate(-50%, 0)" };
  }
  return { left: n.x, top: n.y, transform: n.side === "src" ? "translate(-100%, -50%)" : "translate(0, -50%)" };
}

export default function Routes({
  build,
  steps,
  label,
}: {
  build: (w: number) => RGeo;
  steps: RStep[];
  label: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const width = useWidth(box);
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const g = build(width);
  const [i, setI] = useState(0);
  const [srcOn, setSrcOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [verdictOn, setVerdictOn] = useState(false);
  const [dstOn, setDstOn] = useState(false);
  const paths = useRef<Record<string, SVGPathElement | null>>({});
  const dot = useRef<SVGCircleElement>(null);
  const st = steps[i];

  useEffect(() => {
    const c = dot.current;
    const pin = paths.current[`hl-in-${st.from}`];
    const pout = st.to ? paths.current[`hl-out-${st.to}`] : null;
    if (!c || !pin) return;
    const all = Object.entries(paths.current)
      .filter(([k, p]) => k.startsWith("hl-") && p)
      .map(([, p]) => p as SVGPathElement);
    all.forEach((p) => {
      const L = p.getTotalLength();
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L, opacity: 1 });
    });
    if (!inView || matches(REDUCED)) {
      /* без движения — итог шага сразу */
      gsap.set(pin, { strokeDashoffset: 0 });
      if (pout) gsap.set(pout, { strokeDashoffset: 0 });
      const end = (pout ?? pin).getPointAtLength(pout ? pout.getTotalLength() : pin.getTotalLength());
      gsap.set(c, { attr: { cx: end.x, cy: end.y, r: 6 }, opacity: 1 });
      const id = requestAnimationFrame(() => {
        setSrcOn(true);
        setVerdictOn(true);
        setDstOn(!!pout);
      });
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
          c.setAttribute("cx", String(pt.x));
          c.setAttribute("cy", String(pt.y));
          p.style.strokeDashoffset = String(L * (1 - o.t));
        },
      });
    };

    const start = pin.getPointAtLength(0);
    const tl = gsap.timeline({ onComplete: () => setI((x) => (x + 1) % steps.length) });
    tl.call(() => {
      setSrcOn(true);
      setBusy(false);
      setVerdictOn(false);
      setDstOn(false);
      c.removeAttribute("data-tone");
    });
    tl.set(c, { attr: { cx: start.x, cy: start.y, r: 6 }, opacity: 1 });
    tl.add(run(pin, 1));
    tl.call(() => setBusy(true));
    tl.to({}, { duration: 0.55 });
    tl.call(() => {
      setBusy(false);
      setVerdictOn(true);
      c.setAttribute("data-tone", st.tone);
    });
    if (pout) {
      pout.setAttribute("data-tone", st.tone);
      tl.add(run(pout, 0.95), "+=0.25");
      tl.call(() => setDstOn(true));
    } else {
      /* запрос остановлен на шлюзе */
      tl.to(c, { attr: { r: 10 }, duration: 0.18, yoyo: true, repeat: 1 }, "+=0.1");
    }
    tl.to({}, { duration: 1.9 });
    tl.to([c, ...all], { opacity: 0, duration: 0.35 });
    tl.call(() => {
      setSrcOn(false);
      setVerdictOn(false);
      setDstOn(false);
    });
    return () => {
      tl.kill();
    };
  }, [i, inView, st, steps.length, width]);

  return (
    <div ref={ref}>
      <div ref={box} className={styles.stage}>
        <div className={styles.canvas} style={{ width: g.w, height: g.h }} aria-hidden="true">
          <svg className={styles.svg} width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`}>
            {g.zones?.map((z) => (
              <g key={z.label}>
                <rect className={z.kind === "in" ? styles.zoneIn : styles.zoneOut} x={z.x} y={z.y} width={z.w} height={z.h} rx={18} />
                <text className={styles.zoneLabel} x={z.x + 14} y={z.y + 24}>
                  {z.label}
                </text>
              </g>
            ))}
            {g.nodes.map((n) => (
              <path key={`b-${n.id}`} className={styles.base} d={n.side === "src" ? inPath(n, g) : outPath(n, g)} />
            ))}
            {g.nodes.map((n) => (
              <path
                key={`h-${n.id}`}
                ref={(el) => {
                  paths.current[`hl-${n.side === "src" ? "in" : "out"}-${n.id}`] = el;
                }}
                className={styles.hl}
                d={n.side === "src" ? inPath(n, g) : outPath(n, g)}
                style={{ opacity: 0 }}
              />
            ))}
            <Gate x={g.gate.x} y={g.gate.y} busy={busy} label="Кордон" />
            <circle ref={dot} className={styles.dot} cx={-20} cy={-20} r={0} />
          </svg>

          {g.nodes.map((n) => {
            const on = (n.side === "src" && n.id === st.from && srcOn) || (n.side === "dst" && n.id === st.to && dstOn);
            return (
              <div
                key={n.id}
                className={styles.node}
                data-on={on || undefined}
                data-tone={on && n.side === "dst" ? st.tone : undefined}
                data-kind={n.kind}
                style={nodeStyle(n, g.vertical)}
              >
                {n.note && <em>{n.note}</em>}
                <b>{n.title}</b>
                {n.sub && <small>{n.sub}</small>}
              </div>
            );
          })}

          <span
            className={styles.verdict}
            data-on={verdictOn || undefined}
            data-tone={st.tone}
            style={{ left: g.verdict.x, top: g.verdict.y }}
          >
            {st.verdict}
          </span>
        </div>
      </div>
      <p className={styles.caption} aria-live="polite">
        {st.caption}
      </p>
      <ul className="sr-only" aria-label={label}>
        {steps.map((s, k) => (
          <li key={k}>{s.caption}</li>
        ))}
      </ul>
    </div>
  );
}
