"use client";

import { useState } from "react";
import Slider from "@/components/ui/Slider";
import { useInView } from "@/components/ui/Reveal";
import { useTween } from "@/lib/useTween";
import { cx } from "@/lib/css";
import { num, pct, rub, rubShort } from "@/lib/format";
import { bill, DEFAULTS, PRICE, ROUTE_CHEAPER, type Inputs } from "./calc";
import BillBars from "./BillBars";
import styles from "./Economics.module.css";

/* Калькулятор. Сверху — ваши цифры, в середине — каскад счёта,
   снизу — итог за год. Подписки и запросы к API — два разных рычага. */
export default function Economics() {
  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const set = (k: keyof Inputs) => (v: number) => setInp((p) => ({ ...p, [k]: v }));
  const b = bill(inp);
  const year = useTween(b.year);
  const [totalRef, totalOnScreen] = useInView<HTMLDivElement>(0);
  const [inputsRef, inputsOnScreen] = useInView<HTMLDivElement>(0);
  const peek = inputsOnScreen && !totalOnScreen;

  return (
    <div className={styles.card}>
      <div ref={inputsRef} className={styles.inputs}>
        <div className={styles.sliders}>
          <Slider label="Сотрудников с ИИ" value={inp.people} min={50} max={5000} step={50} onChange={set("people")} format={num} />
          <Slider
            label="Из них на дорогом тарифе"
            value={inp.seniorShare}
            min={0}
            max={0.6}
            step={0.01}
            onChange={set("seniorShare")}
            format={(v) => `${pct(v)} · ${num(Math.round(inp.people * v))} чел.`}
          />
          <Slider
            label="Расходы на API в месяц"
            value={inp.api}
            min={0}
            max={10_000_000}
            step={50_000}
            onChange={set("api")}
            format={rub}
          />
        </div>

        <details className={styles.more}>
          <summary>Допущения расчёта</summary>
          <div className={styles.moreBody}>
            <p>
              Дорогой тариф — {num(PRICE.senior)} ₽, базовый — {num(PRICE.base)} ₽ в месяц на человека. Дешёвая модель — в{" "}
              {ROUTE_CHEAPER} раз дешевле.
            </p>
            <Slider
              label="Дорогой тариф реально нужен"
              value={inp.needSenior}
              min={0}
              max={1}
              step={0.05}
              onChange={set("needSenior")}
              format={pct}
            />
            <Slider label="Простых задач" value={inp.simple} min={0} max={0.7} step={0.01} onChange={set("simple")} format={pct} />
            <Slider label="Повторных запросов" value={inp.cache} min={0} max={0.4} step={0.01} onChange={set("cache")} format={pct} />
          </div>
        </details>
      </div>

      {/* счёт и итог — в один ряд, чтобы блок целиком помещался в окно */}
      <div className={styles.lower}>
        <BillBars b={b} />

        <div className={styles.result}>
          <div ref={totalRef} className={styles.total}>
            <p className={styles.totalLabel}>Экономия в год</p>
            <p className={styles.totalNum} aria-live="polite">
              {rubShort(year)}
            </p>
            <p className={styles.totalNote}>{Math.round(b.share * 100)}% счёта за ИИ</p>
          </div>
          <a className={cx("btn", styles.cta)} href="#pilot">
            Посчитать на наших данных <span className="arr" aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <p className={cx(styles.peek, peek && styles.peekOn)} aria-hidden="true">
        <span>Экономия в год</span>
        <b>{rubShort(year)}</b>
      </p>
    </div>
  );
}
