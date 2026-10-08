"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, matches, REDUCED } from "@/lib/motion";
import { useInView } from "@/components/ui/Reveal";
import { useWidth } from "@/lib/useWidth";
import { num } from "@/lib/format";
import { cx, vars } from "@/lib/css";
import styles from "./SpendFlow.module.css";

/* Куда уходят деньги — пример месяца по API. Слева — какие задачи
   сотрудники отдают ИИ, толщина ленты — сколько токенов. Кордон
   отправляет каждую задачу в подходящую модель и считает её стоимость:
   токены × цена модели. Справа у каждой модели — рубли. Видно главное:
   толстый поток простых задач стоит немного, тонкий поток сложных —
   большую часть счёта. Точка показывает, как посчитан один запрос.
   На ленту можно навести (или встать на подпись с клавиатуры): она
   подсвечивается, остальные приглушаются, рядом — цифры этой ленты. */

const TASKS = [
  { id: "simple", title: "Простые задачи", sub: "58 % объёма", t: 520, bill: 13, hint: "переводы, письма, пересказы" },
  { id: "normal", title: "Обычные задачи", sub: "33 % объёма", t: 300, bill: 48, hint: "ответы по базе знаний, отчёты" },
  { id: "hard", title: "Сложные задачи", sub: "9 % объёма", t: 80, bill: 39, hint: "код, финмодели, анализ" },
];
const MODELS = [
  { id: "lite", title: "YandexGPT Lite", sub: "быстрая и дешёвая", t: 330, rub: 27_900 },
  { id: "local", title: "Qwen в контуре", sub: "своё железо", t: 140, rub: 0 },
  { id: "giga", title: "GigaChat Max", sub: "русский язык", t: 230, rub: 64_300 },
  { id: "claude", title: "Claude Sonnet 5.5", sub: "код и сложный анализ", t: 200, rub: 329_100 },
];
const TOTAL = MODELS.reduce((s, m) => s + m.rub, 0); // 421 300 ₽
const MAX = Math.max(...MODELS.map((m) => m.rub));
const pct = (rub: number) => Math.round((rub / TOTAL) * 100);

/* как посчитан один запрос */
const EXAMPLES = [
  { task: "simple", model: "lite", who: "А. Ершова, юристы", what: "«перескажи договор» · 2 300 токенов", rub: "0,19 ₽" },
  { task: "hard", model: "claude", who: "CI-пайплайн, разработка", what: "ревью кода · 8 400 токенов", rub: "6,20 ₽" },
  { task: "normal", model: "local", who: "Бот поддержки", what: "ответ по базе знаний · 1 900 токенов", rub: "0 ₽" },
  { task: "normal", model: "giga", who: "О. Смирнова, закупки", what: "письмо поставщику · 3 100 токенов", rub: "0,86 ₽" },
];

type Hot = { side: "in" | "out"; id: string } | null;

/* подписи не должны налезать друг на друга: раздвигаем центры на min */
function spread(ys: number[], min: number, top: number, bottom: number) {
  const out = [...ys];
  for (let k = 1; k < out.length; k++) out[k] = Math.max(out[k], out[k - 1] + min);
  if (out[out.length - 1] > bottom) out[out.length - 1] = bottom;
  for (let k = out.length - 2; k >= 0; k--) out[k] = Math.min(out[k], out[k + 1] - min);
  if (out[0] < top) return spread(ys.map((y) => y + (top - out[0])), min, top, bottom + 1000);
  return out;
}

