import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import { nb } from "@/lib/typo";
import styles from "./Compliance.module.css";

/* What auditors ask for — and how Kordon covers it. At the bottom of each
   card — the log record that backs it up during an audit. */

const ROWS = [
  {
    doc: "CCPA, CPRA and GDPR",
    about: "Customer and employee personal data in prompts to AI models",
    how: "Personal data is replaced with placeholders before a request reaches an external model",
    proof: "NAME_1, PHONE_1 instead of real data",
    at: "10:42 AM",
    tone: "mask",
  },
  {
    doc: "HIPAA and PCI DSS",
    about: "Health records and cardholder data",
    how: "Patient records go only to a local model, and card numbers are masked",
    proof: "patient chart → local model",
    at: "12:05 PM",
    tone: "local",
  },
  {
    doc: "SOC 2 audits",
    about: "Access control and event logging",
    how: "A log of every request, export to your SIEM, access revoked through your directory",
    proof: "record #52107 → SIEM",
    at: "12:41 PM",
    tone: "log",
  },
];

export default function Compliance() {
  return (
    <div className={styles.wrap}>
      <Reveal className={styles.cards} threshold={0.2}>
        {ROWS.map((r, i) => (
          <article key={r.doc} className={styles.card} data-reveal="" style={vars({ "--i": i })}>
            <h3 className={styles.doc}>{r.doc}</h3>
            <p className={styles.about}>{nb(r.about)}</p>
            <p className={styles.how}>{nb(r.how)}</p>
            <p className={styles.proof} data-t={r.tone}>
              <span>What auditors see</span>
              <b>
                <time>{r.at}</time> {r.proof}
              </b>
            </p>
          </article>
        ))}
      </Reveal>
      <p className={styles.note}>We map the requirements to your environment together with your security team — masking rules and policies adapt to local laws and languages.</p>
    </div>
  );
}
