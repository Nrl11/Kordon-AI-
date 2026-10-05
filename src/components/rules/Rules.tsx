"use client";

import { useEffect, useRef, useState } from "react";
import { matches, REDUCED } from "@/lib/motion";
import { cx } from "@/lib/css";
import styles from "./Rules.module.css";

/* «Правила задаёте вы» — консоль политик. Слева — правила, каждое можно
   выключить. Справа — журнал живых запросов: он сразу показывает, что
   происходит с правилом и без него. Выключили маску — в журнале пошли
   утечки; включили обратно — снова «маскирование». */

type Key = "mask" | "classes" | "limits" | "revoke" | "agent";
interface Policy {
  key: Key;
  name: string;
  rule: string;
}
interface Outcome {
  what: string;
  to: string;
  tag: string;
}
interface Ev {
  key: Key;
  who: string;
  on: Outcome;
  off: Outcome;
}

const POLICIES: Policy[] = [
  { key: "mask", name: "Маскировать персданные и ключи", rule: "ФИО, паспорта, карты, ключи API → метки" },
  { key: "classes", name: "Закрытое — только внутри", rule: "финмодели, стратегия, устав → локальная модель" },
  { key: "limits", name: "Лимит бюджета", rule: "300 000 ₽ в месяц на команду → стоп" },
  { key: "revoke", name: "Отзыв доступа при увольнении", rule: "сразу ко всем моделям, по данным Keycloak" },
  { key: "agent", name: "Периметр ИИ-агентов", rule: "только репозитории и трекер" },
];

const EVENTS: Ev[] = [
  {
    key: "mask",
    who: "Юрист",
    on: { what: "договор с ФИО_1", to: "ChatGPT", tag: "маскирование" },
    off: { what: "договор с Ивановым И. И.", to: "ChatGPT", tag: "утечка: ФИО" },
  },
  {
    key: "classes",
    who: "Финансы",
    on: { what: "финмодель 2027", to: "локальная модель", tag: "внутри контура" },
    off: { what: "финмодель 2027", to: "ChatGPT", tag: "ушло наружу" },
  },
  {
    key: "limits",
    who: "ci-build",
    on: { what: "2 140 запросов за час", to: "—", tag: "остановлено" },
    off: { what: "2 140 запросов за час", to: "GPT", tag: "перерасход 480 000 ₽" },
  },
  {
    key: "revoke",
    who: "О. Смирнов, уволен",
    on: { what: "попытка входа", to: "—", tag: "доступ закрыт" },
    off: { what: "выгрузка клиентской базы", to: "Claude", tag: "запрос прошёл" },
  },
  {
    key: "agent",
    who: "агент «Ревьюер»",
    on: { what: "запрос в биллинг", to: "—", tag: "заблокировано" },
    off: { what: "запрос в биллинг", to: "Биллинг", tag: "вне периметра" },
  },
  {
    key: "mask",
    who: "Разработчик",
    on: { what: "лог с КЛЮЧ_1", to: "OpenAI", tag: "маскирование" },
    off: { what: "лог с sk-live-8fK2…", to: "OpenAI", tag: "утечка: ключ" },
  },
  {
    key: "classes",
    who: "Юристы",
    on: { what: "устав, редакция 4", to: "локальная модель", tag: "внутри контура" },
    off: { what: "устав, редакция 4", to: "DeepSeek", tag: "ушло наружу" },
  },
  {
    key: "mask",
    who: "Поддержка",
    on: { what: "карта КАРТА_1", to: "GigaChat", tag: "маскирование" },
    off: { what: "карта 4276 1600…", to: "GigaChat", tag: "утечка: карта" },
  },
];

const VISIBLE = 6;
const EVERY = 1900;

interface Row {
  id: number;
  ev: Ev;
  safe: boolean;
  time: string;
}

const clock = (sec: number) =>
  [Math.floor(sec / 3600) % 24, Math.floor(sec / 60) % 60, sec % 60].map((x) => String(x).padStart(2, "0")).join(":");
