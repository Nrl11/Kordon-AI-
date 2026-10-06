"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/components/ui/Reveal";
import { matches, REDUCED } from "@/lib/motion";
import { rubShort } from "@/lib/format";
import { cx, vars } from "@/lib/css";
import styles from "./Limits.module.css";

/* Месяц в ускоренной перемотке: команды тратят бюджет с разной скоростью.
   На 80 % руководитель получает уведомление, на 100 % новые запросы
   получают отказ — перерасхода не бывает. */

const TEAMS = [
  { name: "Разработка", budget: 600_000, pace: 0.86 },
  { name: "Поддержка", budget: 300_000, pace: 0.7 },
  { name: "Маркетинг", budget: 150_000, pace: 0.94 },
  { name: "Подрядчик «Дельта»", budget: 50_000, pace: 1.32 },
];
const DAYS = 30;
const RUN = 7000;
const HOLD = 2600;

export default function Limits() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [day, setDay] = useState(DAYS);

  useEffect(() => {
    if (!inView) return;
    if (matches(REDUCED)) {
      const id = requestAnimationFrame(() => setDay(DAYS));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = performance.now();
    const tick = (now: number) => {
      let t = now - start;
      if (t > RUN + HOLD) {
        start = now;
        t = 0;
      }
      setDay(Math.min(DAYS, 1 + (t / RUN) * (DAYS - 1)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const d = Math.floor(day);

  return (
    <div ref={ref} className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>Бюджеты на ИИ · октябрь</span>
        <span className={styles.day}>
          день <b>{d}</b> из {DAYS}
        </span>
      </div>
      <div className={styles.month} aria-hidden="true">
        <i style={vars({ "--p": day / DAYS })} />
      </div>

      <ul className={styles.teams}>
        {TEAMS.map((t) => {
          const used = Math.min(1, (t.pace * day) / DAYS);
          const state = used >= 1 ? "stop" : used >= 0.8 ? "warn" : "ok";
          return (
            <li key={t.name} data-state={state}>
              <div className={styles.row}>
                <b>{t.name}</b>
                <span className={styles.sum}>
                  {rubShort(t.budget * used)} из {rubShort(t.budget)}
                </span>
              </div>
              <div className={styles.bar}>
                <i style={vars({ "--u": used })} />
                <span className={styles.mark} aria-hidden="true" />
              </div>
              <p className={cx(styles.note, state !== "ok" && styles.show)}>
                {state === "stop"
                  ? "Лимит исчерпан: новые запросы — отказ 429"
                  : state === "warn"
                    ? "80 % бюджета: руководителю ушло уведомление"
                    : " "}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
