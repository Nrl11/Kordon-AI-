"use client";

import { useState } from "react";
import Link from "next/link";
import Slider from "@/components/ui/Slider";
import { cx, vars } from "@/lib/css";
import { num } from "@/lib/format";
import { requestLicense } from "@/lib/license";
import { BUFFER, MODULES, TIERS, tierFor, toCount, toSlider } from "./tiers";
import styles from "./Pricing.module.css";

/* Шапка страницы стоимости — сам конфигуратор. Слева заголовок и итог
   с запросом цены, справа выбор: сколько потребителей и какие модули.
   Цен на сайте нет. */

export default function Pricing({ title, lead }: { title: string; lead: string }) {
  const [v, setV] = useState(() => toSlider(1500));
  const [on, setOn] = useState<Record<string, boolean>>({ guard: true, agent: false, closed: false, support: false });

  const count = toCount(v);
  const ti = tierFor(count);
  const prevMax = ti > 0 ? TIERS[ti - 1].max : 50;
  /* 10 % запаса: чуть выше ступени — всё ещё прежняя ступень */
  const buffered = ti > 0 && count <= prevMax * (1 + BUFFER);
  const eff = buffered ? ti - 1 : ti;
  const tier = TIERS[eff];
  const finite = Number.isFinite(tier.max);
  const picked = MODULES.filter((m) => on[m.key]);

  return (
    <section className="page-head">
      <div className={cx("wrap", styles.hero)}>
        <div className={styles.left}>
          <h1 className="h1-page">{title}</h1>
          <p className="page-lead">{lead}</p>

          <aside className={styles.result} aria-live="polite">
            <p className={styles.resLabel}>Ваша лицензия</p>
            <p className={styles.resTier}>
              {finite ? (
                <>
                  Ступень <span>до {tier.label}</span>
                </>
              ) : (
                <>
                  Больше <span>10 000</span>
                </>
              )}
            </p>
            <p className={styles.resFits}>{tier.fits}</p>
            <ul className={styles.resList}>
              <li>База: шлюз, маскирование персданных, лимиты, журнал и SIEM</li>
              {picked.map((m) => (
                <li key={m.key}>{m.name}</li>
              ))}
            </ul>
            <div className={styles.resFoot}>
              <p className={styles.resNote}>
                {!finite
                  ? "Условия обсуждаем отдельно."
                  : buffered
                    ? "Вы в запасе 10 %: превышение без доплаты."
                    : `Вырастете до ${num(tier.max * (1 + BUFFER))} — без доплаты.`}
              </p>
              <Link
                className="btn btn-gold"
                href="/start#request"
                onClick={() =>
                  requestLicense({
                    count,
                    tier: finite ? `до ${tier.label}` : "свыше 10 000",
                    modules: picked.map((m) => m.name),
                  })
                }
              >
                Получить цену <span className="arr" aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        </div>

        <div className={styles.setup}>
          <Slider
            label="Сколько у вас потребителей ИИ"
            value={v}
            min={0}
            max={1}
            step={0.002}
            onChange={setV}
            format={(x) => num(toCount(x))}
          />
          {/* ступени лицензии: ваша поднимается и подсвечивается */}
          <div className={styles.steps} aria-hidden="true">
            {TIERS.map((t, i) => (
              <span
                key={t.label}
                className={cx(styles.step, i < eff && styles.stepPast, i === eff && styles.stepOn)}
                style={vars({ "--k": (i + 1) / TIERS.length })}
              >
                <i className={styles.stepBlock}>{i === eff && finite && <em className={styles.buffer} />}</i>
                <small>{i === TIERS.length - 1 ? t.label : `до ${t.label}`}</small>
              </span>
            ))}
          </div>
          <p className={styles.who}>
            Считаем всех, кто обращался к ИИ за последние 30 дней: сотрудников, сервисные ключи и агентов. Повторные
            обращения не считаются.
          </p>

          <fieldset className={styles.mods}>
            <legend>Модули поверх базы</legend>
            <div className={styles.modGrid}>
              {MODULES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={cx(styles.toggle, on[m.key] && styles.toggleOn)}
                  aria-pressed={on[m.key]}
                  onClick={() => setOn((s) => ({ ...s, [m.key]: !s[m.key] }))}
                >
                  <span className={styles.switch} aria-hidden="true" />
                  <span>
                    <b>{m.name}</b>
                    <small>{m.text}</small>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </section>
  );
}
