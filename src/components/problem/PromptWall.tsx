"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, useReducedMotion } from "@/lib/motion";
import { vars } from "@/lib/css";
import styles from "./Problem.module.css";

/* Что сотрудники отправляют в публичные нейросети. Слева — запрос внутри
   компании: красный маркер проходит по опасным кускам. Справа — то, что уже
   лежит вне компании: куски вылетают из запроса через границу и копятся.
   Внизу справа — журнал ИБ, в котором об этом ни строчки. */

interface Leak {
  id: string;
  text: string;
  what: string;
}
type Part = string | Leak;
interface Quote {
  who: string;
  where: string;
  parts: Part[];
}

const QUOTES: Quote[] = [
  {
    who: "Продажи",
    where: "ChatGPT",
    parts: [
      "Напиши письмо клиенту ",
      { id: "s1", text: "Орлову Дмитрию", what: "ФИО клиента" },
      ", телефон ",
      { id: "s2", text: "+7 916 482-19-07", what: "телефон клиента" },
      ", скидка 15 %",
    ],
  },
  {
    who: "HR",
    where: "DeepSeek",
    parts: [
      "Сравни зарплаты отдела: ",
      { id: "h1", text: "Петрова — 240 000", what: "зарплата" },
      ", ",
      { id: "h2", text: "Смирнов — 310 000", what: "зарплата" },
    ],
  },
  {
    who: "Поддержка",
    where: "GigaChat",
    parts: [
      "Ответь клиентке ",
      { id: "p1", text: "Сидоровой А. В.", what: "ФИО клиентки" },
      ": карта ",
      { id: "p2", text: "4276 1600 1234 5678", what: "номер карты" },
      " заблокирована",
    ],
  },
  {
    who: "Разработчик",
    where: "Claude",
    parts: ["Почему не стартует сервис? Вот конфиг: ", { id: "d1", text: "DB_PASSWORD=Kr7#pq2x", what: "пароль от базы" }],
  },
];

const isLeak = (p: Part): p is Leak => typeof p !== "string";
const ALL = QUOTES.flatMap((q) => q.parts.filter(isLeak).map((leak) => ({ leak, where: q.where })));
const EVERY = 5600; // мс на цитату
const SEND = 1500; // когда куски улетают — после маркера

const plural = (n: number) => {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return "фрагмент";
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "фрагмента";
  return "фрагментов";
};

export default function PromptWall() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [sent, setSent] = useState<typeof ALL>([]);
  const [clearing, setClearing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [live, setLive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fresh = useRef(new Set<string>());

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* цикл: маркер → куски улетают наружу → следующая цитата; после последней — всё сначала */
  useEffect(() => {
    if (!live || paused || reduced) return;
    const q = QUOTES[i];
    const last = i === QUOTES.length - 1;
    const send = window.setTimeout(() => {
      const leaks = q.parts.filter(isLeak);
      leaks.forEach((l) => fresh.current.add(l.id));
      setSent((s) => [...s.filter((x) => !leaks.some((l) => l.id === x.leak.id)), ...leaks.map((leak) => ({ leak, where: q.where }))]);
    }, SEND);
    const clear = last ? window.setTimeout(() => setClearing(true), EVERY - 500) : 0;
    const next = window.setTimeout(() => {
      if (last) {
        setSent([]);
        setClearing(false);
      }
      setI((i + 1) % QUOTES.length);
    }, EVERY);
    return () => {
      window.clearTimeout(send);
      window.clearTimeout(clear);
      window.clearTimeout(next);
    };
  }, [i, live, paused, reduced]);

  /* полёт: кусок стартует с места в цитате (в её размере) и садится в стопку справа */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !fresh.current.size) return;
    let n = 0;
    fresh.current.forEach((id) => {
      const src = root.querySelector<HTMLElement>(`[data-leak="${id}"]`);
      const chip = root.querySelector<HTMLElement>(`[data-chip="${id}"]`);
      if (!src || !chip) return;
      const a = src.getBoundingClientRect();
      const b = chip.getBoundingClientRect();
      const delay = n++ * 0.24;
      gsap.fromTo(
        chip,
        { x: a.left - b.left, y: a.top - b.top, scale: a.height / b.height, transformOrigin: "0 0" },
        { x: 0, y: 0, scale: 1, duration: 1.05, ease: "power3.inOut", delay, clearProps: "transform" },
      );
      /* отрывается от цитаты: проявляется, уже уходя с места */
      gsap.fromTo(chip, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out", delay: delay + 0.08 });
    });
    fresh.current.clear();
  }, [sent]);

  const q = QUOTES[i];
  const shown = reduced ? ALL : sent;
  const done = q.parts.filter(isLeak).every((l) => shown.some((s) => s.leak.id === l.id));
  let k = 0;

  return (
    <div ref={rootRef} className={styles.stage} data-live={(live && !paused && !reduced) || undefined}>
      <div className={styles.inside}>
        <div className={styles.tabs} role="tablist" aria-label="Примеры запросов">
          {QUOTES.map((x, j) => (
            <button key={x.who} type="button" role="tab" aria-selected={j === i} className={styles.tab} onClick={() => setI(j)}>
              <b>{x.who}</b>
              <span className={styles.where}>
                <span aria-hidden="true">→</span> {x.where}
              </span>
              {j === i && <i key={`${i}-${paused}-${live}`} className={styles.timer} aria-hidden="true" />}
            </button>
          ))}
          <button
            type="button"
            className={styles.pause}
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Продолжить смену примеров" : "Остановить смену примеров"}
            aria-pressed={paused}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d={paused ? "M4 2.5v11l9-5.5z" : "M4 2.5h3v11H4zM9 2.5h3v11H9z"} fill="currentColor" />
            </svg>
          </button>
        </div>

        <figure key={i} className={styles.quote} role="tabpanel">
          <blockquote className={styles.prompt}>
            «
            {q.parts.map((p, j) =>
              isLeak(p) ? (
                <mark key={j} data-leak={p.id} className={styles.leak} style={vars({ "--k": k++ })}>
                  {p.text}
                </mark>
              ) : (
                <span key={j}>{p}</span>
              ),
            )}
            »
          </blockquote>
          <figcaption className={styles.status} data-done={done || undefined}>
            {done ? (
              <>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path d="m3 8.5 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Отправлено в {q.where} — на сервер вне компании
              </>
            ) : (
              <>
                {q.who} пишет в {q.where}…
              </>
            )}
          </figcaption>
        </figure>
      </div>

      <aside className={styles.outside} aria-label="Что ушло за пределы компании" data-clearing={clearing || undefined}>
        <p className={styles.outLabel}>Вне компании</p>
        <p className={styles.count} aria-live="polite">
          <b key={shown.length}>{shown.length}</b>
          <span>
            {plural(shown.length)} данных
            <br />
            на чужих серверах
          </span>
        </p>
        <ul className={styles.pile}>
          {shown.map(({ leak, where }) => (
            <li key={leak.id}>
              <span className={styles.chip} data-chip={leak.id}>
                {leak.text}
              </span>
              <span className={styles.meta}>
                {leak.what} · {where}
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.siem}>
          <span>Журнал ИБ</span>
          <b>0 записей</b>
        </p>
      </aside>
    </div>
  );
}
