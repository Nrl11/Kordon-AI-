"use client";

import { useEffect, useState } from "react";
import { useSeen } from "@/components/ui/Reveal";
import { matches, REDUCED } from "@/lib/motion";
import { cx, vars } from "@/lib/css";
import styles from "./Investigation.module.css";

/* Расследование по журналу: одна фамилия в поиске — и вся история
   сотрудника по дням. Запрос печатается, когда блок появляется. */

type Tag = "mask" | "local" | "stop" | "info";
const QUERY = "К. Белов";
const ROWS: { at: string; what: string; tag: Tag; label: string }[] = [
  { at: "12.09 · 14:02", what: "«Выгрузи клиентов за квартал с контактами»", tag: "mask", label: "214 ФИО замаскированы" },
  { at: "14.09 · 18:47", what: "«Таблица зарплат отдела»", tag: "local", label: "закрытое — ответила локальная" },
  { at: "15.09 · 09:00", what: "Уволен в каталоге", tag: "info", label: "3 ключа отозваны" },
  { at: "15.09 · 10:41", what: "Вход по ключу vk-…a1b9", tag: "stop", label: "доступ закрыт" },
];

export default function Investigation() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.35);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (matches(REDUCED)) {
      const id = requestAnimationFrame(() => setN(QUERY.length));
      return () => cancelAnimationFrame(id);
    }
    /* печатаем по букве; когда запрос набран, таймер останавливается */
    let k = 0;
    const t = window.setInterval(() => {
      k += 1;
      setN(k);
      if (k >= QUERY.length) window.clearInterval(t);
    }, 80);
    return () => window.clearInterval(t);
  }, [seen]);

  const typed = n >= QUERY.length;

  return (
    <div ref={ref} className={cx("scene", styles.stage, typed && styles.typed)}>
      <div className={styles.main}>
      <div className={styles.search}>
        <span className={styles.icon} aria-hidden="true" />
        <span className={styles.input}>
          {QUERY.slice(0, n)}
          {!typed && <i className={styles.caret} aria-hidden="true" />}
        </span>
        <span className={styles.hint}>4 события · 4 дня</span>
      </div>
      <ol className={styles.rows}>
        {ROWS.map((r, k) => (
          <li key={r.at} style={vars({ "--k": k })}>
            <span className={styles.at}>{r.at}</span>
            <span className={styles.what}>{r.what}</span>
            <span className={styles.tag} data-t={r.tag}>
              {r.label}
            </span>
          </li>
        ))}
      </ol>
      </div>
      <aside className={styles.sum} aria-label="Итог по сотруднику">
        <p className={styles.sumLabel}>Итог по сотруднику</p>
        <p className={styles.who}>
          К. Белов
          <small>отдел продаж · уволен 15.09</small>
        </p>
        <dl>
          <div>
            <dt>обращений к ИИ за месяц</dt>
            <dd>37</dd>
          </div>
          <div>
            <dt>замаскировано персданных</dt>
            <dd>214</dd>
          </div>
          <div>
            <dt>ушло наружу открытым</dt>
            <dd className={styles.zero}>0</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
