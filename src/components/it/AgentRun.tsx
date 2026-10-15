"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, matches, REDUCED } from "@/lib/motion";
import { useInView } from "@/components/ui/Reveal";
import { cx, vars } from "@/lib/css";
import styles from "./AgentRun.module.css";

/* An agent at work. On the left — the agent and the task it is running now.
   The gold frame is its role: inside are the systems it may use, below are
   the ones it may not. A task within the role gets 60 seconds of access (the
   ring drains); a task outside the role hits the frame — wherever the command
   came from. On the right — the audit log, which records every call. */

type Sys = { id: string; name: string; inside: boolean };
const SYSTEMS: Sys[] = [
  { id: "repo", name: "Repository", inside: true },
  { id: "tracker", name: "Issue tracker", inside: true },
  { id: "wiki", name: "Wiki", inside: true },
  { id: "ci", name: "CI/CD", inside: true },
  { id: "crm", name: "Customer CRM", inside: false },
  { id: "billing", name: "Billing", inside: false },
  { id: "hr", name: "HR system", inside: false },
  { id: "mail", name: "Email", inside: false },
];

const STEPS = [
  { from: "developer", task: "Review pull request 482", to: "repo", act: "read code" },
  { from: "developer", task: "Add review notes to the ticket", to: "tracker", act: "comment" },
  { from: "vendor email", task: "Export every customer from the CRM", to: "crm", act: "export customers" },
  { from: "developer", task: "Find the code review guidelines", to: "wiki", act: "search" },
  { from: "chat", task: "Forward the report to an outside address", to: "mail", act: "send email" },
];

type Entry = { id: number; at: string; text: string; ok: boolean };
const START = 41 * 60 + 2; // 12:41:02 PM

function stamp(n: number) {
  const s = START + n * 7;
  return `12:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")} PM`;
}

