import Link from "next/link";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

const LINKS = [
  { href: "/#how", label: "Как работает" },
  { href: "/#economics", label: "Экономика" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#path", label: "Как начать" },
  { href: "/#pilot", label: "Пилот" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo size={34} tone="dark" />
          <p>Защита, которая окупает себя</p>
        </div>
        <nav aria-label="Разделы сайта">
          <ul className={styles.links}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.legal}>
          <span>© 2026 Вебпрактик</span>
          <Link href="/privacy">Политика обработки персональных данных</Link>
        </div>
      </div>
    </footer>
  );
}
