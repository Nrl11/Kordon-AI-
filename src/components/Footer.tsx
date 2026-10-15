import Link from "next/link";
import { CTA, FOOTER, LEGAL, PRIVACY } from "@/lib/site";
import { Logo } from "./Logo";
import PageNotes from "./PageNotes";
import ConsentLink from "./ConsentLink";
import styles from "./Footer.module.css";

/* Footer: the mark, one line and the button on the left; the site map on the
   right; at the bottom — the company name, the privacy policy and cookie settings. */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo size={34} tone="dark" />
          <p>One gateway to every AI model</p>
          <Link className="btn btn-primary btn-sm" href={CTA.href}>
            {CTA.label} <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
        <nav className={styles.cols} aria-label="Site map">
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className={styles.colTitle}>{col.title}</p>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <PageNotes />
        <div className={styles.legal}>
          <span>© 2026 {LEGAL.name}</span>
          <span className={styles.legalLinks}>
            <Link href={PRIVACY.href}>{PRIVACY.label}</Link>
            <ConsentLink className={styles.legalBtn} />
          </span>
        </div>
      </div>
    </footer>
  );
}
