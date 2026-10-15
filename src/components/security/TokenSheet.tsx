import Reveal from "@/components/ui/Reveal";
import { vars } from "@/lib/css";
import styles from "./TokenSheet.module.css";

/* What Kordon finds in text, as a sheet of placeholders: what was written and
   which placeholder the model got instead. Placeholders flip in on reveal. */

const TYPES = [
  { token: "NAME_1", what: "Name", raw: "Anna M. Ross" },
  { token: "SSN_1", what: "SSN", raw: "123-45-6789" },
  { token: "LICENSE_1", what: "Driver’s license", raw: "CA D1234567" },
  { token: "PHONE_1", what: "Phone", raw: "(415) 555-0142" },
  { token: "EMAIL_1", what: "Email", raw: "a.ross@example.com" },
  { token: "ADDRESS_1", what: "Address", raw: "212 Pine St, Apt 4" },
  { token: "CARD_1", what: "Card", raw: "4111 1111 1111 1111" },
  { token: "KEY_1", what: "Key or token", raw: "sk-proj-Q7mWx2Lr…" },
];

export default function TokenSheet() {
  return (
    <div className={styles.wrap}>
      <Reveal className={styles.sheet} threshold={0.25}>
        {TYPES.map((t, i) => (
          <div key={t.token} className={styles.cell} style={vars({ "--i": i })}>
            <span className={styles.what}>{t.what}</span>
            <s className={styles.raw}>{t.raw}</s>
            <span className={styles.token}>{t.token}</span>
          </div>
        ))}
      </Reveal>
      <ul className={styles.notes}>
        <li>
          <b>Local laws and languages.</b> Masking and policies adapt to each market. In the US: CCPA and HIPAA,
          English and Spanish, SSN, ITIN and driver’s license formats.
        </li>
        <li>
          <b>Encodings.</b> Base64, hex and URL encoding are decoded before the check — a key in a config won’t slip
          through.
        </li>
        <li>
          <b>Reversible.</b> Placeholders last for the conversation: the employee gets the answer back with their own
          data.
        </li>
      </ul>
    </div>
  );
}
