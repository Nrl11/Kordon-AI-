"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { useCycle } from "@/lib/useCycle";
import { cx, vars } from "@/lib/css";
import { usd, usdShort } from "@/lib/format";
import { nb } from "@/lib/typo";
import styles from "./Portal.module.css";

/* The Kordon admin portal, up close. Three tabs sit on top of the window:
   IT, security, finance; each has its own three sections in the left menu.
   Sections advance on their own and the tabs follow them. On each section a
   live event happens after a second, and a notification pops up saying what
   exactly happened. A tab opened by hand cycles only through its own
   sections; a section opened by hand stops the cycling. */

type Key = "people" | "route" | "agents" | "data" | "guard" | "log" | "money" | "models" | "report";
type Role = "it" | "ib" | "fin";

/* three tabs — three audiences, each with its own portal sections and its own page */
const ROLES: { key: Role; title: string; text: string; page: string; href: string; screens: Key[] }[] = [
  { key: "it", title: "For IT", text: "keys, routing, agents", page: "More for IT", href: "/solutions/it", screens: ["people", "route", "agents"] },
  { key: "ib", title: "For Security", text: "PII, attacks, audit log", page: "More for Security", href: "/solutions/infosec", screens: ["data", "guard", "log"] },
  { key: "fin", title: "For Finance", text: "budgets, spend, reports", page: "More for Finance", href: "/solutions/finance", screens: ["money", "models", "report"] },
];
const NAV: Record<Key, { name: string; count: string }> = {
  people: { name: "Keys and access", count: "1,480" },
  route: { name: "Routing", count: "5" },
  agents: { name: "Agents", count: "12" },
  data: { name: "Personal data", count: "1,214" },
  guard: { name: "Attacks", count: "4" },
  log: { name: "Audit log", count: "48,210" },
  money: { name: "Budgets", count: usdShort(26_600) },
  models: { name: "By model", count: usdShort(5_060) },
  report: { name: "Report", count: "1" },
};
const ALL: Key[] = ROLES.flatMap((r) => r.screens);
const roleOf = (k: Key) => ROLES.find((r) => r.screens.includes(k))!;

const EVERY = 5600;
const EVENT_AT = 1500;

const PEOPLE = [
  { ini: "AR", who: "Anna Ross", team: "Legal", key: "3f2a", kind: "SSO" },
  { ini: "OS", who: "Olivia Smith", team: "Procurement", key: "8d21", kind: "SSO" },
  { ini: "CI", who: "CI pipeline", team: "Engineering", key: "91c0", kind: "service" },
  { ini: "D", who: "Delta Logistics", team: "Contractor", key: "c4d8", kind: "revoke" },
];
const MASKS = [
  { what: "Names", n: 812 },
  { what: "Phone numbers", n: 344 },
  { what: "SSNs and passports", n: 41 },
  { what: "Card numbers", n: 17 },
];
const THREATS = [
  { at: "10:42 AM", what: "“Ignore your rules” request in chat", out: "blocked" },
  { at: "11:17 AM", what: "2027 financial model in a prompt", out: "local model only", tone: "blue" },
  { at: "12:31 PM", what: "API key in a config file", out: "key masked", tone: "gold" },
];
const ROUTES = [
  { when: "Translations, emails, summaries", to: "fast model", share: 46 },
  { when: "Code and analytics", to: "Claude Sonnet", share: 31, fail: true },
  { when: "Repeat questions", to: "cached answer", share: 14 },
  { when: "Confidential documents", to: "local model", share: 9 },
];
const BUDGETS = [
  { team: "Sales", from: 74, to: 81, sum: `${usd(5_060)} of ${usd(6_250)}` },
  { team: "Engineering", from: 64, to: 64, sum: `${usd(11_200)} of ${usd(17_500)}` },
  { team: "Legal", from: 51, to: 51, sum: `${usd(1_910)} of ${usd(3_750)}` },
  { team: "Support", from: 38, to: 38, sum: `${usd(2_850)} of ${usd(7_500)}` },
];
const LOG = [
  { at: "12:41:15 PM", who: "Support bot", what: "local model · 3 placeholders", cost: "$0" },
  { at: "12:41:12 PM", who: "Anna Ross", what: "Claude Sonnet · 1 placeholder", cost: "$0.04" },
  { at: "12:41:09 PM", who: "CI pipeline", what: "fast model", cost: "$0.001" },
  { at: "12:41:07 PM", who: "Olivia Smith", what: "Mistral · 2 placeholders", cost: "$0.005" },
];
const AGENTS = [
  { ini: "R", who: "Reviewer", what: "code review · repo, issue tracker" },
  { ini: "S", who: "Support Assistant", what: "customer replies · knowledge base" },
  { ini: "A", who: "Analyst", what: "reports · data warehouse" },
];
/* spend by model — the same math as the cost calculator: 150 people, October */
const MODEL_COSTS = [
  { name: "GPT-6 Astra", task: "complex requests", usd: 2_621 },
  { name: "Claude Sonnet 5.5", task: "everyday requests", usd: 2_243 },
  { name: "Gemini 3.5 Flash-Lite", task: "simple requests", usd: 124 },
  { name: "Mistral Small", task: "knowledge base chatbot", usd: 72 },
];
const TEAM_REPORT = [
  { team: "Engineering", usd: 2_680, share: 42 },
  { team: "Sales", usd: 1_480, share: 23 },
  { team: "Support", usd: 1_000, share: 16 },
];

