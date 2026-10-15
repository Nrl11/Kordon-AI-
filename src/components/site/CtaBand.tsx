import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { CTA } from "@/lib/site";
import { nb, noDot } from "@/lib/typo";
import styles from "./site.module.css";

/* Last block of a page: what's next and one button. */
export default function CtaBand({
  title = "Estimate savings on your AI traffic",
  text = "An engineer reviews how you connect to models and sets up a test environment in your network — before you buy",
  action = CTA.label,
}: {
  title?: string;
  text?: string;
  action?: string;
}) {
  return (
    <section className={styles.ctaBand} aria-label="Next step">
      <div className="wrap">
        <div className={styles.ctaCard}>
          <LogoMark size={64} tone="dark" thick={false} className={styles.ctaMark} />
          <div>
            <h2 className={styles.ctaTitle}>{title}</h2>
            <p className={styles.ctaText}>{nb(noDot(text))}</p>
          </div>
          <Link className="btn btn-gold" href={CTA.href}>
            {action} <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
