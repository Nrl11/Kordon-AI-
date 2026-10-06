"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { useCycle } from "@/lib/useCycle";
import { cx, vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Portal.module.css";

/* Портал администратора Кордона крупно. Слева — шесть разделов, справа —
   экран раздела. Разделы листаются сами; на каждом через секунду
   происходит одно живое событие (отозван ключ, скрыт паспорт, остановлена
   атака, включён резерв, команда дошла до 80 % бюджета, запись ушла в SIEM)
   и всплывает уведомление, что именно случилось. Разделы можно открыть
   кнопками — тогда листание останавливается. */

type Key = "people" | "data" | "guard" | "route" | "money" | "log";
type Role = "it" | "ib" | "fin";
const NAV: { key: Key; name: string; count: string; role: Role }[] = [
  { key: "people", name: "Сотрудники", count: "1 480", role: "it" },
  { key: "data", name: "Персданные", count: "1 214", role: "ib" },
  { key: "guard", name: "Защита", count: "4", role: "ib" },
  { key: "route", name: "Маршруты", count: "5", role: "it" },
  { key: "money", name: "Бюджеты", count: "2,13 млн", role: "fin" },
  { key: "log", name: "Журнал", count: "48 210", role: "ib" },
];

/* куда вести дальше: каждая роль — своя страница */
const ROLES: { key: Role; title: string; text: string; href: string }[] = [
  { key: "it", title: "Для ИТ", text: "ключи, маршруты, агенты", href: "/solutions/it" },
  { key: "ib", title: "Для ИБ", text: "персданные, атаки, журнал", href: "/solutions/infosec" },
  { key: "fin", title: "Для финансов", text: "расходы и бюджеты", href: "/solutions/finance" },
];

const EVERY = 5600;
const EVENT_AT = 1500;

const PEOPLE = [
  { ini: "АЕ", who: "Анна Ершова", team: "юристы", key: "3f2a", kind: "SSO" },
  { ini: "ОС", who: "Ольга Смирнова", team: "закупки", key: "8d21", kind: "SSO" },
  { ini: "CI", who: "CI-пайплайн", team: "разработка", key: "91c0", kind: "сервис" },
  { ini: "Д", who: "Подрядчик «Дельта»", team: "внешний ключ", key: "c4d8", kind: "revoke" },
];
const MASKS = [
  { what: "ФИО", n: 812 },
  { what: "Телефоны", n: 344 },
  { what: "Паспорта и СНИЛС", n: 41 },
  { what: "Номера карт", n: 17 },
];
const THREATS = [
  { at: "10:42", what: "Просьба «забыть правила» в чате", out: "остановлено" },
  { at: "11:17", what: "Финмодель 2027 в запросе", out: "только локальная модель", tone: "blue" },
  { at: "12:31", what: "Ключ API в конфиге", out: "ключ скрыт", tone: "gold" },
];
const ROUTES = [
  { when: "Переводы, письма, пересказы", to: "быстрая модель", share: 46 },
  { when: "Код и аналитика", to: "Claude Sonnet", share: 31, fail: true },
  { when: "Повторный вопрос", to: "ответ из кэша", share: 14 },
  { when: "Документы с грифом", to: "локальная модель", share: 9 },
];
const BUDGETS = [
  { team: "Продажи", from: 74, to: 81, rub: "405 из 500 тыс. ₽" },
  { team: "Разработка", from: 64, to: 64, rub: "896 тыс. из 1,4 млн ₽" },
  { team: "Юристы", from: 51, to: 51, rub: "153 из 300 тыс. ₽" },
  { team: "Поддержка", from: 38, to: 38, rub: "228 из 600 тыс. ₽" },
];
const LOG = [
  { at: "12:41:15", who: "Бот поддержки", what: "локальная модель · 3 метки", rub: "0 ₽" },
  { at: "12:41:12", who: "Анна Ершова", what: "Claude Sonnet · 1 метка", rub: "3,10 ₽" },
  { at: "12:41:09", who: "CI-пайплайн", what: "быстрая модель", rub: "0,08 ₽" },
  { at: "12:41:07", who: "Ольга Смирнова", what: "GigaChat · 2 метки", rub: "0,42 ₽" },
];

type Screen = { title: string; hint: string; kpi: string; kpiNote: string; toast: string; tone: "red" | "gold" | "blue"; body: (on: boolean) => ReactNode };

const SCREENS: Record<Key, Screen> = {
  people: {
    title: "Кто пользуется ИИ",
    hint: "У каждого — свой ключ и свои правила. Вход через SSO вашей компании.",
    kpi: "1 480",
    kpiNote: "потребителей ИИ",
    toast: "Ключ «Дельты» отозван — доступ закрыт ко всем моделям сразу",
    tone: "red",
    body: (on) => (
      <ul className={styles.rows}>
        {PEOPLE.map((p, i) => {
          const off = on && p.kind === "revoke";
          return (
            <li key={p.key} style={vars({ "--i": i })} data-flash={off || undefined}>
              <span className={styles.ava}>{p.ini}</span>
              <span className={styles.main}>
                <b>{p.who}</b>
                <small>
                  {p.team} · ключ …{p.key}
                </small>
              </span>
              <span className={styles.state} data-tone={off ? "red" : p.kind === "сервис" ? "ink" : "green"}>
                {off ? "отозван" : p.kind === "сервис" ? "сервис" : "вход через SSO"}
              </span>
            </li>
          );
        })}
      </ul>
    ),
  },
  data: {
    title: "Что скрыто от моделей",
    hint: "Персданные заменяются метками до отправки. Ответ сотрудник получает со своими данными.",
    kpi: "1 214",
    kpiNote: "фрагментов скрыто сегодня",
    toast: "Юристы: паспорт в договоре заменён меткой ПАСПОРТ_1 до отправки",
    tone: "gold",
    body: (on) => (
      <ul className={styles.rows}>
        {MASKS.map((m, i) => (
          <li key={m.what} style={vars({ "--i": i })} data-flash={(on && i === 2) || undefined}>
            <span className={styles.main}>
              <b>{m.what}</b>
            </span>
            <span className={styles.bar} data-tone="gold" style={vars({ "--w": (m.n + (on && i === 2 ? 1 : 0)) / 812 })} />
            <span className={styles.num}>{m.n + (on && i === 2 ? 1 : 0)}</span>
          </li>
        ))}
      </ul>
    ),
  },
  guard: {
    title: "Что остановлено",
    hint: "Скрытые команды, утечки ключей и закрытые документы ловятся до того, как запрос уйдёт.",
    kpi: "4",
    kpiNote: "остановлено сегодня",
    toast: "Скрытая команда в письме поставщика — остановлена до модели",
    tone: "red",
    body: (on) => (
      <ul className={styles.rows}>
        {on && (
          <li className={styles.fresh} data-flash="">
            <span className={styles.dim}>12:44</span>
            <span className={styles.main}>
              <b>Скрытая команда в письме поставщика</b>
            </span>
            <span className={styles.state} data-tone="red">
              остановлено
            </span>
          </li>
        )}
        {THREATS.map((t, i) => (
          <li key={t.at} style={vars({ "--i": i })}>
            <span className={styles.dim}>{t.at}</span>
            <span className={styles.main}>
              <b>{t.what}</b>
            </span>
            <span className={styles.state} data-tone={t.tone ?? "red"}>
              {t.out}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  route: {
    title: "Какая модель отвечает",
    hint: "Простое — быстрой и дешёвой модели, сложное — сильной, закрытое — только локальной.",
    kpi: "5",
    kpiNote: "моделей в работе",
    toast: "Anthropic не отвечает — запросы ушли в резервную модель, приложения работают",
    tone: "gold",
    body: (on) => (
      <ul className={styles.rows}>
        {ROUTES.map((r, i) => {
          const sw = on && r.fail;
          return (
            <li key={r.when} style={vars({ "--i": i })} data-flash={sw || undefined}>
              <span className={styles.main}>
                <b>{r.when}</b>
                <small>
                  → {sw ? <span className={styles.swap}>GPT-6 Astra · резерв</span> : r.to}
                </small>
              </span>
              <span className={styles.bar} data-tone="blue" style={vars({ "--w": r.share / 46 })} />
              <span className={styles.num}>{r.share} %</span>
            </li>
          );
        })}
      </ul>
    ),
  },
  money: {
    title: "Сколько тратят команды",
    hint: "Лимит в рублях на команду или ключ. На 80 % — письмо руководителю, на 100 % — стоп.",
    kpi: "2,13 млн ₽",
    kpiNote: "из 3 млн ₽ на октябрь",
    toast: "Продажи потратили 80 % бюджета — руководитель получил письмо",
    tone: "gold",
    body: (on) => (
      <ul className={styles.rows}>
        {BUDGETS.map((b, i) => {
          const v = on ? b.to : b.from;
          return (
            <li key={b.team} style={vars({ "--i": i })} data-flash={(on && v >= 80) || undefined}>
              <span className={styles.main}>
                <b>{b.team}</b>
                <small>{b.rub}</small>
              </span>
              <span className={styles.bar} data-tone={v >= 80 ? "gold" : "ink"} style={vars({ "--w": v / 100 })} />
              <span className={styles.num}>{v} %</span>
            </li>
          );
        })}
      </ul>
    ),
  },
  log: {
    title: "Каждое обращение",
    hint: "Кто, когда, какая модель, что скрыто и сколько стоило. Журнал уходит в ваш SIEM.",
    kpi: "48 210",
    kpiNote: "обращений за сегодня",
    toast: "Новые записи уходят в SIEM службы ИБ — без ручных выгрузок",
    tone: "blue",
    body: (on) => (
      <ul className={styles.rows}>
        {on && (
          <li className={styles.fresh} data-flash="">
            <span className={styles.dim}>12:41:18</span>
            <span className={styles.main}>
              <b>Агент «Ревьюер»</b>
              <small>Claude Sonnet · без меток</small>
            </span>
            <span className={styles.num}>1,96 ₽</span>
          </li>
        )}
        {LOG.slice(0, on ? 3 : 4).map((l, i) => (
          <li key={l.at} style={vars({ "--i": i })}>
            <span className={styles.dim}>{l.at}</span>
            <span className={styles.main}>
              <b>{l.who}</b>
              <small>{l.what}</small>
            </span>
            <span className={styles.num}>{l.rub}</span>
          </li>
        ))}
      </ul>
    ),
  },
};

export default function Portal() {
  const [auto, setAuto] = useState(true);
  const { i, setI, live, running, pause, ref } = useCycle(NAV.length, EVERY, auto);
  const [event, setEvent] = useState(false);
  const key = NAV[i].key;
  const role = NAV[i].role;
  const s = SCREENS[key];

  /* через секунду после открытия раздела — событие */
  useEffect(() => {
    const id0 = requestAnimationFrame(() => setEvent(false));
    const t = window.setTimeout(() => setEvent(true), live ? EVENT_AT : 0);
    return () => {
      cancelAnimationFrame(id0);
      window.clearTimeout(t);
    };
  }, [i, live]);

  return (
    <div className={styles.block}>
    <div ref={ref} className={styles.window} {...pause}>
      <div className={styles.top}>
        <span className={styles.brand}>
          <LogoMark size={22} />
          <b>Кордон</b>
          <span className={styles.crumb}>
            портал администратора <em>/ {NAV[i].name}</em>
          </span>
        </span>
        <span className={styles.search} aria-hidden="true">
          Поиск по сотруднику, ключу или модели
        </span>
        <button
          type="button"
          className={styles.auto}
          onClick={() => setAuto((a) => !a)}
          aria-pressed={auto}
          aria-label={auto ? "Остановить автопросмотр разделов" : "Включить автопросмотр разделов"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle className={styles.ringBg} cx="12" cy="12" r="10" />
            {running && <circle key={i} className={styles.ring} cx="12" cy="12" r="10" style={vars({ "--t": `${EVERY}ms` })} />}
            <path d={auto ? "M9.5 8v8M14.5 8v8" : "M10 8l6 4-6 4z"} />
          </svg>
          {auto ? "Автопросмотр" : "Пауза"}
        </button>
      </div>

      <div className={styles.body}>
        <nav className={styles.nav} aria-label="Разделы портала">
          {NAV.map((n, k) => (
            <button
              key={n.key}
              type="button"
              className={styles.navItem}
              aria-pressed={k === i}
              data-on={k === i || undefined}
              onClick={() => {
                setI(k);
                setAuto(false);
              }}
            >
              <span>{n.name}</span>
              <small>{n.count}</small>
              {k === i && running && <i key={i} className={styles.timer} style={vars({ "--t": `${EVERY}ms` })} aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <div key={key} className={styles.screen} aria-live="polite">
          <div className={styles.head}>
            <div>
              <h3>{s.title}</h3>
              <p>{nb(s.hint)}</p>
            </div>
            <div className={styles.kpi}>
              <b>{s.kpi}</b>
              <span>{s.kpiNote}</span>
            </div>
          </div>
          <div className={styles.content}>{s.body(event)}</div>
          <p className={cx(styles.toast, event && styles.toastOn)} data-tone={s.tone}>
            <i aria-hidden="true" />
            {nb(s.toast)}
          </p>
        </div>
      </div>
    </div>

    <nav className={styles.roles} aria-label="Подробнее по ролям">
      {ROLES.map((r) => (
        <Link key={r.key} href={r.href} className={styles.role} data-on={r.key === role || undefined}>
          <b>{r.title}</b>
          <span>{r.text}</span>
          <i aria-hidden="true">→</i>
        </Link>
      ))}
    </nav>
    </div>
  );
}