const START = 10 * 3600 + 42 * 60;
const INITIAL: Row[] = Array.from({ length: VISIBLE }, (_, i) => ({
  id: VISIBLE - i,
  ev: EVENTS[(VISIBLE - 1 - i) % EVENTS.length],
  safe: true,
  time: clock(START - i * 4),
}));

export default function Rules() {
  const [on, setOn] = useState<Record<Key, boolean>>({ mask: true, classes: true, limits: true, revoke: true, agent: true });
  const onRef = useRef(on);
  const [feed, setFeed] = useState<Row[]>(INITIAL);
  const [risks, setRisks] = useState(0);
  const next = useRef({ i: VISIBLE, id: VISIBLE + 1, sec: START });
  const rootRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    onRef.current = on;
  }, [on]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting && !matches(REDUCED)), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const push = (ev: Ev) => {
    const n = next.current;
    n.sec += 2 + ((n.id * 7) % 4);
    const safe = onRef.current[ev.key];
    const row = { id: n.id++, ev, safe, time: clock(n.sec) };
    setFeed((f) => [row, ...f].slice(0, VISIBLE + 1));
    if (!safe) setRisks((r) => r + 1);
  };

  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => {
      const n = next.current;
      push(EVENTS[n.i % EVENTS.length]);
      n.i++;
    }, EVERY);
    return () => window.clearInterval(t);
  }, [live]);

  const toggle = (k: Key) => {
    const value = !on[k];
    setOn((s) => ({ ...s, [k]: value }));
    onRef.current = { ...onRef.current, [k]: value };
    if (Object.values(onRef.current).every(Boolean)) setRisks(0);
    /* сразу показать, что изменилось: следующее событие — по этому правилу */
    const idx = EVENTS.findIndex((e, j) => e.key === k && j >= next.current.i % EVENTS.length);
    const ev = EVENTS[idx >= 0 ? idx : EVENTS.findIndex((e) => e.key === k)];
    push(ev);
  };

  const off = POLICIES.filter((p) => !on[p.key]).length;
  const head = feed[0];
  return (
    <section id="rules" className={styles.section} aria-labelledby="rules-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="rules-title" className="h2">
            Правила задаёте вы
          </h2>
        </div>

        <div ref={rootRef} className={styles.console}>
          <div className={styles.policies}>
            <p className={styles.panelLabel}>
              Политики <span>{off === 0 ? "все включены — попробуйте выключить" : `выключено: ${off}`}</span>
            </p>
            <ul>
              {POLICIES.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on[p.key]}
                    className={cx(styles.policy, head.ev.key === p.key && styles.policyHit)}
                    onClick={() => toggle(p.key)}
                  >
                    <span className={styles.switch} aria-hidden="true" />
                    <span className={styles.policyText}>
                      <b>{p.name}</b>
                      <small>{p.rule}</small>
                    </span>
                    <span className={styles.state}>{on[p.key] ? "вкл" : "выкл"}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel} data-risk={off > 0 || undefined}>
            <div className={styles.panelHead}>
              <span>Журнал запросов</span>
              <span className={styles.risk} data-on={risks > 0 && off > 0 || undefined}>
                {off > 0 ? `Рисков: ${risks}` : "Рисков нет"}
              </span>
            </div>
            <div className={styles.feed} aria-live="polite" aria-relevant="additions">
              <div key={head.id} className={styles.list} data-push={head.id > VISIBLE || undefined}>
                {feed.slice(0, VISIBLE + 1).map((r, i) => {
                  const o = r.safe ? r.ev.on : r.ev.off;
                  return (
                    <div key={r.id} className={cx(styles.row, i === 0 && styles.fresh, i >= VISIBLE && styles.gone)} data-safe={r.safe || undefined}>
                      <span className={styles.time}>{r.time}</span>
                      <span className={styles.who}>{r.ev.who}</span>
                      <span className={styles.what}>{o.what}</span>
                      <span className={styles.to}>{o.to === "—" ? "" : `→ ${o.to}`}</span>
                      <span className={styles.tag}>{o.tag}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.panelFoot}>
              <span>Журнал уходит в ваш SIEM</span>
              <span className={styles.law}>152-ФЗ</span>
              <span className={styles.law}>Приказ ФСТЭК № 117</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
