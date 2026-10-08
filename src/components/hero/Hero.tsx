"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { useStage } from "@/components/three/useStage";
import { cx } from "@/lib/css";
import { CTA } from "@/lib/site";
import { HERO_VIDEO } from "@/lib/media";
import { nb } from "@/lib/typo";
import { DEPTS, STORIES, destName, type Phase } from "./flow";
import { HERO_LABELS, type HeroScene } from "./heroScene";
import styles from "./Hero.module.css";

/* Первый экран: слева — тезис, справа — живая схема продукта (или ролик,
   когда он готов). Под схемой — билет текущего запроса: что написал
   сотрудник и что с этим сделал шлюз. */
export default function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={cx("wrap", styles.grid)}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.title}>
            Защита, которая окупает себя
          </h1>
          <p className={styles.sub}>
            {nb("Все запросы сотрудников и ИИ-агентов к нейросетям — через один шлюз внутри вашего контура")}
          </p>
          <div className={styles.actions}>
            <Link className="btn btn-primary" href={CTA.href}>
              Запросить пилот <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link className={styles.textLink} href="#protect">
              Как устроен шлюз
            </Link>
          </div>
        </div>
        {HERO_VIDEO ? <HeroVideo src={HERO_VIDEO.src} poster={HERO_VIDEO.poster} /> : <HeroScheme />}
      </div>
    </section>
  );
}

function PauseIcon({ paused }: { paused: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d={paused ? "M4 2.5v11l9-5.5z" : "M4 2.5h3v11H4zM9 2.5h3v11H9z"} fill="currentColor" />
    </svg>
  );
}

/* ролик при старте: без звука, по кругу, с паузой */
function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  return (
    <figure className={styles.figure}>
      <div className={cx(styles.stage, styles.videoStage)} data-ready="">
        <video ref={ref} className={styles.video} src={src} poster={poster} autoPlay muted loop playsInline />
        <button
          type="button"
          className={styles.pause}
          onClick={() => {
            const v = ref.current;
            if (!v) return;
            if (v.paused) v.play();
            else v.pause();
            setPaused(v.paused);
          }}
          aria-label={paused ? "Продолжить видео" : "Остановить видео"}
          aria-pressed={paused}
        >
          <PauseIcon paused={paused} />
        </button>
      </div>
    </figure>
  );
}

function HeroScheme() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelsBox = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<{ story: number; phase: Phase }>({ story: 0, phase: "go" });
  const [paused, setPaused] = useState(false);
  const onPhase = useCallback((story: number, phase: Phase) => setNow({ story, phase }), []);
  const onPhaseRef = useRef(onPhase);

  const create = useCallback(async (canvas: HTMLCanvasElement, ctx: { reduced: boolean }) => {
    const { createHeroScene } = await import("./heroScene");
    const scene = createHeroScene(canvas, { reduced: ctx.reduced, onPhase: (s, p) => onPhaseRef.current(s, p) });
    /* подписи двигаем вместе с кадром, без перерисовки React */
    const frame = scene.frame;
    scene.frame = (t, dt) => {
      const more = frame(t, dt);
      scene.labels.forEach((l, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        el.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0)`;
        if (l.on) el.dataset.on = "";
        else delete el.dataset.on;
        if (l.hide) el.dataset.hide = "";
        else delete el.dataset.hide;
      });
      /* подписи показываем только после первого кадра — до него они стоят в углу */
      const box = labelsBox.current;
      if (box && !box.dataset.placed) box.dataset.placed = "";
      return more;
    };
    return scene;
  }, []);
  const { stageRef, ready, failed } = useStage<HeroScene>(canvasRef, create);

  useEffect(() => {
    stageRef.current?.setPaused(paused);
  }, [paused, stageRef, ready]);

  const s = STORIES[now.story];
  const processed = now.phase !== "go";
  const shown = now.phase === "out" || now.phase === "done" || (s.to === "stop" && processed);
  const dest = destName(s.to);

  return (
    <figure className={styles.figure}>
      <div className={styles.stage} data-ready={ready || undefined}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        {failed && (
          <div className={styles.fallback} aria-hidden="true">
            <LogoMark size={260} thick={false} />
          </div>
        )}
        <div ref={labelsBox} className={styles.labels} aria-hidden="true">
          {HERO_LABELS.map((l, i) => (
            <span
              key={l.id}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className={styles.label}
              data-side={l.side}
              data-kind={l.kind}
            >
              {l.kind !== "core" && l.kind !== "zone" && <i className={styles.dot} />}
              <span className={styles.labelText}>{l.text}</span>
            </span>
          ))}
        </div>
        <button
          type="button"
          className={styles.pause}
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Продолжить анимацию" : "Остановить анимацию"}
          aria-pressed={paused}
        >
          <PauseIcon paused={paused} />
        </button>
      </div>

      {/* билет текущего запроса */}
      <figcaption className={styles.ticket} aria-live="off">
        <div key={now.story} className={styles.ticketIn}>
          <span className={styles.who}>{DEPTS[s.from]}</span>
          <p className={styles.req}>
            «
            {s.text.map((p, i) =>
              typeof p === "string" ? (
                <span key={i}>{p}</span>
              ) : (
                <span key={i} className={styles.plate} data-flip={processed || undefined}>
                  <span className={styles.face}>{p.value}</span>
                  <span className={cx(styles.face, styles.back)}>{p.token}</span>
                </span>
              ),
            )}
            »
          </p>
          <span className={styles.verdict} data-tone={s.tone} data-on={shown || undefined}>
            {dest ? <b>→ {dest}</b> : <b>стоп</b>}
            <span>{s.verdict}</span>
          </span>
        </div>
      </figcaption>
      <p className="sr-only">
        Схема: стена периметра отделяет вашу компанию от внешних моделей. Запросы юристов, маркетинга, финансов,
        разработки и ИИ-агентов проходят через единственный проход — шлюз Кордон. Персональные данные и ключи
        заменяются метками, закрытые данные уходят в локальную модель внутри, запросы сверх лимита останавливаются.
      </p>
    </figure>
  );
}
