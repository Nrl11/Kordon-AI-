import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./Included.module.css";

/* What the base license includes and what add-on modules bring. */

const BASE = [
  { group: "Gateway", items: ["One API for all models", "Routing by price and caching", "Cloud and local models"] },
  { group: "Access", items: ["Virtual keys", "SSO sign-in", "Access revoked through your directory"] },
  { group: "Control", items: ["PII masking", "Data classes and policies", "Budgets and audit log in your SIEM"] },
  { group: "People", items: ["Employee and admin portals", "Agent call log", "Updates and 8×5 support"] },
];

const MODULES = [
  {
    name: "Guardrails",
    text: "Defense against prompt injection and jailbreaks, blocked topics, and model answers checked before an employee sees them.",
  },
  {
    name: "Agent perimeter",
    text: "Rules for agents: which systems they may reach, with credentials issued only for the length of a call.",
  },
  {
    name: "Air-gapped",
    text: "Runs with no internet access: mirrored updates and model catalog, hash verification.",
  },
  {
    name: "24/7 support",
    text: "Around the clock with an SLA, for production workloads.",
  },
];

export default function Included() {
  return (
    <div className={styles.stage}>
      <div className={styles.base}>
        <p className={styles.head}>
          <span>Base</span>
          <small>in every license</small>
        </p>
        <div className={styles.groups}>
          {BASE.map((g) => (
            <div key={g.group}>
              <b>{g.group}</b>
              <ul className="list-check">
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Reveal className={styles.mods} threshold={0.2}>
        <p className={styles.head}>
          <span>Add-on modules</span>
          <small>as needed</small>
        </p>
        {MODULES.map((m, i) => (
          <article key={m.name} className={styles.mod} data-reveal="" style={vars({ "--i": i })}>
            <span className={styles.plus} aria-hidden="true">
              +
            </span>
            <div>
              <h3>{m.name}</h3>
              <p>{m.text}</p>
            </div>
          </article>
        ))}
      </Reveal>
    </div>
  );
}
