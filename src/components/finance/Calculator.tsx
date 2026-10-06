"use client";

import { useId, useState } from "react";
import { computeCost, MODELS, TOP_MODELS, type TopModel } from "@/lib/costModel";
import { num } from "@/lib/format";
import { cx, vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Calculator.module.css";

/* Калькулятор расходов на модели. Выбираете, сколько сотрудников
   пользуются ИИ, какая модель у вас самая сильная и как платите, —
   справа счёт за месяц по выбранному способу и сравнение с двумя
   другими. Считает та же модель, что в расчёте для клиентов. */

type Way = "api" | "subs" | "pool";
const WAYS: { key: Way; name: string; short: string }[] = [
  { key: "api", name: "API провайдеров", short: "по API" },
  { key: "subs", name: "Подписка на каждого", short: "подписка на каждого" },
  { key: "pool", name: "Общий пул", short: "общий пул" },
];

/* ползунок в логарифмической шкале: 20 … 3 000 человек */
const LO = 20;
const HI = 3000;
const toPeople = (v: number) => {
  const raw = LO * Math.pow(HI / LO, v);
  const step = raw < 200 ? 5 : raw < 1000 ? 10 : 50;
  return Math.round(raw / step) * step;
};
const toSlider = (n: number) => Math.log(n / LO) / Math.log(HI / LO);

const short = (v: number) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(2).replace(".", ",")} млн ₽` : `${num(Math.round(v / 1000))} тыс. ₽`;

export default function Calculator() {
  const id = useId();
  const [people, setPeople] = useState(150);
  const [top, setTop] = useState<TopModel>("astra");
  const [way, setWay] = useState<Way>("api");
  const r = computeCost(people, top);
  const sums: Record<Way, number> = { api: r.api, subs: r.subs, pool: r.pool };
  const sum = sums[way];
  const max = Math.max(...Object.values(sums), r.apiDirect);
  const saved = r.apiDirect - r.api;
  const model = MODELS[top].name;

  const note =
    way === "api"
      ? saved / r.apiDirect > 0.05
        ? `Без Кордона, если всё отправлять в ${model}, — ${num(Math.round(r.apiDirect))} ₽. Маршрут по сложности экономит ${short(saved)} в месяц.`
        : `${model} недорогая — маршрут по сложности почти не меняет счёт. Кордон всё равно даёт лимиты и отчёт по командам.`
      : way === "subs"
        ? `${num(people)} подписок трёх уровней — по тому, как часто человек пользуется ИИ. Блокировка затронет одного сотрудника.`
        : `${r.seats} мест на ${num(people)} человек. Условия OpenAI и Anthropic запрещают делить аккаунт: если заблокируют, счёт вырастет до ${num(Math.round(r.api))} ₽ по API.`;

  return (
    <div className={styles.calc}>
      <form className={styles.inputs} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.field}>
          <label htmlFor={`${id}-n`}>
            Сколько сотрудников пользуются ИИ <output htmlFor={`${id}-n`}>{num(people)}</output>
          </label>
          <input
            id={`${id}-n`}
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={toSlider(people)}
            onChange={(e) => setPeople(toPeople(Number(e.target.value)))}
            aria-valuetext={`${people} сотрудников`}
            style={vars({ "--fill": `${toSlider(people) * 100}%` })}
          />
          <span className={styles.scale} aria-hidden="true">
            <span>20</span>
            <span>3 000</span>
          </span>
        </div>

        <fieldset className={styles.field}>
          <legend>Самая сильная модель</legend>
          <div className={styles.seg}>
            {TOP_MODELS.map((m) => (
              <label key={m} className={cx(styles.opt, top === m && styles.on)}>
                <input type="radio" name={`${id}-top`} value={m} checked={top === m} onChange={() => setTop(m)} />
                {MODELS[m].name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.field}>
          <legend>Способ оплаты</legend>
          <div className={styles.seg}>
            {WAYS.map((w) => (
              <label key={w.key} className={cx(styles.opt, way === w.key && styles.on)}>
                <input type="radio" name={`${id}-way`} value={w.key} checked={way === w.key} onChange={() => setWay(w.key)} />
                {w.name}
              </label>
            ))}
          </div>
        </fieldset>

        <p className={styles.assume}>
          {nb(
            "Считаем так: 20 % сотрудников пользуются ИИ постоянно, 50 % — регулярно, 30 % — изредка. Простые запросы Кордон отправляет в лёгкую модель, сложные — в самую сильную.",
          )}
        </p>
      </form>

      <div className={styles.result} role="status" aria-live="polite">
        <span className={styles.label}>Счёт за модели в месяц · {WAYS.find((w) => w.key === way)!.short}</span>
        <b className={styles.big}>{num(Math.round(sum))} ₽</b>
        <span className={styles.sub}>
          в год {short(sum * 12)} · на сотрудника {num(Math.round(sum / people))} ₽
        </span>

        <ul className={styles.compare}>
          {WAYS.map((w) => (
            <li key={w.key} data-on={w.key === way || undefined} data-k={w.key}>
              <span>{w.name}</span>
              <i>
                <s style={vars({ "--w": sums[w.key] / max })} />
              </i>
              <em>{short(sums[w.key])}</em>
            </li>
          ))}
        </ul>

        <p className={styles.note}>{nb(note)}</p>
        <p className={styles.foot}>Цены на 5 октября 2026, ₽ с НДС. Лицензия Кордона — отдельно.</p>
      </div>
    </div>
  );
}
