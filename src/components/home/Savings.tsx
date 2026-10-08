"use client";

import Link from "next/link";
import { useSeen } from "@/components/ui/Reveal";
import { computeCost } from "@/lib/costModel";
import { cx, vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Savings.module.css";

/* Экономика на главной — без сумм и обещаний. Три способа подключить
   модели полосами на одной шкале: тёмная часть — что вы платите, штрих —
   что срезает Кордон. Пропорции взяты из того же расчёта, что
   в калькуляторе, но цифр здесь нет — их считают уже на своих данных. */

const R = computeCost(150, "astra");
const MAX = R.apiDirect;

type Way = { key: "api" | "subs" | "pool"; name: string; tag: string; pay: number; cut?: number; note: string; risk?: string };
const WAYS: Way[] = [
  {
    key: "api",
    name: "API провайдеров",
    tag: "за каждый запрос",
    pay: R.api / MAX,
    cut: 1 - R.api / MAX,
    note: "Простое уходит в дешёвые модели, сложное — в сильные",
  },
  {
    key: "subs",
    name: "Подписка на каждого",
    tag: "фиксированно за сотрудника",
    pay: (R.subs / MAX) * 0.78,
    cut: (R.subs / MAX) * 0.22,
    note: "Видно, кто не пользуется подпиской, — лишние места можно снять",
  },
  {
    key: "pool",
    name: "Общий пул",
    tag: "несколько аккаунтов на всех",
    pay: R.pool / MAX,
    note: "Если аккаунт заблокируют, запросы уйдут в API — работа не встанет",
    risk: "риск блокировки",
  },
];

export default function Savings() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.35);

  return (
    <section id="savings" className={cx("section", styles.band)} aria-labelledby="savings-title">
      <div className="wrap">
        <div ref={ref} className={styles.card} data-in={seen || undefined}>
          <div className={styles.copy}>
            <h2 id="savings-title">Три способа подключить модели</h2>
            <p>
              {nb(
                "Кордон работает с любым из них: показывает, кто и на что тратит, и срезает лишнее там, где это возможно",
              )}
            </p>
            <Link className="btn btn-gold" href="/solutions/finance#calc">
              Посчитать на своих цифрах <span className="arr" aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.visual}>
            <ul className={styles.ways}>
              {WAYS.map((w, i) => (
                <li key={w.key} data-k={w.key} style={vars({ "--i": i, "--pay": w.pay, "--cut": w.cut ?? 0 })}>
                  <div className={styles.name}>
                    <h3>{w.name}</h3>
                    <span>{w.tag}</span>
                  </div>
                  <div className={styles.track} aria-hidden="true">
                    <i className={styles.pay} />
                    {w.cut && <i className={styles.cut} />}
                    {w.risk && <em className={styles.risk}>{w.risk}</em>}
                  </div>
                  <p className={styles.note}>
                    <span>С Кордоном:</span> {nb(w.note)}
                  </p>
                </li>
              ))}
            </ul>
            <p className={styles.legend}>
              <i className={styles.keyPay} aria-hidden="true" /> платите
              <i className={styles.keyCut} aria-hidden="true" /> срезает Кордон
              <span>длина полосы — счёт за месяц</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
