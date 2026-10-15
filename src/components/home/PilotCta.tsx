import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { CTA } from "@/lib/site";
import { nb } from "@/lib/typo";
import styles from "./PilotCta.module.css";

/* The last block on the home page: the pilot. It has no form of its own —
   every request goes through the single form on the "Get started" page so
   none of them get lost. */
export default function PilotCta() {
  return (
    <section id="pilot" className={styles.band} aria-labelledby="pilot-title">
      <div className="wrap">
        <div className={styles.card}>
          <LogoMark size={64} tone="dark" thick={false} className={styles.mark} />
          <div className={styles.copy}>
            <h2 id="pilot-title">Start with a pilot</h2>
            <p>{nb("Send a short request — an engineer will get in touch to talk through your use cases and plan the pilot")}</p>
          </div>
          <Link className={`btn btn-gold ${styles.action}`} href={CTA.href}>
            Request a pilot <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
