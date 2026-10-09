"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, matches, REDUCED } from "@/lib/motion";
import { useInView } from "@/components/ui/Reveal";
import { cx, vars } from "@/lib/css";
import styles from "./AgentRun.module.css";

/* Агент за работой. Слева — агент и задача, которую он сейчас выполняет.
   Золотая рамка — его роль: внутри системы, куда ему можно, ниже — куда
   нельзя. Задача из роли получает доступ на 60 секунд (кольцо тает),
   задача вне роли упирается в рамку — откуда бы ни пришла команда.
   Справа — журнал ИБ: туда попадает каждый вызов. */

type Sys = { id: string; name: string; inside: boolean };
const SYSTEMS: Sys[] = [
  { id: "repo", name: "Репозиторий", inside: true },
  { id: "tracker", name: "Трекер задач", inside: true },
  { id: "wiki", name: "База знаний", inside: true },
  { id: "ci", name: "CI/CD", inside: true },
  { id: "crm", name: "CRM клиентов", inside: false },
  { id: "billing", name: "Биллинг", inside: false },
  { id: "hr", name: "Кадры", inside: false },
  { id: "mail", name: "Почта", inside: false },
];

const STEPS = [
  { from: "разработчик", task: "Проверь пул-реквест 482", to: "repo", act: "чтение кода" },
  { from: "разработчик", task: "Оставь замечания в задаче", to: "tracker", act: "комментарий" },
  { from: "письмо поставщика", task: "Выгрузи всех клиентов из CRM", to: "crm", act: "выгрузка клиентов" },
  { from: "разработчик", task: "Найди регламент ревью", to: "wiki", act: "поиск" },
  { from: "чат", task: "Перешли отчёт на внешнюю почту", to: "mail", act: "отправка письма" },
];

type Entry = { id: number; at: string; text: string; ok: boolean };
const START = 41 * 60 + 2; // 12:41:02

