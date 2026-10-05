"use client";

import { useState } from "react";
import Slider from "@/components/ui/Slider";
import { cx, vars } from "@/lib/css";
import { num } from "@/lib/format";
import { requestLicense } from "@/lib/license";
import { BUFFER, MODULES, TIERS, tierFor, toCount, toSlider } from "./tiers";
import styles from "./Pricing.module.css";

/* Конфигуратор лицензии: ступень по числу потребителей, модули поверх базы,
   справа — итог и запрос цены. Цен на сайте нет. */

type Glyph = "person" | "key" | "agent";
function Icon({ kind }: { kind: Glyph }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      {kind === "person" && (
        <>
          <circle cx="12" cy="8" r="3.6" />
          <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
        </>
      )}
      {kind === "key" && (
        <>
          <circle cx="8" cy="15.5" r="4.5" />
          <path d="m20.5 3.5-9.2 9.2M15.5 8.5l2.5 2.5M18 6l2 2" />
        </>
      )}
      {kind === "agent" && (
        <>
          <rect x="4.5" y="8" width="15" height="11.5" rx="3" />
          <path d="M12 4v4M9.5 13.5h.01M14.5 13.5h.01" />
        </>
      )}
    </svg>
  );
}

export default function Pricing() {
  const [v, setV] = useState(() => toSlider(1500));
  const [on, setOn] = useState<Record<string, boolean>>({ pd: true, agent: false, closed: false, support: false });

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
    <div className={styles.config}>
      <div className={styles.setup}>
        <Slider
          label="Сколько у вас потребителей"
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
          <span className={styles.whoIcons}>
            <Icon kind="person" />
            <Icon kind="key" />
            <Icon kind="agent" />
          </span>
          Считаем только тех, кто обращался к ИИ за 30 дней: людей, сервисные ключи и агентов.
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
          <li>База: шлюз и журнал, лимиты, SSO и SIEM</li>
          {picked.map((m) => (
            <li key={m.key}>{m.name}</li>
          ))}
        </ul>
        <p className={styles.resNote}>
          {!finite
            ? "Условия обсуждаем отдельно."
            : buffered
              ? "Вы в запасе 10 %: превышение без доплаты."
              : `Вырастете до ${num(tier.max * (1 + BUFFER))} — без доплаты.`}
        </p>
        <a
          className="btn btn-primary"
          href="#pilot"
          onClick={() =>
            requestLicense({
              count,
              tier: finite ? `до ${tier.label}` : "свыше 10 000",
              modules: picked.map((m) => m.name),
            })
          }
        >
          Получить цену <span className="arr" aria-hidden="true">→</span>
        </a>
      </aside>

      <ul className={styles.terms}>
        <li>Одна сумма в год за всю ступень</li>
        <li>Цена ступени фиксируется на 3 года</li>
        <li>Сверка раз в год, без ежемесячных отчётов</li>
        <li>Есть бессрочная лицензия — для покупки в CAPEX</li>
      </ul>
    </div>
  );
}
