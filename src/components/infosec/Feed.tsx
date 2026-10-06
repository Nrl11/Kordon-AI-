"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/components/ui/Reveal";
import { matches, REDUCED } from "@/lib/motion";
import { num } from "@/lib/format";
import { cx } from "@/lib/css";
import styles from "./Feed.module.css";

/* Что служба ИБ видит в журнале прямо сейчас: обращения идут потоком,
   у каждого — класс данных и решение шлюза. Счётчик «открытыми» стоит
   на нуле, сколько бы ни шло запросов. */

type Tag = "mask" | "local" | "stop" | "open";
const EVENTS: { who: string; what: string; tag: Tag; label: string }[] = [
  { who: "Юристы", what: "претензия с ФИО и паспортом", tag: "mask", label: "маскирование" },
  { who: "Финансы", what: "финмодель 2027", tag: "local", label: "локальная модель" },
  { who: "Маркетинг", what: "перевод пресс-релиза", tag: "open", label: "открытое" },
  { who: "Поддержка", what: "жалоба: телефон клиента", tag: "mask", label: "маскирование" },
  { who: "Аналитик", what: "письмо со скрытой командой", tag: "stop", label: "остановлено" },
  { who: "Разработка", what: "лог с ключом API", tag: "mask", label: "маскирование" },
  { who: "HR", what: "анкета кандидата", tag: "mask", label: "маскирование" },
  { who: "Юристы", what: "устав, редакция 4", tag: "local", label: "локальная модель" },
];
const VISIBLE = 6;
const EVERY = 1700;

const clock = (n: number) => {
  const s = 10 * 3600 + 42 * 60 + n * 3;
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, "0")).join(":");
};

export default function Feed() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [n, setN] = useState(VISIBLE);

  useEffect(() => {
    if (!inView || matches(REDUCED)) return;
    const t = window.setInterval(() => setN((x) => x + 1), EVERY);
    return () => window.clearInterval(t);
  }, [inView]);

  const rows = Array.from({ length: VISIBLE + 1 }, (_, k) => n - k).filter((x) => x >= 0);
  const extra = n - VISIBLE;
  const masked = 1860 + Array.from({ length: Math.max(0, extra) }, (_, k) => EVENTS[(VISIBLE + k) % EVENTS.length]).filter((e) => e.tag === "mask").length;
  const local = 280 + Array.from({ length: Math.max(0, extra) }, (_, k) => EVENTS[(VISIBLE + k) % EVENTS.length]).filter((e) => e.tag === "local").length;

  return (
    <div ref={ref} className={styles.card}>
      <div className={styles.counters}>
        <p>
          <b>{num(2140 + Math.max(0, extra))}</b>обращений сегодня
        </p>
        <p data-t="mask">
          <b>{num(masked)}</b>замаскированы
        </p>
        <p data-t="local">
          <b>{num(local)}</b>остались внутри
        </p>
        <p data-t="zero">
          <b>0</b>ушли с данными открыто
        </p>
      </div>
      <div className={styles.feed} aria-live="off">
        <div key={n} className={styles.list}>
          {rows.map((x, k) => {
            const e = EVENTS[x % EVENTS.length];
            return (
              <div key={x} className={cx(styles.row, k === 0 && styles.fresh, k >= VISIBLE && styles.gone)}>
                <span className={styles.time}>{clock(x)}</span>
                <span className={styles.who}>{e.who}</span>
                <span className={styles.what}>{e.what}</span>
                <span className={styles.tag} data-t={e.tag}>
                  {e.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className={styles.foot}>Тот же поток уходит в ваш SIEM</p>
    </div>
  );
}