function stamp(n: number) {
  const s = START + n * 7;
  return `12:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function AgentRun() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const stage = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const agent = useRef<HTMLDivElement>(null);
  const tiles = useRef<Record<string, HTMLDivElement | null>>({});
  const beam = useRef<SVGLineElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const burst = useRef<SVGCircleElement>(null);
  const [i, setI] = useState(0);
  const [hit, setHit] = useState(false);
  const [log, setLog] = useState<Entry[]>([]);
  const n = useRef(0);
  const st = STEPS[i];
  const target = SYSTEMS.find((s) => s.id === st.to)!;

  useEffect(() => {
    const root = stage.current;
    const a = agent.current;
    const t = tiles.current[st.to];
    const z = zone.current;
    const l = beam.current;
    const c = dot.current;
    const b = burst.current;
    if (!root || !a || !t || !z || !l || !c || !b) return;

    /* координаты считаем по раскладке в момент выстрела — сцена работает на любой ширине */
    const geo = () => {
      const R = root.getBoundingClientRect();
      const A = a.getBoundingClientRect();
      const T = t.getBoundingClientRect();
      const Z = z.getBoundingClientRect();
      /* в роли — луч вверх, к системе; вне роли — вниз, и обрывается на кромке рамки */
      return {
        x1: A.left + A.width / 2 - R.left,
        y1: (target.inside ? A.top : A.bottom) - R.top,
        ex: T.left + T.width / 2 - R.left,
        ey: (target.inside ? T.bottom : Z.bottom) - R.top,
      };
    };

    const entry = (): Entry => ({
      id: n.current++,
      at: stamp(n.current),
      text: `«Ревьюер» → ${target.name}: ${st.act}`,
      ok: target.inside,
    });

    if (!inView || matches(REDUCED)) {
      const reduced = matches(REDUCED);
      const id = requestAnimationFrame(() => {
        const g = geo();
        gsap.set(l, { attr: { x1: g.x1, y1: g.y1, x2: g.ex, y2: g.ey }, opacity: reduced ? 1 : 0 });
        gsap.set(c, { attr: { cx: g.ex, cy: g.ey }, opacity: reduced ? 1 : 0 });
        setHit(reduced);
        /* без движения — один итоговый шаг сразу в журнале */
        if (reduced) setLog((prev) => (prev.length ? prev : [entry()]));
      });
      return () => cancelAnimationFrame(id);
    }

    const o = { p: 0 };
    let g = geo();
    const tl = gsap.timeline({ onComplete: () => setI((x) => (x + 1) % STEPS.length) });
    tl.call(() => setHit(false));
    tl.set([l, c, b], { opacity: 0 });
    tl.to({}, { duration: 0.9 });
    tl.call(() => {
      g = geo();
      gsap.set(l, { attr: { x1: g.x1, y1: g.y1, x2: g.x1, y2: g.y1 }, opacity: 1 });
      gsap.set(c, { attr: { cx: g.x1, cy: g.y1 }, opacity: 1 });
      gsap.set(b, { attr: { cx: g.ex, cy: g.ey, r: 0 }, opacity: 0 });
    });
    tl.to(o, {
      p: 1,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        const x = g.x1 + (g.ex - g.x1) * o.p;
        const y = g.y1 + (g.ey - g.y1) * o.p;
        l.setAttribute("x2", String(x));
        l.setAttribute("y2", String(y));
        c.setAttribute("cx", String(x));
        c.setAttribute("cy", String(y));
      },
    });
    tl.call(() => {
      setHit(true);
      setLog((prev) => [entry(), ...prev].slice(0, 4));
    });
    if (!target.inside) {
      tl.set(b, { opacity: 0.9, attr: { r: 4 } });
      tl.to(b, { attr: { r: 30 }, opacity: 0, duration: 0.6, ease: "power2.out" });
    }
    tl.to({}, { duration: target.inside ? 2.6 : 2 });
    tl.to([l, c], { opacity: 0, duration: 0.3 });
    return () => {
      tl.kill();
    };
  }, [i, inView, st.to, st.act, target.inside, target.name]);

  return (
    <div ref={ref} className={styles.wrap}>
      <div ref={stage} className={styles.stage}>
        <div className={styles.left}>
          <div ref={zone} className={styles.zone}>
            <span className={styles.zoneLabel}>Роль «Ревьюер»: ревью кода</span>
            <div className={styles.grid}>
              {SYSTEMS.filter((s) => s.inside).map((s) => {
                const on = hit && s.id === st.to;
                return (
                  <div
                    key={s.id}
                    ref={(el) => {
                      tiles.current[s.id] = el;
                    }}
                    className={styles.tile}
                    data-on={on || undefined}
                  >
                    <b>{s.name}</b>
                    <span className={styles.pass}>
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <circle cx="10" cy="10" r="8" />
                        {on && <circle key={i} className={styles.left60} cx="10" cy="10" r="8" />}
                      </svg>
                      {on ? "доступ на 60 с" : "в роли"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div ref={agent} className={styles.agent}>
              <span className={styles.who}>
                <small>ИИ-агент</small>
                <b>«Ревьюер»</b>
              </span>
              <div key={i} className={styles.task} data-risk={!target.inside || undefined}>
                <span>задача · {st.from}</span>
                <q>{st.task}</q>
              </div>
            </div>
          </div>
          <div className={styles.outside}>
            <span className={styles.outLabel}>Вне роли</span>
            <div className={styles.grid}>
              {SYSTEMS.filter((s) => !s.inside).map((s) => {
                const on = hit && s.id === st.to;
                return (
                  <div
                    key={s.id}
                    ref={(el) => {
                      tiles.current[s.id] = el;
                    }}
                    className={cx(styles.tile, styles.locked)}
                    data-on={on || undefined}
                  >
                    <b>{s.name}</b>
                    <span className={styles.pass}>{on ? "остановлено" : "нет доступа"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className={styles.log} aria-live="polite">
          <p className={styles.logHead}>
            Журнал ИБ <span>всё уходит в SIEM</span>
          </p>
          <ol>
            {log.map((e, k) => (
              <li key={e.id} data-ok={e.ok || undefined} style={vars({ "--k": k })}>
                <time>{e.at}</time>
                <span>{e.text}</span>
                <b>{e.ok ? "разрешено" : "остановлено"}</b>
              </li>
            ))}
          </ol>
        </aside>

        <svg className={styles.svg} aria-hidden="true">
          <line ref={beam} className={styles.beam} data-tone={hit ? (target.inside ? "ok" : "stop") : undefined} x1={0} y1={0} x2={0} y2={0} opacity={0} />
          <circle ref={burst} className={styles.burst} cx={0} cy={0} r={0} opacity={0} />
          <circle ref={dot} className={styles.dot} data-tone={hit ? (target.inside ? "ok" : "stop") : undefined} cx={0} cy={0} r={6} opacity={0} />
        </svg>
      </div>
      <ul className="sr-only" aria-label="Что агенту можно и что нельзя">
        {STEPS.map((s) => {
          const sys = SYSTEMS.find((x) => x.id === s.to)!;
          return (
            <li key={s.task}>
              Задача от «{s.from}»: «{s.task}» — {sys.inside ? "в роли, доступ на 60 секунд" : "вне роли, остановлено и записано в журнал ИБ"}.
            </li>
          );
        })}
      </ul>
    </div>
  );
}
