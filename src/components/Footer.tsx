import Link from "next/link";
import { CTA, FOOTER } from "@/lib/site";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo size={34} tone="dark" />
          <p>Один шлюз ко всем нейросетям</p>
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
        <div className={styles.legal}>
          <span>© 2026 Вебпрактик</span>
          <span>Кордон AI — корпоративный ИИ-шлюз в вашем контуре</span>
        </div>
      </div>
    </footer>
  );
}
