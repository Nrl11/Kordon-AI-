"use client";

import { useEffect, useRef } from "react";
import { gsap, matches, REDUCED } from "@/lib/motion";
import { useInView } from "@/components/ui/Reveal";
import { useWidth } from "@/lib/useWidth";
import { num } from "@/lib/format";
import { vars } from "@/lib/css";
import styles from "./Merge.module.css";

/* Шапка страницы для финансов. Сначала — как сейчас: подписки на личных
   картах, счета в долларах, договоры с провайдерами, авансовые отчёты —
   вразнобой. Затем всё стягивается в Кордон, и из него собирается один
   отчёт: расходы на ИИ по командам, в рублях. Сцена нарисована
   в постоянных пикселях и масштабируется под ширину. */

const BILLS = [
  { t: "ChatGPT Plus", s: "карта Ивановой", v: "$20" },
  { t: "Claude Team", s: "карта Петрова", v: "$150" },
  { t: "OpenAI API", s: "счёт в долларах", v: "$1 940" },
  { t: "Anthropic", s: "через посредника", v: "142 700 ₽" },
  { t: "GigaChat", s: "договор со Сбером", v: "64 300 ₽" },
  { t: "Авансовый отчёт", s: "Perplexity, Соколов", v: "1 900 ₽" },
  { t: "YandexGPT", s: "Yandex Cloud", v: "27 900 ₽" },
  { t: "Cursor", s: "карта разработчика", v: "$40" },
];
/* где лежат счета «вразнобой»: широкая сцена и узкая */
const SPOTS = {
  wide: [
    [18, 28],
    [214, 16],
    [356, 92],
    [30, 136],
    [196, 176],
    [348, 262],
    [44, 262],
    [190, 352],
  ],
  narrow: [
    [14, 30],
    [150, 96],
    [18, 166],
    [140, 236],
    [12, 306],
    [148, 376],
    [20, 430],
    [150, 20],
  ],
};

const TEAMS = [
  { t: "Разработка", v: 214_600 },
  { t: "Продажи", v: 118_300 },
  { t: "Поддержка", v: 79_800 },
  { t: "Юристы", v: 52_400 },
  { t: "Маркетинг", v: 47_400 },
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
    const labels = el.querySelectorAll<HTMLElement>("[data-label]");
    if (!report || !gate) return;

    const final = () => {
      gsap.set(bills, { opacity: 0 });
      gsap.set(gate, { opacity: 0 });
      gsap.set(report, { opacity: 1, scale: 1, y: 0 });
      gsap.set(rows, { opacity: 1, y: 0 });
      gsap.set(el.querySelectorAll("[data-bar]"), { scaleX: 1 });
      gsap.set(labels[0], { opacity: 0 });
      gsap.set(labels[1], { opacity: 1 });
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
    tl.set(labels[0], { opacity: 1 });
    tl.set(labels[1], { opacity: 0 });
    /* счета появляются вразнобой */
    tl.to(bills, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: { each: 0.12, from: "random" } });
    tl.to({}, { duration: 1.4 });
    /* Кордон стягивает их к себе */
    tl.to(gate, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" });
    tl.addLabel("merge");
    bills.forEach((b, k) => {
      const bx = Number(b.dataset.x) + b.offsetWidth / 2;
      const by = Number(b.dataset.y) + b.offsetHeight / 2;
      tl.to(b, { x: cx - bx, y: cy - by, scale: 0.25, opacity: 0, duration: 0.6, ease: "power2.in" }, `merge+=${k * 0.07}`);
    });
    tl.to(labels[0], { opacity: 0, duration: 0.3 }, "merge");
    tl.to(gate, { scale: 1.25, opacity: 0, duration: 0.4, ease: "power2.in" }, ">-0.1");
    /* и собирается один отчёт */
    tl.to(report, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "power3.out" }, ">-0.15");
    tl.to(labels[1], { opacity: 1, duration: 0.3 }, "<");
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
          <span className={styles.label} data-label="">
            Сейчас: счета вразнобой
          </span>
          <span className={styles.label} data-label="" style={{ opacity: 0 }}>
            С Кордоном: один отчёт
          </span>

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
              <b>Расходы на ИИ · октябрь</b>
              <span>все модели и подписки, в рублях</span>
            </header>
            <ul>
              {TEAMS.map((t, k) => (
                <li key={t.t} data-row="">
                  <span>{t.t}</span>
                  <i>
                    <s data-bar="" style={vars({ "--w": t.v / TEAMS[0].v, "--k": k })} />
                  </i>
                  <b>{num(t.v)} ₽</b>
                </li>
              ))}
            </ul>
            <footer data-row="">
              <span>Итого</span>
              <b>{num(TOTAL)} ₽</b>
            </footer>
            <p data-row="">По каждому запросу: кто отправил, какая модель, сколько токенов.</p>
          </div>
        </div>
      </div>
      <p className="sr-only">
        Было: подписки на личных картах, счета в долларах, договоры с провайдерами и авансовые отчёты. Стало: один отчёт
        по командам — {TEAMS.map((t) => `${t.t} ${num(t.v)} ₽`).join(", ")}; итого {num(TOTAL)} ₽.
      </p>
    </div>
  );
}
