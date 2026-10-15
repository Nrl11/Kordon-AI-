import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./ServiceTrack.module.css";

/* How working with us goes, in order: a pilot before purchase, launch,
   support. A gold line runs through the stages left to right; under each,
   what we do. */

const STAGES = [
  {
    when: "Before you buy",
    title: "Pilot",
    text: "We review how your models are connected, deploy Kordon and run your own data through it.",
  },
  {
    when: "Rollout",
    title: "Production launch",
    text: "SSO, SIEM export, high availability, admin training.",
  },
  {
    when: "Operations",
    title: "Support",
    text: "Updates, advice and incident reviews: 8×5 in the base license, 24/7 as an add-on module.",
  },
];

export default function ServiceTrack() {
  return (
    <Reveal className={styles.track} threshold={0.25}>
      <span className={styles.line} aria-hidden="true">
        <i />
      </span>
      <ol className={styles.stages}>
        {STAGES.map((s, i) => (
          <li key={s.title} data-reveal="" style={vars({ "--i": i })}>
            <span className={styles.node} aria-hidden="true" />
            <small>{s.when}</small>
            <h3 className={styles.stageTitle}>{s.title}</h3>
            <p>{nb(s.text)}</p>
          </li>
        ))}
      </ol>
      <p className={styles.capex}>
        <b>For CAPEX</b> — a perpetual license: you buy it outright, and updates and support come as a separate
        subscription.
      </p>
    </Reveal>
  );
}
