import Link from "next/link";
import { CONTACTS, CTA, FOOTER, LEGAL, PRIVACY } from "@/lib/site";
import { Logo } from "./Logo";
import PageNotes from "./PageNotes";
import ConsentLink from "./ConsentLink";
import styles from "./Footer.module.css";

/* Подвал: слева — знак, контакты и кнопка; справа — карта сайта;
   внизу — реквизиты, политика и настройки cookie. */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo size={34} tone="dark" />
          <p>Один шлюз ко всем нейросетям</p>
          <address className={styles.contacts}>
            <a className={styles.phone} href={`tel:${CONTACTS.tel}`}>
              {CONTACTS.phone}
            </a>
            <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
            <span>{CONTACTS.address}</span>
          </address>
          <Link className="btn btn-primary btn-sm" href={CTA.href}>
            {CTA.label} <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
        <nav className={styles.cols} aria-label="Карта сайта">
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className={styles.colTitle}>{col.title}</p>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith("http") ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <PageNotes />
        <div className={styles.legal}>
          <span>
            © 2026 {LEGAL.name} · {`ИНН ${LEGAL.inn}`} · {`ОГРН ${LEGAL.ogrn}`}
          </span>
          <span className={styles.legalLinks}>
            <Link href={PRIVACY.href}>{PRIVACY.label}</Link>
            <ConsentLink className={styles.legalBtn} />
          </span>
        </div>
      </div>
    </footer>
  );
}