/* right column of a section: a line over the period and three metrics. The
   dot at the end of the line is “now”: it flashes on the event, and the metric
   with `on` changes its value. */
type Side = {
  label: string;
  total: string;
  line: number[];
  from: string;
  to: string;
  facts: { k: string; v: string; on?: string }[];
};

/* today from the start of the workday, every half hour up to now */
const MORNING = [120, 340, 610, 820, 960, 1040, 1090, 1110, 1126, 1118];
/* agents work around the clock: hourly since midnight */
const ALLDAY = [42, 40, 38, 37, 39, 41, 47, 58, 74, 86, 93, 100, 97];
const wobble = (a: number[], s: number) => a.map((v, j) => v * (1 + 0.08 * Math.sin(s * 3.7 + j * 2.1)));
/* October by day up to today: the 1st is a Thursday, weekends run lower */
const octDays = (s: number) => ({
  line: Array.from({ length: 22 }, (_, d) => {
    const off = d % 7 === 2 || d % 7 === 3;
    return (off ? 0.2 : 1) * (1 + 0.1 * Math.sin(s * 2.9 + d * 1.7));
  }),
  from: "Oct 1",
  to: "today",
});
const MONTHS = { from: "May", to: "October" };

/* smooth line that never overshoots the points (monotone curve) */
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
    title: "Who uses AI",
    hint: "Everyone gets their own key and rules. Sign-in goes through your company SSO.",
    kpi: "1,480",
    kpiNote: "AI users",
    toast: "Delta Logistics key revoked — access to every model cut off at once",
    tone: "red",
    side: {
      label: "Employees online",
      total: "1,126 today",
      line: MORNING,
      from: "8 AM",
      to: "now",
      facts: [
        { k: "SSO sign-in", v: "96%" },
        { k: "Service keys", v: "38" },
        { k: "External keys", v: "4", on: "3" },
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
                  {p.team} · key …{p.key}
                </small>
              </span>
              <span className={styles.state} data-tone={off ? "red" : p.kind === "service" ? "ink" : "green"}>
                {off ? "revoked" : p.kind === "service" ? "service" : "SSO sign-in"}
              </span>
            </li>
          );
        })}
      </ul>
    ),
  },
  data: {
    title: "What models never see",
    hint: "Personal data is swapped for placeholders before sending. Employees get answers back with their own data.",
    kpi: "1,214",
    kpiNote: "items masked today",
    toast: "Legal: SSN in a contract replaced with SSN_1 before sending",
    tone: "gold",
    side: {
      label: "Masked per day",
      total: "1,214 today",
      ...octDays(4),
      facts: [
        { k: "PII leaks", v: "0" },
        { k: "Data types", v: "14" },
        { k: "Restored in answers", v: "100%" },
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
    title: "What got blocked",
    hint: "Hidden instructions, leaked keys and confidential documents are caught before a request goes out.",
    kpi: "4",
    kpiNote: "blocked today",
    toast: "Hidden instruction in a vendor email — blocked before it reached the model",
    tone: "red",
    side: {
      label: "Blocked per day",
      total: "45 in October",
      line: [3, 2, 0, 0, 4, 2, 3, 1, 2, 0, 0, 5, 3, 2, 4, 1, 0, 0, 2, 3, 4, 3],
      from: "Oct 1",
      to: "today",
      facts: [
        { k: "Hidden instructions", v: "1", on: "2" },
        { k: "Keys and passwords", v: "1" },
        { k: "Confidential docs", v: "1" },
      ],
    },
    body: (on) => (
      <ul className={styles.rows}>
        {on && (
          <li className={styles.fresh} data-flash="">
            <span className={styles.dim}>12:44 PM</span>
            <span className={styles.main}>
              <b>Hidden instruction in a vendor email</b>
            </span>
            <span className={styles.state} data-tone="red">
              blocked
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
    title: "Which model answers",
    hint: "Simple tasks go to a fast, low-cost model, complex ones to a stronger model, confidential ones only to a local model.",
    kpi: "5",
    kpiNote: "models in use",
    toast: "Anthropic is down — requests failed over to a backup model and apps keep working",
    tone: "gold",
    side: {
      label: "Requests per day",
      total: "1.02M in October",
      ...octDays(2),
      facts: [
        { k: "Avg. response", v: "1.4 s" },
        { k: "Providers online", v: "4 of 4", on: "3 of 4" },
        { k: "Provider outages", v: "0", on: "1" },
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
                  → {sw ? <span className={styles.swap}>GPT-6 Astra · failover</span> : r.to}
                </small>
              </span>
              <span className={styles.bar} data-tone="blue" style={vars({ "--w": r.share / 46 })} />
              <span className={styles.num}>{r.share}%</span>
            </li>
          );
        })}
      </ul>
    ),
  },
  money: {
    title: "What each team spends",
    hint: "A dollar budget per team or key. At 80% the manager gets an email, at 100% requests stop.",
    kpi: usd(26_600),
    kpiNote: `of ${usd(37_500)} for October`,
    toast: "Sales hit 80% of budget — the manager got an email",
    tone: "gold",
    side: {
      label: "Spend per day",
      total: usd(26_600),
      ...octDays(5),
      facts: [
        { k: "October forecast", v: usd(36_250) },
        { k: "Teams with budgets", v: "6" },
        { k: "Manager alerts", v: "0", on: "1" },
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
                <small>{b.sum}</small>
              </span>
              <span className={styles.bar} data-tone={v >= 80 ? "gold" : "ink"} style={vars({ "--w": v / 100 })} />
              <span className={styles.num}>{v}%</span>
            </li>
          );
        })}
      </ul>
    ),
  },
  log: {
    title: "Every request, logged",
    hint: "Who, when, which model, what was masked and what it cost. The log streams to your SIEM.",
    kpi: "48,210",
    kpiNote: "requests today",
    toast: "New entries go straight to the security team’s SIEM — no manual exports",
    tone: "blue",
    side: {
      label: "Requests per day",
      total: "48,210 today",
      ...octDays(6),
      facts: [
        { k: "Employees today", v: "1,126" },
        { k: "Masked requests", v: "18%" },
        { k: "SIEM delivery", v: "real time" },
      ],
    },
    body: (on) => (
      <ul className={styles.rows}>
        {on && (
          <li className={styles.fresh} data-flash="">
            <span className={styles.dim}>12:41:18 PM</span>
            <span className={styles.main}>
              <b>Reviewer agent</b>
              <small>Claude Sonnet · no placeholders</small>
            </span>
            <span className={styles.num}>$0.02</span>
          </li>
        )}
        {LOG.slice(0, on ? 3 : 4).map((l, i) => (
          <li key={l.at} style={vars({ "--i": i })}>
            <span className={styles.dim}>{l.at}</span>
            <span className={styles.main}>
              <b>{l.who}</b>
              <small>{l.what}</small>
            </span>
            <span className={styles.num}>{l.cost}</span>
          </li>
        ))}
      </ul>
    ),
  },
  agents: {
    title: "What agents are doing",
    hint: "Each agent has a role: which systems it can reach and what it may do there. System access lasts 60 seconds.",
    kpi: "12",
    kpiNote: "agents running",
    toast: "Reviewer tried to export customers from the CRM — blocked and recorded in the audit log",
    tone: "red",
    side: {
      label: "Agent actions per hour",
      total: "8,420 today",
      line: wobble(ALLDAY, 3),
      from: "12 AM",
      to: "now",
      facts: [
        { k: "System access", v: "60 s" },
        { k: "Connected systems", v: "9" },
        { k: "Out-of-role actions", v: "0", on: "1" },
      ],
    },
    body: (on) => (
      <ul className={styles.rows}>
        {on && (
          <li className={styles.fresh} data-flash="">
            <span className={styles.dim}>12:44 PM</span>
            <span className={styles.main}>
              <b>Reviewer → customer CRM</b>
              <small>instruction from a vendor email</small>
            </span>
            <span className={styles.state} data-tone="red">
              out of role
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
              in role
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  models: {
    title: "What you pay for",
    hint: "Simple requests go to low-cost models, complex ones to stronger models. You see what each one costs.",
    kpi: usd(5_060),
    kpiNote: "API spend in October",
    toast: `Routing by complexity saved ${usd(9_640)} vs. sending everything to GPT-6 Astra`,
    tone: "gold",
    side: {
      label: "API bill by month",
      total: "−34% since May",
      line: [7_650, 6_850, 6_260, 5_650, 5_390, 5_060],
      ...MONTHS,
      facts: [
        { k: "Simple requests", v: "58%" },
        { k: "Complex requests", v: "8%" },
        { k: "Models in routing", v: "4" },
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
            <span className={styles.bar} data-tone="gold" style={vars({ "--w": m.usd / MODEL_COSTS[0].usd })} />
            <span className={styles.num}>{usd(m.usd)}</span>
          </li>
        ))}
      </ul>
    ),
  },
  report: {
    title: "Report for accounting",
    hint: "One invoice instead of AI subscriptions on personal cards — broken down by team and employee.",
    kpi: "1 invoice",
    kpiNote: "instead of 8 separate ones",
    toast: "October report exported to your ERP — finance closed the month with no expense reports",
    tone: "blue",
    side: {
      label: "Employees with access",
      total: "1,480 in October",
      line: [620, 780, 940, 1120, 1310, 1480],
      ...MONTHS,
      facts: [
        { k: "Teams in report", v: "6" },
        { k: "Format", v: "CSV, Excel" },
        { k: "Expense reports", v: "0" },
      ],
    },
    body: (on) => (
      <ul className={styles.rows}>
        {on && (
          <li className={styles.fresh} data-flash="">
            <span className={styles.main}>
              <b>ERP export · October</b>
              <small>{usd(6_400)} · 6 teams · 1,480 people</small>
            </span>
            <span className={styles.state} data-tone="blue">
              done
            </span>
          </li>
        )}
        {TEAM_REPORT.map((t, i) => (
          <li key={t.team} style={vars({ "--i": i })}>
            <span className={styles.main}>
              <b>{t.team}</b>
              <small>{t.share}% of spend</small>
            </span>
            <span className={styles.bar} data-tone="blue" style={vars({ "--w": t.share / TEAM_REPORT[0].share })} />
            <span className={styles.num}>{usd(t.usd)}</span>
          </li>
        ))}
      </ul>
    ),
  },
};

/* chart area: 300 wide, 100 tall; the line stretches to fit the block */
const PW = 300;
const PH = 100;

function SidePanel({ side, on }: { side: Side; on: boolean }) {
  /* the scale starts at half the minimum: changes stay visible, but the line never "drops to zero" */
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
          {/* "now" — a dot at the end of the line */}
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
  /* the tab opened by hand: then only its own sections cycle */
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

  /* a second after a section opens — the event */
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
      {/* the tabs sit on the window: the active one matches its header color */}
      <div className={styles.tabsRow}>
        <div className={styles.tabs} role="tablist" aria-label="The portal for each team">
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
          <b>Kordon</b>
          <span className={styles.crumb}>
            admin portal <em>/ {NAV[key].name}</em>
          </span>
        </span>
        <span className={styles.search} aria-hidden="true">
          Search by employee, key or model
        </span>
        <button
          type="button"
          className={styles.auto}
          onClick={() => setAuto((a) => !a)}
          aria-pressed={auto}
          aria-label={auto ? "Pause section autoplay" : "Turn on section autoplay"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle className={styles.ringBg} cx="12" cy="12" r="10" />
            {running && <circle key={i} className={styles.ring} cx="12" cy="12" r="10" style={vars({ "--t": `${EVERY}ms` })} />}
            <path d={auto ? "M9.5 8v8M14.5 8v8" : "M10 8l6 4-6 4z"} />
          </svg>
          {auto ? "Autoplay" : "Paused"}
        </button>
      </div>

      <div className={styles.body}>
        <nav className={styles.nav} aria-label={`${role.title.replace(/^For /, "")} sections`}>
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
