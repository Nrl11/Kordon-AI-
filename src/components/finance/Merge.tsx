"use client";

import { useEffect, useRef } from "react";
import { gsap, matches, REDUCED } from "@/lib/motion";
import { useInView } from "@/components/ui/Reveal";
import { useWidth } from "@/lib/useWidth";
import { usd } from "@/lib/format";
import { vars } from "@/lib/css";
import styles from "./Merge.module.css";

/* Finance page header. First, how things are today: subscriptions on
   personal cards, API invoices, reseller contracts, expense reports — all
   scattered. Then everything is pulled into Kordon, and one report comes
   out of it: AI spend by team. The bills add up to the report total. The
   scene is drawn in fixed pixels and scaled to the width. */

const BILLS = [
  { t: "ChatGPT Plus", s: "J. Miller's card", v: "$20" },
  { t: "Claude Team", s: "D. Chen's card", v: "$150" },
  { t: "OpenAI API", s: "monthly invoice", v: "$1,940" },
  { t: "Anthropic", s: "via a reseller", v: "$1,780" },
  { t: "Gemini", s: "via Google Cloud", v: "$800" },
  { t: "Expense report", s: "Perplexity, R. Lopez", v: "$20" },
  { t: "M365 Copilot", s: "55 seats", v: "$1,650" },
  { t: "Cursor", s: "developer's card", v: "$40" },
];
/* Where the scattered bills sit. A card is 196×52 (240×52 on the narrow scene).
   Wide scene 560×440: four rows of two offset cards, at least 26 px between
   neighbors, the center (where Kordon appears) stays clear.
   Narrow 320×520: one staggered column, 57 px step. Nothing overlaps. */
const SPOTS = {
  wide: [
    [24, 22],
    [300, 30],
    [128, 112],
    [344, 124],
    [18, 206],
    [346, 218],
    [96, 304],
    [322, 296],
  ],
  narrow: [
    [10, 12],
    [64, 69],
    [26, 126],
    [72, 183],
    [6, 240],
    [50, 297],
    [20, 354],
    [68, 411],
  ],
};

const TEAMS = [
  { t: "Engineering", v: 2_680 },
  { t: "Sales", v: 1_480 },
  { t: "Support", v: 995 },
  { t: "Legal", v: 655 },
  { t: "Marketing", v: 590 },
];
const TOTAL = TEAMS.reduce((s, x) => s + x.v, 0);

export default function Merge() {
  const box = useRef<HTMLDivElement>(null);
  const width = useWidth(box, 600);
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const scene = useRef<HTMLDivElement>(null);
  const narrow = width < 480;
  const DW = narrow ? 320 : 560;
  const DH = narrow ? 520 : 440;
  const scale = Math.min(width / DW, 1.2);
  const spots = narrow ? SPOTS.narrow : SPOTS.wide;

  useEffect(() => {
    const el = scene.current;
    if (!el) return;
    const bills = el.querySelectorAll<HTMLElement>("[data-bill]");
    const report = el.querySelector<HTMLElement>("[data-report]");
    const rows = el.querySelectorAll<HTMLElement>("[data-row]");
    const gate = el.querySelector<HTMLElement>("[data-gate]");
    if (!report || !gate) return;

    const final = () => {
      gsap.set(bills, { opacity: 0 });
      gsap.set(gate, { opacity: 0 });
      gsap.set(report, { opacity: 1, scale: 1, y: 0 });
      gsap.set(rows, { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll("[data-bar]"), { scaleX: 1 });
    };
    if (!inView || matches(REDUCED)) {
      final();
      return;
    }

    const cx = DW / 2;
    const cy = DH / 2;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    tl.set(report, { opacity: 0, scale: 0.92, y: 10 });
    tl.set(rows, { opacity: 0, y: 6 });
    tl.set(el.querySelectorAll("[data-bar]"), { scaleX: 0 });
    tl.set(gate, { opacity: 0, scale: 0.6 });
    tl.set(bills, { opacity: 0, x: 0, y: 8, scale: 1 });
    /* the bills pop up in random order */
    tl.to(bills, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: { each: 0.12, from: "random" } });
    tl.to({}, { duration: 1.4 });
    /* Kordon pulls them in */
    tl.to(gate, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" });
    tl.addLabel("merge");
    bills.forEach((b, k) => {
      const bx = Number(b.dataset.x) + b.offsetWidth / 2;
      const by = Number(b.dataset.y) + b.offsetHeight / 2;
      tl.to(b, { x: cx - bx, y: cy - by, scale: 0.25, opacity: 0, duration: 0.6, ease: "power2.in" }, `merge+=${k * 0.07}`);
    });
    tl.to(gate, { scale: 1.25, opacity: 0, duration: 0.4, ease: "power2.in" }, ">-0.1");
    /* and one report takes shape */
    tl.to(report, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "power3.out" }, ">-0.15");
    tl.to(rows, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 }, "<+0.15");
    tl.to(el.querySelectorAll("[data-bar]"), { scaleX: 1, duration: 0.7, ease: "power2.out", stagger: 0.08 }, "<+0.1");
    tl.to({}, { duration: 4.2 });
    tl.to(report, { opacity: 0, y: -8, duration: 0.4 });
    return () => {
      tl.kill();
    };
  }, [inView, DW, DH, narrow]);

  return (
    <div ref={ref} className={styles.wrap}>
      <div ref={box} className={styles.box} style={{ height: DH * scale }}>
        <div
          ref={scene}
          className={styles.scene}
          data-narrow={narrow || undefined}
          style={{ width: DW, height: DH, transform: `translateX(-50%) scale(${scale})` }}
          aria-hidden="true"
        >
          {BILLS.map((b, k) => (
            <div
              key={b.t}
              className={styles.bill}
              data-bill=""
              data-x={spots[k][0]}
              data-y={spots[k][1]}
              style={{ left: spots[k][0], top: spots[k][1] }}
            >
              <span>
                <b>{b.t}</b>
                <small>{b.s}</small>
              </span>
              <em>{b.v}</em>
            </div>
          ))}

          <div className={styles.gate} data-gate="" style={{ left: DW / 2 - 36, top: DH / 2 - 36 }}>
            <svg viewBox="0 0 64 64" width="56" height="56">
              <path d="M58 24V18a12 12 0 0 0-12-12H18A12 12 0 0 0 6 18v28a12 12 0 0 0 12 12h28a12 12 0 0 0 12-12v-6" />
              <path className={styles.core} d="M32 32H59" />
              <circle cx="32" cy="32" r="9" />
            </svg>
          </div>

          <div className={styles.report} data-report="">
            <header>
              <b>AI spend · October</b>
              <span>all models and subscriptions, by team</span>
            </header>
            <ul>
              {TEAMS.map((t, k) => (
                <li key={t.t} data-row="">
                  <span>{t.t}</span>
                  <i>
                    <s data-bar="" style={vars({ "--w": t.v / TEAMS[0].v, "--k": k })} />
                  </i>
                  <b>{usd(t.v)}</b>
                </li>
              ))}
            </ul>
            <footer data-row="">
              <span>Total</span>
              <b>{usd(TOTAL)}</b>
            </footer>
            <p data-row="">For every request: who sent it, which model, how many tokens.</p>
          </div>
        </div>
      </div>
      <p className="sr-only">
        Before: subscriptions on personal cards, API invoices, reseller contracts and expense reports. After: one report
        by team — {TEAMS.map((t) => `${t.t} ${usd(t.v)}`).join(", ")}; total {usd(TOTAL)}.
      </p>
    </div>
  );
}
