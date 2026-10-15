import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./DataClasses.module.css";

/* Data classes and where they may go. Columns show how far from the company
   the model sits: local in your network, approved providers, any model. A
   class's bar reaches the farthest model allowed to see it: the stricter the
   class, the shorter the path. The security team sets these rules itself. */

const ZONES = [
  { t: "Local model", s: "in your network" },
  { t: "Approved providers", s: "under enterprise contracts" },
  { t: "Any model", s: "including non-US providers" },
];

const CLASSES = [
  { t: "Public data", s: "press releases, articles, open-source code", reach: 3, how: "sent as is" },
  { t: "Personal data", s: "names, SSNs, phone numbers, card numbers", reach: 3, how: "placeholders only" },
  { t: "Internal documents", s: "policies, email threads, reports", reach: 2, how: "approved providers only" },
  { t: "Trade secrets", s: "financial models, deals, files marked confidential", reach: 1, how: "stays in your network" },
];

export default function DataClasses() {
  return (
    <Reveal className={styles.board} threshold={0.25}>
      <div className={styles.head} aria-hidden="true">
        <span />
        <div className={styles.zones}>
          {ZONES.map((z) => (
            <span key={z.t} className={styles.zone}>
              <b>{z.t}</b>
              <small>{z.s}</small>
            </span>
          ))}
        </div>
      </div>
      <ul className={styles.rows}>
        {CLASSES.map((c, i) => (
          <li key={c.t} style={vars({ "--i": i })}>
            <div className={styles.name}>
              <b>{c.t}</b>
              <small>{c.s}</small>
            </div>
            <div className={styles.lane} style={vars({ "--reach": c.reach })} data-reach={c.reach}>
              <span className={styles.bar}>
                <em>{c.how}</em>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className={styles.note}>Your security team sets the classes and rules in the portal, without going through IT.</p>
    </Reveal>
  );
}
