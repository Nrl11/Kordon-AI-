"use client";

import { useSeen } from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Scenarios.module.css";

/* Три ситуации, которые случаются в любой компании, — тремя колонками.
   Когда блок появляется, ручная работа без шлюза перечёркивается строка
   за строкой, колонка за колонкой, и под ней проявляется одно действие
   в Кордоне. */

const CASES = [
  {
    title: "Утёк ключ",
    before: ["найти, где ещё он используется", "перевыпустить у провайдера", "обновить во всех приложениях", "перезапустить сервисы"],
    after: "Отозвать ключ в портале",
    note: "Остальные ключи работают, всё по отозванному — в журнале.",
  },
  {
    title: "Ушёл сотрудник",
    before: ["собрать его доступы к моделям", "отключить личные подписки", "сменить общие ключи", "разослать новые командам"],
    after: "Отключить учётку в каталоге",
    note: "Доступ ко всем моделям закрывается сразу.",
  },
  {
    title: "Меняем провайдера",
    before: ["найти, где зашит адрес", "переписать вызовы под новый API", "перевыпустить и раздать ключи", "проверить каждое приложение"],
    after: "Поменять маршрут в шлюзе",
    note: "Приложения ходят на тот же адрес с теми же ключами.",
  },
];

export default function Scenarios() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.35);
  return (
    <div ref={ref} className={styles.grid} data-on={seen || undefined}>
      {CASES.map((c, i) => (
        <article key={c.title} className={styles.case} style={vars({ "--i": i })}>
          <h3>{c.title}</h3>
          <div className={styles.before}>
            <small>Без шлюза — {c.before.length} шага</small>
            <ul>
              {c.before.map((b, k) => (
                <li key={b}>
                  <span className={styles.strike} style={vars({ "--k": k })}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.after}>
            <small>С Кордоном — одно действие</small>
            <b>{c.after}</b>
            <p>{nb(c.note)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
