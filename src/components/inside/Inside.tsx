"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, matches, REDUCED } from "@/lib/motion";
import { cx } from "@/lib/css";
import { EXAMPLES, STEPS, caption, type Step, type Word } from "./examples";
import Route, { routeGeometry } from "./Route";
import styles from "./Inside.module.css";

/* «What Kordon does with a request» — a view from inside the core. On top,
   the route: the request dot goes from the employee into Kordon, across the
   company border to an external model (or down to the local one) and back
   with the answer. Below, the request itself: words split into tiles, the
   scanner finds personal data, it flips into placeholders, and in the answer
   the placeholders turn back into data. */

function Tile({ wd, mode }: { wd: Word; mode: "req" | "ans" }) {
  const mask = wd.kind && wd.kind !== "closed";
  return (
    <span className={styles.tile} data-kind={wd.kind} data-glue={wd.glue || undefined}>
      {mask ? (
        <span className={styles.flip}>
          <span className={styles.face}>{mode === "req" ? wd.t : wd.token}</span>
          <span className={cx(styles.face, styles.back)}>{mode === "req" ? wd.token : wd.t}</span>
        </span>
      ) : (
        wd.t
      )}
      {mode === "req" && wd.label && <em className={styles.tag}>{wd.label}</em>}
    </span>
  );
}

/* punctuation holds on to the previous word: the pair never breaks across lines */
function Tiles({ words, mode }: { words: Word[]; mode: "req" | "ans" }) {
  const groups: Word[][] = [];
  for (const wd of words) {
    if (wd.glue && groups.length) groups[groups.length - 1].push(wd);
    else groups.push([wd]);
  }
  return (
    <>
      {groups.map((g, i) =>
        g.length === 1 ? (
          <Tile key={i} wd={g[0]} mode={mode} />
        ) : (
          <span key={i} className={styles.pair}>
            {g.map((wd, j) => (
              <Tile key={j} wd={wd} mode={mode} />
            ))}
          </span>
        ),
      )}
    </>
  );
}

/* where a new line starts: a tile's center is lower than the previous one by more than half its height */
const breaks = (r: DOMRect[]) => r.map((b, i) => i > 0 && b.top + b.height / 2 - (r[i - 1].top + r[i - 1].height / 2) > r[i - 1].height / 2);

/* The tile layout changes at once, but the eye sees a smooth transition: each
   tile glides from its old center to the new one, and the line height follows.
   Sizes are never animated — otherwise lines would rewrap mid-flight. If words
   move to other lines they would fly through their neighbors — then the line
   gently fades out in the old place and fades in at the new one. */
function relayout(box: HTMLElement, tiles: HTMLElement[], change: () => void, duration = 0.6) {
  const before = tiles.map((t) => t.getBoundingClientRect());
  const h0 = box.offsetHeight;
  /* a snapshot of the line before the change — needed if words move between lines */
  const ghost = box.cloneNode(true) as HTMLElement;
  change();
  const h1 = box.offsetHeight;
  const after = tiles.map((t) => t.getBoundingClientRect());
  const d = tiles.map((_, i) => ({
    x: before[i].left + before[i].width / 2 - (after[i].left + after[i].width / 2),
    y: before[i].top + before[i].height / 2 - (after[i].top + after[i].height / 2),
  }));
  const b0 = breaks(before);
  const b1 = breaks(after);
  const rewrap = b0.some((v, i) => v !== b1[i]);
  if (rewrap) {
    /* the old line (snapshot) fades out in place, the new one fades in on top —
       words never fly through their neighbors or overlap */
    ghost.setAttribute("aria-hidden", "true");
    /* a marker so the snapshot can be removed if the scene is interrupted */
    ghost.dataset.ghost = "";
    Object.assign(ghost.style, {
      position: "absolute",
      left: `${box.offsetLeft}px`,
      top: `${box.offsetTop}px`,
      width: `${box.offsetWidth}px`,
      margin: "0",
      pointerEvents: "none",
    });
    box.parentElement?.appendChild(ghost);
    gsap.to(ghost, { opacity: 0, duration: 0.3, ease: "power1.in", onComplete: () => ghost.remove() });
    gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.45, delay: 0.14, ease: "power2.out" });
    if (Math.abs(h0 - h1) > 0.5) gsap.fromTo(box, { height: h0 }, { height: h1, duration: 0.34, ease: "power2.inOut", clearProps: "height" });
    return;
  }
  tiles.forEach((t, i) => {
    if (Math.abs(d[i].x) > 0.5 || Math.abs(d[i].y) > 0.5)
      gsap.fromTo(t, { x: d[i].x, y: d[i].y }, { x: 0, y: 0, duration, ease: "power3.inOut", overwrite: "auto" });
  });
  if (Math.abs(h0 - h1) > 0.5) gsap.fromTo(box, { height: h0 }, { height: h1, duration, ease: "power3.inOut", clearProps: "height" });
}

