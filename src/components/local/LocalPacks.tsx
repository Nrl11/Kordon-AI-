"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { vars } from "@/lib/css";
import { matches, REDUCED } from "@/lib/motion";
import { useCycle } from "@/lib/useCycle";
import { MARKETS, words, type Part } from "./markets";
import styles from "./LocalPacks.module.css";

/* «Local laws, local languages» — the masking scene, market by market.
   Left: the markets. Right: a request written in that market's language,
   with its own ID formats. Kordon finds them, swaps them for placeholders
   and applies the market's profile: privacy law, languages, ID formats,
   routing. The markets advance on their own while the block is in view. */

type Phase = 0 | 1 | 2 | 3; // written · found · masked · profile applied
const PUNCT = /^[,.:;)]+$/;
const EVERY = 7600;
const AT: [Phase, number][] = [
  [1, 1000],
  [2, 2300],
  [3, 3100],
];

export default function LocalPacks() {
  const [paused, setPaused] = useState(false);
  const { i, setI, running, ref, pause } = useCycle<HTMLDivElement>(MARKETS.length, EVERY, !paused);
  /* the phase belongs to a market: a new market always starts from «written» */
  const [st, setSt] = useState<{ m: number; phase: Phase }>({ m: 0, phase: 0 });
  const phase: Phase = st.m === i ? st.phase : 0;
  const m = MARKETS[i];
  const list = words(m.req);
  /* punctuation holds on to the piece before it: the pair never breaks across lines */
  const groups: { k: number; w: Part }[][] = [];
  list.forEach((w, k) => {
    if (typeof w === "string" && PUNCT.test(w) && groups.length) groups[groups.length - 1].push({ k, w });
    else groups.push([{ k, w }]);
  });
  const piece = ({ k, w }: { k: number; w: Part }) =>
    typeof w === "string" ? (
      <span key={k} className={styles.word} data-glue={PUNCT.test(w) || undefined} style={vars({ "--k": k })} data-k={k}>
        {w}
      </span>
    ) : (
      <span
        key={k}
        className={styles.tile}
        data-hit={phase >= 1 || undefined}
        data-masked={phase >= 2 || undefined}
        style={vars({ "--k": k })}
        data-k={k}
      >
        {phase >= 2 ? (
          <span key="token" className={styles.token}>
            {w.token}
          </span>
        ) : (
          <span key="raw">{w.t}</span>
        )}
        <em className={styles.tag} aria-hidden="true">
          {w.label}
        </em>
      </span>
    );

  const textRef = useRef<HTMLParagraphElement>(null);
  const before = useRef<Map<number, DOMRect> | null>(null);

  useEffect(() => {
    if (matches(REDUCED)) {
      const id = requestAnimationFrame(() => setSt({ m: i, phase: 3 }));
      return () => cancelAnimationFrame(id);
    }
    const timers = AT.map(([p, ms]) =>
      window.setTimeout(() => {
        /* before the swap to placeholders: remember where every tile stands */
        if (p === 2 && textRef.current) {
          const map = new Map<number, DOMRect>();
          textRef.current.querySelectorAll<HTMLElement>("[data-k]").forEach((el) => map.set(Number(el.dataset.k), el.getBoundingClientRect()));
          before.current = map;
        }
        setSt({ m: i, phase: p });
      }, ms),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [i]);

  /* placeholders are shorter than the data — tiles glide to their new places
     instead of jumping (FLIP: from the old position to the new one) */
  useLayoutEffect(() => {
    const map = before.current;
    const box = textRef.current;
    if (phase !== 2 || !map || !box) return;
    before.current = null;
    const moves = [...box.querySelectorAll<HTMLElement>("[data-k]")].flatMap((el) => {
      const a = map.get(Number(el.dataset.k));
      if (!a) return [];
      const b = el.getBoundingClientRect();
      return [{ el, dx: a.left + a.width / 2 - (b.left + b.width / 2), dy: a.top + a.height / 2 - (b.top + b.height / 2) }];
    });
    /* words that change lines would fly through their neighbors — then the line
       just fades in at its new layout instead */
    if (moves.some((m) => Math.abs(m.dy) > 4)) {
      box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: "ease-out" });
      return;
    }
    moves.forEach(({ el, dx }) => {
      if (Math.abs(dx) < 0.5) return;
      el.animate([{ transform: `translateX(${dx}px)` }, { transform: "none" }], {
        duration: 520,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
      });
    });
  }, [phase]);

  return (
    <div ref={ref} className={styles.stage} {...pause}>
      <div className={styles.markets}>
        <p className={styles.label}>Markets</p>
        <div role="tablist" aria-label="Markets" className={styles.list}>
          {MARKETS.map((x, k) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`market-${x.id}`}
              aria-selected={k === i}
              aria-controls="market-panel"
              className={styles.market}
              onClick={() => setI(k)}
            >
              <b>{x.name}</b>
              <span>{x.laws}</span>
              {/* restarts with the cycle timer: after a pause the countdown starts over */}
              {k === i && <i key={`${i}-${running}`} className={styles.timer} data-run={running || undefined} aria-hidden="true" />}
            </button>
          ))}
        </div>
        <div className={styles.foot}>
          <p className={styles.more}>Another market? Its languages and law profile are set up during rollout.</p>
          <button
            type="button"
            className={styles.pause}
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume market tour" : "Pause market tour"}
            aria-pressed={paused}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d={paused ? "M4 2.5v11l9-5.5z" : "M4 2.5h3v11H4zM9 2.5h3v11H9z"} fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <div id="market-panel" role="tabpanel" aria-labelledby={`market-${m.id}`} className={styles.panel}>
        <p className={styles.label}>
          Request in {m.lang}
          <span className={styles.status} data-phase={phase}>
            {phase === 0 ? "written" : phase === 1 ? "personal data found" : "masked before it leaves"}
          </span>
        </p>

        <p key={m.id} ref={textRef} lang={m.code} className={styles.sentence} data-phase={phase}>
          {groups.map((g) =>
            g.length === 1 ? (
              piece(g[0])
            ) : (
              <span key={g[0].k} className={styles.pair}>
                {g.map(piece)}
              </span>
            ),
          )}
        </p>

        <dl className={styles.rows}>
          {m.rows.map((r, k) => (
            <div key={r.k} data-on={phase >= 3 || undefined} style={vars({ "--k": k })}>
              <dt>{r.k}</dt>
              <dd>{r.v}</dd>
            </div>
          ))}
        </dl>

        <p className={styles.note}>
          Filters tuned for English miss a Spanish visit note or a German IBAN. Kordon checks each request in the
          language it was written in.
        </p>
      </div>
    </div>
  );
}
