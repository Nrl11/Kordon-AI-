"use client";

import { useState } from "react";
import Link from "next/link";
import Slider from "@/components/ui/Slider";
import { cx, vars } from "@/lib/css";
import { num } from "@/lib/format";
import { requestLicense } from "@/lib/license";
import { sub } from "@/lib/typo";
import { BUFFER, MODULES, TIERS, tierFor, toCount, toSlider } from "./tiers";
import styles from "./Pricing.module.css";

/* Pricing page header — the configurator itself. On the left, the heading
   and the summary with a quote request; on the right, the inputs: how many
   AI users and which add-on modules. No prices on the site. */

export default function Pricing({ title, lead }: { title: string; lead: string }) {
  const [v, setV] = useState(() => toSlider(1500));
  const [on, setOn] = useState<Record<string, boolean>>({ guard: true, agent: false, closed: false, support: false });

  const count = toCount(v);
  const ti = tierFor(count);
  const prevMax = ti > 0 ? TIERS[ti - 1].max : 50;
  /* 10% buffer: slightly above a tier still means the same tier */
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
          <p className="page-lead">{sub(lead)}</p>

          <aside className={styles.result} aria-live="polite">
            <p className={styles.resLabel}>Your license</p>
            <p className={styles.resTier}>
              {finite ? (
                <>
                  Tier <span>up to {tier.label}</span>
                </>
              ) : (
                <>
                  Over <span>10,000</span>
                </>
              )}
            </p>
            <p className={styles.resFits}>{tier.fits}</p>
            <ul className={styles.resList}>
              <li>Base: gateway, PII masking, budgets, audit log, SIEM export</li>
              {picked.map((m) => (
                <li key={m.key}>{m.name}</li>
              ))}
            </ul>
            <div className={styles.resFoot}>
              <p className={styles.resNote}>
                {!finite
                  ? "Terms are agreed individually."
                  : buffered
                    ? "You're within the 10% buffer: no extra charge."
                    : `Grow to ${num(tier.max * (1 + BUFFER))} at no extra charge.`}
              </p>
              <Link
                className="btn btn-gold"
                href="/start#request"
                onClick={() =>
                  requestLicense({
                    count,
                    tier: finite ? `Up to ${tier.label}` : "Over 10,000",
                    modules: picked.map((m) => m.name),
                  })
                }
              >
                Get a quote <span className="arr" aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        </div>

        <div className={styles.setup}>
          <Slider
            label="AI users in your company"
            value={v}
            min={0}
            max={1}
            step={0.002}
            onChange={setV}
            format={(x) => num(toCount(x))}
          />
          {/* license tiers: yours rises and lights up */}
          <div className={styles.steps} aria-hidden="true">
            {TIERS.map((t, i) => (
              <span
                key={t.label}
                className={cx(styles.step, i < eff && styles.stepPast, i === eff && styles.stepOn)}
                style={vars({ "--k": (i + 1) / TIERS.length })}
              >
                <i className={styles.stepBlock}>{i === eff && finite && <em className={styles.buffer} />}</i>
                <small>{t.label}</small>
              </span>
            ))}
          </div>
          <p className={styles.who}>
            We count everyone who used AI in the last 30 days: employees, service keys and agents. Each one counts once,
            however many requests they send.
          </p>

          <fieldset className={styles.mods}>
            <legend>Add-on modules</legend>
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
