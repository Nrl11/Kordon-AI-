"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { useCycle } from "@/lib/useCycle";
import { cx, vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Portal.module.css";

/* Портал администратора Кордона крупно. Сверху на окне — три вкладки:
   ИТ, ИБ, финансы; у каждой свои три раздела в меню слева. Разделы
   листаются сами, вкладки переключаются вслед за ними. На каждом разделе
   через секунду происходит одно живое событие и всплывает уведомление,
   что именно случилось. Вкладка, открытая руками, листает только свои
   разделы; раздел, открытый руками, останавливает листание. */

type Key = "people" | "route" | "agents" | "data" | "guard" | "log" | "money" | "models" | "report";
type Role = "it" | "ib" | "fin";

/* три вкладки — три аудитории, у каждой свои разделы портала и своя страница */
const ROLES: { key: Role; title: string; text: string; page: string; href: string; screens: Key[] }[] = [
  { key: "it", title: "Для ИТ", text: "ключи, маршруты, агенты", page: "Всё для ИТ", href: "/solutions/it", screens: ["people", "route", "agents"] },
  { key: "ib", title: "Для ИБ", text: "персданные, атаки, журнал", page: "Всё для ИБ", href: "/solutions/infosec", screens: ["data", "guard", "log"] },
  { key: "fin", title: "Для финансов", text: "бюджеты, расходы, отчёт", page: "Всё для финансов", href: "/solutions/finance", screens: ["money", "models", "report"] },
];
const NAV: Record<Key, { name: string; count: string }> = {
  people: { name: "Ключи и доступ", count: "1 480" },
  route: { name: "Маршруты", count: "5" },
  agents: { name: "Агенты", count: "12" },
  data: { name: "Персданные", count: "1 214" },
  guard: { name: "Атаки", count: "4" },
  log: { name: "Журнал", count: "48 210" },
  money: { name: "Бюджеты", count: "2,13 млн" },
  models: { name: "По моделям", count: "405 тыс." },
  report: { name: "Отчёт", count: "1" },
};
const ALL: Key[] = ROLES.flatMap((r) => r.screens);
const roleOf = (k: Key) => ROLES.find((r) => r.screens.includes(k))!;

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
const AGENTS = [
  { ini: "Р", who: "«Ревьюер»", what: "ревью кода · репозиторий, трекер" },
  { ini: "П", who: "«Помощник поддержки»", what: "ответы клиентам · база знаний" },
  { ini: "А", who: "«Аналитик»", what: "отчёты · хранилище данных" },
];
/* расходы по моделям — тот же расчёт, что в калькуляторе: 150 человек, октябрь */
const MODEL_COSTS = [
  { name: "GPT-6 Astra", task: "сложные запросы", rub: 209_684 },
  { name: "Claude Sonnet 5.5", task: "обычные запросы", rub: 179_451 },
  { name: "Gemini 3.5 Flash-Lite", task: "простые запросы", rub: 9_882 },
  { name: "Alice AI LLM Flash", task: "чат-бот по базе знаний", rub: 5_788 },
];
const TEAM_REPORT = [
  { team: "Разработка", rub: "214 600 ₽", share: 42 },
  { team: "Продажи", rub: "118 300 ₽", share: 23 },
  { team: "Поддержка", rub: "79 800 ₽", share: 16 },
];

/* правая колонка раздела: линия за период и три показателя. Точка в конце
   линии — «сейчас»: на событии она вспыхивает, а показатель с `on` меняет
   значение. */
type Side = {
  label: string;
  total: string;
  line: number[];
  from: string;
  to: string;
  facts: { k: string; v: string; on?: string }[];
};

/* сегодня с начала рабочего дня, каждые полчаса — до текущего */
const MORNING = [120, 340, 610, 820, 960, 1040, 1090, 1110, 1126, 1118];
/* агенты работают круглые сутки: с полуночи по часам */
const ALLDAY = [42, 40, 38, 37, 39, 41, 47, 58, 74, 86, 93, 100, 97];
const wobble = (a: number[], s: number) => a.map((v, j) => v * (1 + 0.08 * Math.sin(s * 3.7 + j * 2.1)));
/* октябрь по дням до сегодня: 1-е — четверг, в выходные ниже */
const octDays = (s: number) => ({
  line: Array.from({ length: 22 }, (_, d) => {
    const off = d % 7 === 2 || d % 7 === 3;
    return (off ? 0.2 : 1) * (1 + 0.1 * Math.sin(s * 2.9 + d * 1.7));
  }),
  from: "1 окт",
  to: "сегодня",
});
const MONTHS = { from: "май", to: "октябрь" };

/* плавная линия без выбросов за точки (монотонная кривая) */
function smooth(pts: [number, number][]) {
  const n = pts.length;
  const m: number[] = [];
  for (let k = 0; k < n - 1; k++) m[k] = (pts[k + 1][1] - pts[k][1]) / (pts[k + 1][0] - pts[k][0]);
  const t: number[] = [m[0]];
  for (let k = 1; k < n - 1; k++) t[k] = m[k - 1] * m[k] <= 0 ? 0 : (m[k - 1] + m[k]) / 2;
  t[n - 1] = m[n - 2];
  for (let k = 0; k < n - 1; k++) {
    if (m[k] === 0) {
      t[k] = t[k + 1] = 0;
      continue;
    }
    const a = t[k] / m[k];
    const b = t[k + 1] / m[k];
    const s = a * a + b * b;
    if (s > 9) {
      const q = 3 / Math.sqrt(s);
      t[k] = q * a * m[k];
      t[k + 1] = q * b * m[k];
    }
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let k = 0; k < n - 1; k++) {
    const h = (pts[k + 1][0] - pts[k][0]) / 3;
    d += ` C${(pts[k][0] + h).toFixed(1)},${(pts[k][1] + t[k] * h).toFixed(1)} ${(pts[k + 1][0] - h).toFixed(1)},${(pts[k + 1][1] - t[k + 1] * h).toFixed(1)} ${pts[k + 1][0].toFixed(1)},${pts[k + 1][1].toFixed(1)}`;
  }
  return d;
}

type Screen = {
  title: string;
  hint: string;
  kpi: string;
  kpiNote: string;
  toast: string;
  tone: "red" | "gold" | "blue";
  side: Side;
  body: (on: boolean) => ReactNode;
};

const SCREENS: Record<Key, Screen> = {
  people: {
    title: "Кто пользуется ИИ",
    hint: "У каждого — свой ключ и свои правила. Вход через SSO вашей компании.",
    kpi: "1 480",
    kpiNote: "потребителей ИИ",
    toast: "Ключ «Дельты» отозван — доступ закрыт ко всем моделям сразу",
    tone: "red",
    side: {
      label: "Сотрудники в сети",
      total: "1 126 сегодня",
      line: MORNING,
      from: "8:00",
      to: "сейчас",
      facts: [
        { k: "Вход через SSO", v: "96 %" },
        { k: "Сервисных ключей", v: "38" },
        { k: "Внешних ключей", v: "4", on: "3" },
      ],
    },
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
    side: {
      label: "Скрыто по дням",
      total: "1 214 сегодня",
      ...octDays(4),
      facts: [
        { k: "Утечек персданных", v: "0" },
        { k: "Видов данных", v: "14" },
        { k: "Данные в ответах", v: "100 %" },
      ],
    },
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
    side: {
      label: "Остановлено по дням",
      total: "45 за октябрь",
      line: [3, 2, 0, 0, 4, 2, 3, 1, 2, 0, 0, 5, 3, 2, 4, 1, 0, 0, 2, 3, 4, 3],
      from: "1 окт",
      to: "сегодня",
      facts: [
        { k: "Скрытые команды", v: "1", on: "2" },
        { k: "Ключи и пароли", v: "1" },
        { k: "Закрытые документы", v: "1" },
      ],
    },
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
    side: {
      label: "Запросов по дням",
      total: "1,02 млн за октябрь",
      ...octDays(2),
      facts: [
        { k: "Средний ответ", v: "1,4 с" },
        { k: "Провайдеров на связи", v: "4 из 4", on: "3 из 4" },
        { k: "Сбоев провайдеров", v: "0", on: "1" },
      ],
    },
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
    side: {
      label: "Расход по дням",
      total: "2,13 млн ₽",
      ...octDays(5),
      facts: [
        { k: "Прогноз на октябрь", v: "2,9 млн ₽" },
        { k: "Команд с лимитом", v: "6" },
        { k: "Писем руководителям", v: "0", on: "1" },
      ],
    },
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
    side: {
      label: "Обращений по дням",
      total: "48 210 сегодня",
      ...octDays(6),
      facts: [
        { k: "Сотрудников сегодня", v: "1 126" },
        { k: "Запросов с метками", v: "18 %" },
        { k: "Передача в SIEM", v: "сразу" },
      ],
    },
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
  agents: {
    title: "Что делают агенты",
    hint: "У каждого агента — роль: куда можно и что можно. Доступ к системе — на 60 секунд.",
    kpi: "12",
    kpiNote: "агентов в работе",
    toast: "«Ревьюер» пытался выгрузить клиентов из CRM — остановлено, запись в журнале ИБ",
    tone: "red",
    side: {
      label: "Действий агентов по часам",
      total: "8 420 сегодня",
      line: wobble(ALLDAY, 3),
      from: "0:00",
      to: "сейчас",
      facts: [
        { k: "Доступ к системе", v: "на 60 с" },
        { k: "Систем подключено", v: "9" },
        { k: "Действий вне роли", v: "0", on: "1" },
      ],
    },
    body: (on) => (
      <ul className={styles.rows}>
        {on && (
          <li className={styles.fresh} data-flash="">
            <span className={styles.dim}>12:44</span>
            <span className={styles.main}>
              <b>«Ревьюер» → CRM клиентов</b>
              <small>команда из письма поставщика</small>
            </span>
            <span className={styles.state} data-tone="red">
              вне роли
            </span>
          </li>
        )}
        {AGENTS.map((a, i) => (
          <li key={a.who} style={vars({ "--i": i })}>
            <span className={styles.ava}>{a.ini}</span>
            <span className={styles.main}>
              <b>{a.who}</b>
              <small>{a.what}</small>
            </span>
            <span className={styles.state} data-tone="green">
              в роли
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  models: {
    title: "За что вы платите",
    hint: "Простое уходит в дешёвые модели, сложное — в сильные. Видно, сколько стоит каждая.",
    kpi: "405 тыс. ₽",
    kpiNote: "по API за октябрь",
    toast: "Маршрут по сложности сэкономил 771 тыс. ₽ против «всё в GPT-6 Astra»",
    tone: "gold",
    side: {
      label: "Счёт по API по месяцам",
      total: "−34 % с мая",
      line: [612, 548, 501, 452, 431, 405],
      ...MONTHS,
      facts: [
        { k: "Простые запросы", v: "58 %" },
        { k: "Сложные запросы", v: "8 %" },
        { k: "Моделей в маршруте", v: "4" },
      ],
    },
    body: (on) => (
      <ul className={styles.rows}>
        {MODEL_COSTS.map((m, i) => (
          <li key={m.name} style={vars({ "--i": i })} data-flash={(on && i === 2) || undefined}>
            <span className={styles.main}>
              <b>{m.name}</b>
              <small>{m.task}</small>
            </span>
            <span className={styles.bar} data-tone="gold" style={vars({ "--w": m.rub / MODEL_COSTS[0].rub })} />
            <span className={styles.num}>{Math.round(m.rub / 1000)} тыс. ₽</span>
          </li>
        ))}
      </ul>
    ),
  },
  report: {
    title: "Отчёт для бухгалтерии",
    hint: "Один счёт в рублях вместо подписок на личных картах — по командам и сотрудникам.",
    kpi: "1 счёт",
    kpiNote: "вместо 8 разрозненных",
    toast: "Отчёт за октябрь выгружен в 1С — финансы закрыли месяц без авансовых отчётов",
    tone: "blue",
    side: {
      label: "Сотрудников с доступом",
      total: "1 480 в октябре",
      line: [620, 780, 940, 1120, 1310, 1480],
      ...MONTHS,
      facts: [
        { k: "Команд в отчёте", v: "6" },
        { k: "Формат", v: "1С и Excel" },
        { k: "Авансовых отчётов", v: "0" },
      ],
    },
    body: (on) => (
      <ul className={styles.rows}>
        {on && (
          <li className={styles.fresh} data-flash="">
            <span className={styles.main}>
              <b>Выгрузка в 1С · октябрь</b>
              <small>512 500 ₽ · 6 команд · 1 480 человек</small>
            </span>
            <span className={styles.state} data-tone="blue">
              готово
            </span>
          </li>
        )}
        {TEAM_REPORT.map((t, i) => (
          <li key={t.team} style={vars({ "--i": i })}>
            <span className={styles.main}>
              <b>{t.team}</b>
              <small>{t.share} % расходов</small>
            </span>
            <span className={styles.bar} data-tone="blue" style={vars({ "--w": t.share / TEAM_REPORT[0].share })} />
            <span className={styles.num}>{t.rub}</span>
          </li>
        ))}
      </ul>
    ),
  },
};

/* поле графика: ширина 300, высота 100; линия растягивается по блоку */
const PW = 300;
const PH = 100;

function SidePanel({ side, on }: { side: Side; on: boolean }) {
  /* шкала от половины минимума: изменения видны, но линия не «падает в ноль» */
  const max = Math.max(...side.line);
  const lo = Math.min(...side.line) * 0.5;
  const n = side.line.length;
  const pts = side.line.map((v, j) => [(j / (n - 1)) * PW, PH - 6 - ((v - lo) / (max - lo)) * (PH - 16)] as [number, number]);
  const d = smooth(pts);
  const last = pts[n - 1];
  return (
    <aside className={styles.side}>
      <div className={styles.sideHead}>
        <span>{side.label}</span>
        <b>{side.total}</b>
      </div>
      <div className={styles.chart} aria-hidden="true">
        <div className={styles.plot}>
          <svg viewBox={`0 0 ${PW} ${PH}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="portal-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2a47d6" stopOpacity="0.2" />
                <stop offset="1" stopColor="#2a47d6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${d} L${PW},${PH} L0,${PH} Z`} fill="url(#portal-area)" />
            <path className={styles.line} d={d} />
          </svg>
          {/* «сейчас» — точкой в конце линии */}
          <i className={styles.now} data-on={on || undefined} style={vars({ "--y": last[1] / PH })} />
        </div>
        <div className={styles.ticks}>
          <span>{side.from}</span>
          <span>{side.to}</span>
        </div>
      </div>
      <dl className={styles.facts}>
        {side.facts.map((f) => (
          <div key={f.k} data-flash={(on && f.on) || undefined}>
            <dt>{f.k}</dt>
            <dd>{on && f.on ? f.on : f.v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export default function Portal() {
  const [auto, setAuto] = useState(true);
  /* вкладка, которую открыли руками: тогда листаются только её разделы */
  const [lock, setLock] = useState<Role | null>(null);
  const list = lock ? ROLES.find((r) => r.key === lock)!.screens : ALL;
  const { i, setI, live, running, pause, ref } = useCycle(list.length, EVERY, auto);
  const [event, setEvent] = useState(false);
  const key = list[Math.min(i, list.length - 1)];
  const role = roleOf(key);
  const s = SCREENS[key];

  const openRole = (r: Role) => {
    setLock(r);
    setI(0);
    setAuto(true);
  };
  const openScreen = (k: Key) => {
    const r = roleOf(k);
    setLock(r.key);
    setI(r.screens.indexOf(k));
    setAuto(false);
  };

  /* через секунду после открытия раздела — событие */
  useEffect(() => {
    const id0 = requestAnimationFrame(() => setEvent(false));
    const t = window.setTimeout(() => setEvent(true), live ? EVENT_AT : 0);
    return () => {
      cancelAnimationFrame(id0);
      window.clearTimeout(t);
    };
  }, [key, live]);

  return (
    <div ref={ref} className={styles.block} {...pause}>
      {/* вкладки сидят на окне: активная — одного цвета с его шапкой */}
      <div className={styles.tabsRow}>
        <div className={styles.tabs} role="tablist" aria-label="Портал глазами разных служб">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={r.key === role.key}
              className={styles.tab}
              data-on={r.key === role.key || undefined}
              onClick={() => openRole(r.key)}
            >
              <b>{r.title}</b>
              <span>{r.text}</span>
            </button>
          ))}
        </div>
        <Link className={styles.page} href={role.href}>
          {role.page} <span aria-hidden="true">→</span>
        </Link>
      </div>

    <div className={styles.window}>
      <div className={styles.top}>
        <span className={styles.brand}>
          <LogoMark size={22} />
          <b>Кордон</b>
          <span className={styles.crumb}>
            портал администратора <em>/ {NAV[key].name}</em>
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
        <nav className={styles.nav} aria-label={`Разделы: ${role.title.toLowerCase()}`}>
          <span className={styles.navHead}>{role.title}</span>
          {role.screens.map((k) => (
            <button
              key={k}
              type="button"
              className={styles.navItem}
              aria-pressed={k === key}
              data-on={k === key || undefined}
              onClick={() => openScreen(k)}
            >
              <span>{NAV[k].name}</span>
              <small>{NAV[k].count}</small>
              {k === key && running && <i key={`${lock}-${i}`} className={styles.timer} style={vars({ "--t": `${EVERY}ms` })} aria-hidden="true" />}
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
          <div className={styles.content}>
            {s.body(event)}
            <SidePanel side={s.side} on={event} />
          </div>
          <p className={cx(styles.toast, event && styles.toastOn)} data-tone={s.tone}>
            <i aria-hidden="true" />
            {nb(s.toast)}
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