export default function AgentRun() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const stage = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const agent = useRef<HTMLDivElement>(null);
  const tiles = useRef<Record<string, HTMLDivElement | null>>({});
  const beam = useRef<SVGLineElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const burst = useRef<SVGCircleElement>(null);
  const [i, setI] = useState(0);
  const [hit, setHit] = useState(false);
  const [log, setLog] = useState<Entry[]>([]);
  const n = useRef(0);
  const st = STEPS[i];
  const target = SYSTEMS.find((s) => s.id === st.to)!;

  useEffect(() => {
    const root = stage.current;
    const a = agent.current;
    const t = tiles.current[st.to];
    const z = zone.current;
    const l = beam.current;
    const c = dot.current;
    const b = burst.current;
    if (!root || !a || !t || !z || !l || !c || !b) return;

    /* coordinates come from the layout at the moment of the shot — the scene works at any width */
    const geo = () => {
      const R = root.getBoundingClientRect();
      const A = a.getBoundingClientRect();
      const T = t.getBoundingClientRect();
      const Z = z.getBoundingClientRect();
      /* within the role the beam goes up to the system; outside it goes down and stops at the frame edge */
      return {
        x1: A.left + A.width / 2 - R.left,
        y1: (target.inside ? A.top : A.bottom) - R.top,
        ex: T.left + T.width / 2 - R.left,
        ey: (target.inside ? T.bottom : Z.bottom) - R.top,
      };
    };

    const entry = (): Entry => ({
      id: n.current++,
      at: stamp(n.current),
      text: `Reviewer → ${target.name}: ${st.act}`,
      ok: target.inside,
    });

    if (!inView || matches(REDUCED)) {
      const reduced = matches(REDUCED);
      const id = requestAnimationFrame(() => {
        const g = geo();
        gsap.set(l, { attr: { x1: g.x1, y1: g.y1, x2: g.ex, y2: g.ey }, opacity: reduced ? 1 : 0 });
        gsap.set(c, { attr: { cx: g.ex, cy: g.ey }, opacity: reduced ? 1 : 0 });
        setHit(reduced);
        /* reduced motion — one final step goes straight into the log */
        if (reduced) setLog((prev) => (prev.length ? prev : [entry()]));
      });
      return () => cancelAnimationFrame(id);
    }

    const o = { p: 0 };
    let g = geo();
    const tl = gsap.timeline({ onComplete: () => setI((x) => (x + 1) % STEPS.length) });
    tl.call(() => setHit(false));
    tl.set([l, c, b], { opacity: 0 });
    tl.to({}, { duration: 0.9 });
    tl.call(() => {
      g = geo();
      gsap.set(l, { attr: { x1: g.x1, y1: g.y1, x2: g.x1, y2: g.y1 }, opacity: 1 });
      gsap.set(c, { attr: { cx: g.x1, cy: g.y1 }, opacity: 1 });
      gsap.set(b, { attr: { cx: g.ex, cy: g.ey, r: 0 }, opacity: 0 });
    });
    tl.to(o, {
      p: 1,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        const x = g.x1 + (g.ex - g.x1) * o.p;
        const y = g.y1 + (g.ey - g.y1) * o.p;
        l.setAttribute("x2", String(x));
        l.setAttribute("y2", String(y));
        c.setAttribute("cx", String(x));
        c.setAttribute("cy", String(y));
      },
    });
    tl.call(() => {
      setHit(true);
      setLog((prev) => [entry(), ...prev].slice(0, 4));
    });
    if (!target.inside) {
      tl.set(b, { opacity: 0.9, attr: { r: 4 } });
      tl.to(b, { attr: { r: 30 }, opacity: 0, duration: 0.6, ease: "power2.out" });
    }
    tl.to({}, { duration: target.inside ? 2.6 : 2 });
    tl.to([l, c], { opacity: 0, duration: 0.3 });
    return () => {
      tl.kill();
    };
  }, [i, inView, st.to, st.act, target.inside, target.name]);

  return (
    <div ref={ref} className={styles.wrap}>
      <div ref={stage} className={styles.stage}>
        <div className={styles.left}>
          <div ref={zone} className={styles.zone}>
            <span className={styles.zoneLabel}>Reviewer role: code review</span>
            <div className={styles.grid}>
              {SYSTEMS.filter((s) => s.inside).map((s) => {
                const on = hit && s.id === st.to;
                return (
                  <div
                    key={s.id}
                    ref={(el) => {
                      tiles.current[s.id] = el;
                    }}
                    className={styles.tile}
                    data-on={on || undefined}
                  >
                    <b>{s.name}</b>
                    <span className={styles.pass}>
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <circle cx="10" cy="10" r="8" />
                        {on && <circle key={i} className={styles.left60} cx="10" cy="10" r="8" />}
                      </svg>
                      {on ? "60 s access" : "in role"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div ref={agent} className={styles.agent}>
              <span className={styles.who}>
                <small>AI agent</small>
                <b>Reviewer</b>
              </span>
              <div key={i} className={styles.task} data-risk={!target.inside || undefined}>
                <span>task · {st.from}</span>
                <q>{st.task}</q>
              </div>
            </div>
          </div>
          <div className={styles.outside}>
            <span className={styles.outLabel}>Outside the role</span>
            <div className={styles.grid}>
              {SYSTEMS.filter((s) => !s.inside).map((s) => {
                const on = hit && s.id === st.to;
                return (
                  <div
                    key={s.id}
                    ref={(el) => {
                      tiles.current[s.id] = el;
                    }}
                    className={cx(styles.tile, styles.locked)}
                    data-on={on || undefined}
                  >
                    <b>{s.name}</b>
                    <span className={styles.pass}>{on ? "blocked" : "no access"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className={styles.log} aria-live="polite">
          <p className={styles.logHead}>
            Audit log <span>everything goes to your SIEM</span>
          </p>
          <ol>
            {log.map((e, k) => (
              <li key={e.id} data-ok={e.ok || undefined} style={vars({ "--k": k })}>
                <time>{e.at}</time>
                <span>{e.text}</span>
                <b>{e.ok ? "allowed" : "blocked"}</b>
              </li>
            ))}
          </ol>
        </aside>

        <svg className={styles.svg} aria-hidden="true">
          <line ref={beam} className={styles.beam} data-tone={hit ? (target.inside ? "ok" : "stop") : undefined} x1={0} y1={0} x2={0} y2={0} opacity={0} />
          <circle ref={burst} className={styles.burst} cx={0} cy={0} r={0} opacity={0} />
          <circle ref={dot} className={styles.dot} data-tone={hit ? (target.inside ? "ok" : "stop") : undefined} cx={0} cy={0} r={6} opacity={0} />
        </svg>
      </div>
      <ul className="sr-only" aria-label="What the agent can and cannot do">
        {STEPS.map((s) => {
          const sys = SYSTEMS.find((x) => x.id === s.to)!;
          return (
            <li key={s.task}>
              Task from {s.from}: “{s.task}” — {sys.inside ? "within the role, 60 seconds of access" : "outside the role, blocked and recorded in the audit log"}.
            </li>
          );
        })}
      </ul>
    </div>
  );
}