function geometry(w: number) {
  const h = 410;
  const L = 250; // правый край подписей задач
  const R = w - 320; // полоса моделей, справа подписи
  const G = Math.round(L + (R - L) * 0.5);
  const top = 62;
  const usable = 300;
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
  /* у каждой ленты — середина: туда встаёт подсказка при наведении */
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
  const ly = spread(left.map((n) => n.y + n.h / 2), 52, 70, top + usable);
  const ry = spread(right.map((n) => n.y + n.h / 2), 52, 70, top + usable + 20);
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
  const dot = useRef<SVGCircleElement>(null);
  const paths = useRef<Record<string, SVGPathElement | null>>({});
  /* лента под курсором или в фокусе: пока на неё смотрят, пример замирает */
  const [hot, setHot] = useState<Hot>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isHot = (side: "in" | "out", id: string) => hot?.side === side && hot.id === id;
  const point = (side: "in" | "out", id: string) => ({
    onMouseEnter: () => setHot({ side, id }),
    onMouseLeave: () => setHot(null),
  });

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (hot) tl.pause();
    else tl.resume();
  }, [hot]);

  useEffect(() => {
    const c = dot.current;
    const a = paths.current[`in-${ex.task}`];
    const b = paths.current[`out-${ex.model}`];
    if (!wide || !c || !a || !b) return;
    if (!inView || matches(REDUCED)) {
      const end = b.getPointAtLength(b.getTotalLength());
      gsap.set(c, { attr: { cx: end.x, cy: end.y }, opacity: 1 });
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
          c.setAttribute("cx", String(pt.x));
          c.setAttribute("cy", String(pt.y));
        },
      });
    };
    const s = a.getPointAtLength(0);
    const gb = b.getPointAtLength(0);
    const tl = gsap.timeline({ onComplete: () => setN((x) => (x + 1) % EXAMPLES.length) });
    tlRef.current = tl;
    tl.call(() => setAt("task"));
    tl.set(c, { attr: { cx: s.x, cy: s.y }, opacity: 0 });
    tl.to(c, { opacity: 1, duration: 0.25 });
    tl.add(run(a, 1.1));
    tl.call(() => setAt("gate"));
    /* в Кордоне задача получает модель и цену */
    tl.to(c, { attr: { cx: gb.x, cy: gb.y }, duration: 0.6, ease: "power2.inOut" }, "+=0.35");
    tl.add(run(b, 1.1), "+=0.4");
    tl.call(() => setAt("model"));
    tl.to({}, { duration: 1.8 });
    tl.to(c, { opacity: 0, duration: 0.3 });
    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [n, inView, wide, ex.task, ex.model, width]);

  /* подсказка к ленте под курсором */
  const tip = (() => {
    if (!hot || !wide) return null;
    if (hot.side === "in") {
      const r = g.ins.find((x) => x.id === hot.id);
      const t = TASKS.find((x) => x.id === hot.id);
      if (!r || !t) return null;
      return { x: r.mx, y: r.my, title: t.title, note: t.hint, value: `${t.sub} · ${t.bill} % счёта` };
    }
    const r = g.outs.find((x) => x.id === hot.id);
    const m = MODELS.find((x) => x.id === hot.id);
    if (!r || !m) return null;
    return {
      x: r.mx,
      y: r.my,
      title: m.title,
      note: `${m.t} млн токенов за месяц`,
      value: `${num(m.rub)} ₽ · ${pct(m.rub)} % счёта`,
    };
  })();

  return (
    <div ref={ref} className={cx(styles.flow, inView && styles.in)}>
      <div ref={box} className={styles.box}>
        {wide ? (
          <div className={styles.canvas} style={{ height: g.h }} data-hover={hot ? "" : undefined}>
            <svg className={styles.svg} width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden="true">
              <text className={styles.zone} x={g.L} y={26} textAnchor="end">
                Задачи
              </text>
              <text className={styles.zone} x={g.R} y={26}>
                Модели и счёт за месяц
              </text>

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
              <circle ref={dot} className={styles.dot} cx={-20} cy={-20} r={6} />
            </svg>

            {g.left.map((s, k) => (
              <div
                key={s.id}
                className={styles.label}
                data-on={(!hot && s.id === ex.task && at !== "model") || undefined}
                data-hot={isHot("in", s.id) || undefined}
                style={{ left: 0, width: g.L - 14, top: g.ly[k] }}
                tabIndex={0}
                aria-label={`${s.title}: ${s.sub}, ${s.bill} % счёта`}
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
                aria-label={`${m.title}: ${m.t} млн токенов, ${num(m.rub)} ₽, ${pct(m.rub)} % счёта`}
                {...point("out", m.id)}
                onFocus={() => setHot({ side: "out", id: m.id })}
                onBlur={() => setHot(null)}
              >
                <b>{m.title}</b>
                <span className={styles.cost}>
                  <i style={vars({ "--w": m.rub / MAX, "--i": k })} />
                  <em>{num(m.rub)} ₽</em>
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
                  {m.sub} · {m.t} млн токенов
                </span>
                <span className={styles.cost}>
                  <i style={vars({ "--w": m.rub / MAX, "--i": i })} />
                  <em>{num(m.rub)} ₽</em>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dl className={styles.facts}>
        <div>
          <dt>Простые задачи</dt>
          <dd>58 % объёма — 13 % счёта</dd>
        </div>
        <div>
          <dt>Сложные задачи</dt>
          <dd>9 % объёма — 39 % счёта</dd>
        </div>
        <div>
          <dt>Локальная модель</dt>
          <dd>Закрытые задачи — 0 ₽ за токены</dd>
        </div>
      </dl>
      <p className="sr-only">Итого за месяц по API: {num(TOTAL)} ₽.</p>
    </div>
  );
}
