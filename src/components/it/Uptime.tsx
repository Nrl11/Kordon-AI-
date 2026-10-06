"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/components/ui/Reveal";
import { matches, REDUCED } from "@/lib/motion";
import { cx, vars } from "@/lib/css";
import styles from "./Uptime.module.css";

/* Монитор ответов провайдеров за последний час. Линии рисуются слева
   направо, как идёт время. Один провайдер перестаёт отвечать — его линия
   уходит в красный пунктир «нет ответа», резервный провайдер берёт его
   запросы, а нижняя золотая линия — ваши приложения через Кордон — идёт
   без разрыва. */

const PROVIDERS = [
  { id: "openai", name: "OpenAI", model: "GPT-6 Astra", alias: "OpenAI" },
  { id: "anthropic", name: "Anthropic", model: "Claude Sonnet 5.5", alias: "Claude" },
  { id: "sber", name: "Сбер", model: "GigaChat Max", alias: "GigaChat" },
  { id: "local", name: "Локальная", model: "Qwen в контуре", alias: "Qwen" },
] as const;
type Pid = (typeof PROVIDERS)[number]["id"];

const CASES: { fail: Pid; backup: Pid; x1: number; x2: number; mins: string; before: string; after: string }[] = [
  {
    fail: "anthropic",
    backup: "openai",
    x1: 0.36,
    x2: 0.64,
    mins: "нет ответа 17 мин",
    before: "Все провайдеры отвечают — запросы идут по правилам маршрута.",
    after: "Anthropic не отвечает — Кордон отправляет эти запросы в OpenAI. Приложения работают дальше.",
  },
  {
    fail: "openai",
    backup: "sber",
    x1: 0.3,
    x2: 0.52,
    mins: "нет ответа 13 мин",
    before: "Все провайдеры отвечают — запросы идут по правилам маршрута.",
    after: "OpenAI не отвечает — запросы уходят в GigaChat, пока OpenAI не вернётся.",
  },
];

const RUN = 7200;
const HOLD = 2800;
const N = 96;

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* линия задержки: ниже — быстрее; в окне сбоя у упавшего — разрыв, у резервного — нагрузка выше */
function trace(seed: number, base: number, amp: number, from = 0, to = 1, lift?: { x1: number; x2: number; by: number }) {
  const r = rng(seed);
  const pts: string[] = [];
  for (let k = 0; k <= N; k++) {
    const x = k / N;
    const noise = (r() - 0.5) * amp + Math.sin(k * 0.7 + seed) * amp * 0.25;
    if (x < from - 1e-6 || x > to + 1e-6) continue;
    const up = lift && x >= lift.x1 && x <= lift.x2 ? lift.by : 0;
    pts.push(`${(x * 1000).toFixed(1)},${(base + noise - up).toFixed(1)}`);
  }
  return pts.length ? `M${pts.join(" L")}` : "";
}

function lanes(c: (typeof CASES)[number]) {
  return PROVIDERS.map((p, k) => {
    const seed = 11 + k * 7;
    if (p.id === c.fail) {
      return {
        ...p,
        parts: [trace(seed, 28, 7, 0, c.x1), trace(seed, 28, 7, c.x2, 1)],
        gap: `M${c.x1 * 1000},6 L${c.x2 * 1000},6`,
      };
    }
    const lift = p.id === c.backup ? { x1: c.x1, x2: c.x2, by: 9 } : undefined;
    return { ...p, parts: [trace(seed, 28, 7, 0, 1, lift)], gap: "" };
  });
}

export default function Uptime() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const stage = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  const [failed, setFailed] = useState(false);
  const c = CASES[n];
  const rows = lanes(c);
  const app = trace(5, 26, 4, 0, 1, { x1: c.x1, x2: c.x1 + 0.025, by: 8 });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (!inView || matches(REDUCED)) {
      el.style.setProperty("--p", "1");
      const id = requestAnimationFrame(() => setFailed(true));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const t0 = performance.now();
    let hit = false;
    el.style.setProperty("--p", "0");
    const id0 = requestAnimationFrame(() => setFailed(false));
    const tick = (now: number) => {
      const t = now - t0;
      const p = Math.min(1, t / RUN);
      el.style.setProperty("--p", p.toFixed(4));
      if (!hit && p >= c.x1) {
        hit = true;
        setFailed(true);
      }
      if (t >= RUN + HOLD) {
        setN((x) => (x + 1) % CASES.length);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(id0);
    };
  }, [inView, n, c.x1]);

  const backupName = PROVIDERS.find((p) => p.id === c.backup)?.alias;

  return (
    <figure ref={ref} className={styles.wrap}>
      <div ref={stage} className={styles.stage} aria-hidden="true">
        <div className={styles.head}>
          <span>Ответы моделей</span>
          <span>последний час</span>
        </div>
        <div className={styles.lanes}>
          {rows.map((l) => {
            const down = failed && l.id === c.fail;
            const up = failed && l.id === c.backup;
            return (
              <div key={`${n}-${l.id}`} className={styles.lane} data-down={down || undefined} data-up={up || undefined}>
                <div className={styles.label}>
                  <b>{l.name}</b>
                  <small>{down ? "нет ответа" : up ? "резерв" : l.model}</small>
                </div>
                <div className={styles.track}>
                  <svg viewBox="0 0 1000 40" preserveAspectRatio="none">
                    {l.parts.map((d, k) => d && <path key={k} className={styles.line} d={d} />)}
                    {l.gap && <path className={styles.gap} d={l.gap} />}
                  </svg>
                  {l.gap && (
                    <span className={styles.flag} style={vars({ "--x": c.x1 })} data-on={down || undefined}>
                      {c.mins}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div className={cx(styles.lane, styles.app)}>
            <div className={styles.label}>
              <b>Ваши приложения</b>
              <small>один адрес — Кордон</small>
            </div>
            <div className={styles.track}>
              <svg viewBox="0 0 1000 40" preserveAspectRatio="none">
                <path className={styles.line} d={app} />
              </svg>
              <span className={styles.switch} style={vars({ "--x": c.x1 })} data-on={failed || undefined}>
                резерв: {backupName}
              </span>
            </div>
          </div>
          <div className={styles.overlay}>
            <i className={styles.cursor} />
          </div>
        </div>
      </div>
      <figcaption className={styles.caption} aria-live="polite">
        {failed ? c.after : c.before}
      </figcaption>
    </figure>
  );
}
