"use client";

import { useId, useState } from "react";
import { computeCost, MODELS, TOP_MODELS, type TopModel } from "@/lib/costModel";
import { num, usd, usdShort } from "@/lib/format";
import { cx, vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Calculator.module.css";

/* Model spend calculator. You pick how many employees use AI, which model
   is your strongest and how you pay — on the right, the monthly bill for
   that option compared with the other two. It runs the same model we use
   in client estimates. */

type Way = "api" | "subs" | "pool";
const WAYS: { key: Way; name: string; short: string }[] = [
  { key: "api", name: "Provider APIs", short: "pay-as-you-go API" },
  { key: "subs", name: "Seat per employee", short: "seat per employee" },
  { key: "pool", name: "Shared pool", short: "shared pool" },
];

/* logarithmic slider: 20 … 3,000 people */
const LO = 20;
const HI = 3000;
const toPeople = (v: number) => {
  const raw = LO * Math.pow(HI / LO, v);
  const step = raw < 200 ? 5 : raw < 1000 ? 10 : 50;
  return Math.round(raw / step) * step;
};
const toSlider = (n: number) => Math.log(n / LO) / Math.log(HI / LO);

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
        ? `Without Kordon, sending everything to ${model} would cost ${usd(r.apiDirect)} a month. Routing by complexity saves ${usdShort(saved)}.`
        : `${model} is inexpensive, so routing by complexity barely changes the bill. Kordon still gives you budgets and a report by team.`
      : way === "subs"
        ? `${num(people)} subscriptions on three plans, matched to how often each person uses AI. A ban affects one employee.`
        : `${r.seats} seats for ${num(people)} people. OpenAI and Anthropic terms prohibit account sharing: if accounts are banned, the bill rises to ${usd(r.api)} on the pay-as-you-go API.`;

  return (
    <div className={styles.calc}>
      <form className={styles.inputs} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.field}>
          <label htmlFor={`${id}-n`}>
            Employees using AI <output htmlFor={`${id}-n`}>{num(people)}</output>
          </label>
          <input
            id={`${id}-n`}
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={toSlider(people)}
            onChange={(e) => setPeople(toPeople(Number(e.target.value)))}
            aria-valuetext={`${num(people)} employees`}
            style={vars({ "--fill": `${toSlider(people) * 100}%` })}
          />
          <span className={styles.scale} aria-hidden="true">
            <span>20</span>
            <span>3,000</span>
          </span>
        </div>

        <fieldset className={styles.field}>
          <legend>Strongest model</legend>
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
          <legend>How you pay</legend>
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
            "Our assumptions: 20% of employees use AI constantly, 50% regularly, 30% occasionally. Kordon sends simple requests to a light model and complex ones to the strongest.",
          )}
        </p>
      </form>

      <div className={styles.result} role="status" aria-live="polite">
        <span className={styles.label}>Monthly model bill · {WAYS.find((w) => w.key === way)!.short}</span>
        <b className={styles.big}>{usd(sum)}</b>
        <span className={styles.sub}>
          {usdShort(sum * 12)} a year · {usd(sum / people)} per employee
        </span>

        <ul className={styles.compare}>
          {WAYS.map((w) => (
            <li key={w.key} data-on={w.key === way || undefined} data-k={w.key}>
              <span>{w.name}</span>
              <i>
                <s style={vars({ "--w": sums[w.key] / max })} />
              </i>
              <em>{usdShort(sums[w.key])}</em>
            </li>
          ))}
        </ul>

        <p className={styles.note}>{nb(note)}</p>
        <p className={styles.foot}>List prices as of October 2026, USD, before tax. Kordon license not included.</p>
      </div>
    </div>
  );
}