/* Removes the line snapshots relayout leaves while they fade. Searched from
   the scene's lasting text block, not from the line: when the example changes,
   React detaches the old line before the cleanup runs, and the reverted fade
   would leave the old request on top of the new one at full opacity. */
function clearGhosts(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-ghost]").forEach((g) => {
    gsap.killTweensOf(g);
    g.remove();
  });
}

export default function Inside({ bare = false }: { bare?: boolean }) {
  const [ex, setEx] = useState(0);
  const [step, setStep] = useState<Step>(0);
  const [rows, setRows] = useState(0);
  const [paused, setPaused] = useState(false);
  const [width, setWidth] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<HTMLDivElement>(null);
  const ansRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLSpanElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const live = useRef({ visible: false, paused: false, hidden: false });
  /* restart the current example cleanly — after returning to the tab */
  const [run, setRun] = useState(0);

  const sync = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (live.current.visible && !live.current.paused && !live.current.hidden) tl.play();
    else tl.pause();
  };

  /* tab hidden — the scene freezes; back again — the example starts over,
     so tile moves never pile up on each other */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        live.current.hidden = true;
        tlRef.current?.pause();
      } else if (live.current.hidden) {
        live.current.hidden = false;
        setRun((r) => r + 1);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        live.current.visible = e.isIntersecting;
        sync();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* the diagram is drawn in strip pixels — watch its width */
  useEffect(() => {
    const el = routeRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    live.current.paused = paused;
    sync();
  }, [paused]);

  useEffect(() => {
    const box = reqRef.current;
    const ans = ansRef.current;
    const scan = scanRef.current;
    const text = textRef.current;
    const route = routeRef.current;
    if (!box || !ans || !scan || !text || !route || !width) return;
    const e = EXAMPLES[ex];
    const closed = !!e.closed;
    const q = <T extends Element = SVGGraphicsElement>(s: string) => route.querySelector(`[data-r="${s}"]`) as T;
    const dot = q<SVGCircleElement>("dot");
    const pulse = q<SVGCircleElement>("pulse");
    const check = q("check");
    const node = { who: q("who"), core: q("core"), local: q("local"), model: q(`model-${e.model}`) };
    const hl = { in: q<SVGPathElement>("hl-in"), ext: q<SVGPathElement>(`hl-ext-${e.model}`), local: q<SVGPathElement>("hl-local") };
    const allHl = Array.from(route.querySelectorAll<SVGPathElement>('[data-r^="hl-"]'));
    const dest = closed ? node.local : node.model;
    const out = closed ? hl.local : hl.ext;
    const sel = `.${styles.tile}`;
    const flipSel = `.${styles.flip}`;
    const reqTiles = Array.from(box.querySelectorAll<HTMLElement>(sel));
    const ansTiles = Array.from(ans.querySelectorAll<HTMLElement>(sel));
    const reqMask = reqTiles.filter((t) => t.dataset.kind && t.dataset.kind !== "closed");
    const ansMask = ansTiles.filter((t) => t.dataset.kind && t.dataset.kind !== "closed");
    const on = (el: Element, v: boolean) => el.toggleAttribute("data-on", v);
    const color = (c: string) => dot.setAttribute("data-c", c);
    const len = (p: SVGPathElement) => p.getTotalLength();

    /* the dot travels the path; the highlight draws itself behind it */
    const travel = (path: SVGPathElement, from: number, to: number, duration: number, draw: boolean) => {
      const L = len(path);
      const o = { t: from };
      return gsap.to(o, {
        t: to,
        duration,
        ease: "power2.inOut",
        onUpdate: () => {
          const p = path.getPointAtLength(o.t * L);
          dot.setAttribute("cx", p.x.toFixed(1));
          dot.setAttribute("cy", p.y.toFixed(1));
          if (draw) path.style.strokeDashoffset = String(L * (1 - o.t));
        },
      });
    };
    /* node centers — from the same geometry the diagram is drawn with */
    const geo = routeGeometry(width);
    const P = {
      who: geo.who,
      core: { x: geo.bx, y: geo.cy },
      dest: closed ? geo.local : geo.models[e.model],
    };
    const flash = (at: { x: number; y: number }, c: string) =>
      gsap.fromTo(
        pulse,
        { attr: { cx: at.x, cy: at.y, r: 12 }, opacity: 0.75 },
        {
          attr: { r: 34 },
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          immediateRender: false,
          onStart: () => pulse.setAttribute("data-c", c),
        },
      );

    /* starting state: everything off, tiles as written */
    const reset = () => {
      Object.values(node).forEach((n) => on(n, false));
      on(check, false);
      node.core.removeAttribute("data-busy");
      color("plain");
      allHl.forEach((p) => {
        const L = len(p);
        p.style.strokeDasharray = String(L);
        p.style.strokeDashoffset = String(L);
        p.style.visibility = "visible";
      });
      dot.setAttribute("cx", String(P.who.x));
      dot.setAttribute("cy", String(P.who.y));
      dot.setAttribute("r", "0");
      for (const t of [...reqTiles, ...ansTiles]) {
        for (const a of ["seen", "hit", "dim", "flipped", "swapped"]) delete t.dataset[a];
      }
      delete box.dataset.spread;
      ans.style.display = "";
      clearGhosts(text);
    };
    reset();

    if (matches(REDUCED)) {
      /* no motion: the end state — masking, decisions, route, answer with data */
      reqTiles.forEach((t) => t.dataset.kind && (t.dataset.hit = ""));
      reqMask.forEach((t) => (t.dataset.swapped = ""));
      ansMask.forEach((t) => (t.dataset.swapped = ""));
      ans.style.display = "flex";
      box.style.display = "none";
      on(check, true);
      on(dest, true);
      [hl.in, out].forEach((p) => (p.style.strokeDashoffset = "0"));
      dot.setAttribute("r", "0");
      queueMicrotask(() => {
        setStep(4);
        setRows(4);
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        onComplete: () => setEx((x) => (x + 1) % EXAMPLES.length),
      });
      tl.call(() => {
        setStep(0);
        setRows(0);
      });
      tl.fromTo(text, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      tl.fromTo(reqTiles, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: "power3.out" }, "<");

      /* the request goes from the employee into Kordon */
      tl.call(() => on(node.who, true), [], "-=0.1");
      tl.to(dot, { attr: { r: 7 }, duration: 0.35, ease: "back.out(2.2)" });
      tl.add(travel(hl.in, 0, 1, 1.1, true));
      tl.call(() => {
        on(node.who, false);
        on(node.core, true);
        node.core.setAttribute("data-busy", "");
      });
      tl.add(flash(P.core, "gold"), "<");

      /* scan: tiles spread apart, the scanner passes over them */
      tl.call(() => setStep(1), [], "+=0.1");
      tl.call(() => relayout(box, reqTiles, () => (box.dataset.spread = "")));
      let centers: { t: HTMLElement; x: number }[] = [];
      tl.fromTo(
        scan,
        { left: "0%", opacity: 1 },
        {
          left: "100%",
          duration: 1.6,
          ease: "none",
          immediateRender: false, // otherwise the scanner shows before the scan
          onStart: () => {
            centers = reqTiles.map((t) => ({ t, x: t.offsetLeft + t.offsetWidth / 2 }));
          },
          onUpdate() {
            const x = this.progress() * box.clientWidth;
            for (const c of centers) {
              if (c.x > x || c.t.dataset.seen !== undefined) continue;
              c.t.dataset.seen = "";
              if (c.t.dataset.kind) c.t.dataset.hit = "";
              else c.t.dataset.dim = "";
            }
          },
        },
        "+=1",
      );
      tl.to(scan, { opacity: 0, duration: 0.3 });
      tl.call(
        () => {
          setRows(1);
          color(closed ? "closed" : "pii");
        },
        [],
        "<",
      );

      /* masking: what was found flips into placeholders, the text closes up again */
      tl.call(() => setStep(2), [], "+=0.35");
      if (reqMask.length) {
        tl.to(
          reqMask.map((t) => t.querySelector(flipSel)),
          { rotateX: 180, duration: 0.7, stagger: 0.22, ease: "power2.inOut" },
          "+=0.35",
        );
        /* the red under the placeholder fades — only the gold placeholder stays */
        tl.call(() => reqMask.forEach((t) => (t.dataset.flipped = "")), [], "-=0.1");
      }
      tl.call(
        () =>
          relayout(box, reqTiles, () => {
            reqMask.forEach((t) => (t.dataset.swapped = ""));
            delete box.dataset.spread;
            reqTiles.forEach((t) => delete t.dataset.dim);
          }),
        [],
        "+=0.45",
      );
      tl.call(
        () => {
          setRows(2);
          if (!closed) color("mask");
        },
        [],
        "+=0.5",
      );

      /* routing: the check at the border, then out — or down to the local model */
      tl.call(() => setStep(3), [], "+=0.8");
      tl.call(() => node.core.removeAttribute("data-busy"));
      tl.call(() => setRows(3), [], "+=0.3");
      tl.call(() => on(check, true), [], "+=0.35");
      tl.add(travel(out, 0, 1, closed ? 1.2 : 1.6, true), "+=0.55");
      tl.to(dot, { attr: { r: 0 }, duration: 0.25, ease: "power2.in" }, "-=0.2");
      tl.call(() => {
        on(node.core, false);
        on(dest, true);
        setRows(4);
      });
      tl.add(flash(P.dest, closed ? "blue" : "gold"), "<");

      /* answer: the dot comes back — with placeholders up to Kordon, with data after it */
      tl.call(() => setStep(4), [], "+=0.6");
      tl.to(dot, { attr: { r: 7 }, duration: 0.3, ease: "back.out(2)" });
      tl.add(travel(out, 1, 0, closed ? 1 : 1.4, false));
      tl.to(box, { opacity: 0, y: -10, duration: 0.45, ease: "power2.in" }, "<");
      tl.call(() => {
        on(dest, false);
        on(node.core, true);
        color("ans");
      });
      tl.set(box, { display: "none" });
      tl.call(() => {
        ans.style.display = "flex";
      });
      tl.add(travel(hl.in, 1, 0, 1.1, false), "+=0.15");
      tl.fromTo(ansTiles, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: "power3.out" }, "<");
      tl.to(dot, { attr: { r: 0 }, duration: 0.25, ease: "power2.in" }, "-=0.2");
      tl.call(() => {
        on(node.core, false);
        on(node.who, true);
      });
      tl.add(flash(P.who, "white"), "<");
      if (ansMask.length) {
        /* the placeholder turns edge-on — invisible for a moment — and the tile
           swaps to data at its own width; neighbors shift, the data turns in */
        tl.to(
          ansMask.map((t) => t.querySelector(flipSel)),
          { rotateX: 90, duration: 0.32, stagger: 0.14, ease: "power2.in" },
          "+=0.5",
        );
        tl.call(() => {
          relayout(ans, ansTiles, () => ansMask.forEach((t) => (t.dataset.swapped = "")));
          gsap.fromTo(
            ansMask,
            { rotateX: -90, transformPerspective: 700 },
            { rotateX: 0, duration: 0.5, stagger: 0.14, ease: "power2.out" },
          );
        });
      }
      tl.to({}, { duration: 3.6 });
      /* a soft exit before the next example */
      tl.to([text, ...allHl], { opacity: 0, duration: 0.45, ease: "power2.in" });
      /* the scene runs 1.45× faster than the written durations */
      tl.timeScale(1.45);
      tlRef.current = tl;
      sync();
    }, rootRef);

    return () => {
      tlRef.current = null;
      ctx.revert();
      /* tile moves run outside the timeline — kill them and remove line snapshots */
      const loose = [...reqTiles, ...ansTiles, ...ansMask, box, ans];
      gsap.killTweensOf(loose);
      gsap.set(loose, { clearProps: "transform,opacity,height" });
      clearGhosts(text);
    };
  }, [ex, width, run]);

  const e = EXAMPLES[ex];
  const g = width ? routeGeometry(width) : null;
  const stage = (
        <div ref={rootRef} className={styles.stage}>
          <div className={styles.top}>
            <ol className={styles.steps} aria-label="Processing steps">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  data-on={i === step || undefined}
                  data-done={i < step || undefined}
                  aria-current={i === step ? "step" : undefined}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.stepName}>{s}</span>
                </li>
              ))}
            </ol>
            <div className={styles.tabs} role="tablist" aria-label="Example requests">
              {EXAMPLES.map((x, i) => (
                <button key={x.tab} type="button" role="tab" aria-selected={i === ex} className={styles.tab} onClick={() => setEx(i)}>
                  {x.tab}
                </button>
              ))}
              <button
                type="button"
                className={styles.pause}
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Resume animation" : "Pause animation"}
                aria-pressed={paused}
              >
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d={paused ? "M4 2.5v11l9-5.5z" : "M4 2.5h3v11H4zM9 2.5h3v11H9z"} fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {/* the diagram and the gateway decisions side by side, the request below
              at full width: that way the whole block fits in the window */}
          <div className={styles.layout}>
            <div className={styles.routeWrap}>
              <div ref={routeRef} className={styles.route} style={{ height: g ? g.h : 212 }}>
                {g && <Route key={`${ex}-${width}`} g={g} who={e.who} closed={!!e.closed} />}
              </div>
            </div>

            <div ref={textRef} className={styles.text}>
              <div className={styles.sentenceWrap}>
                <div key={`q${ex}`} ref={reqRef} className={styles.sentence}>
                  <Tiles words={e.req} mode="req" />
                  <span ref={scanRef} className={styles.scan} aria-hidden="true" />
                </div>
                <div key={`a${ex}`} ref={ansRef} className={cx(styles.sentence, styles.answer)}>
                  <Tiles words={e.ans} mode="ans" />
                </div>
              </div>
              <p className={styles.caption} aria-live="polite">
                {caption(step, e)}
              </p>
            </div>

            <aside className={styles.panel}>
              <p className={styles.panelTitle}>Gateway decision</p>
              <ul>
                {e.rows.map((r, i) => (
                  <li key={r.k} data-on={i < rows || undefined} data-tone={r.tone}>
                    <span>{r.k}</span>
                    <b>{r.v}</b>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
  );
  if (bare) return stage;
  return (
    <section id="how" className={styles.section} aria-labelledby="inside-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="inside-title" className={cx("h2", styles.title)}>
            What Kordon does with a&nbsp;request
          </h2>
        </div>
        {stage}
      </div>
    </section>
  );
}
