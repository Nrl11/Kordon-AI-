"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import styles from "./Nav.module.css";

const LINKS = [
  { id: "how", label: "Как работает" },
  { id: "rules", label: "Возможности" },
  { id: "economics", label: "Экономика" },
  { id: "pricing", label: "Тарифы" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    document.querySelectorAll("main > section[id]").forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`wrap ${styles.inner}`}>
        <a className={styles.brand} href="#top" aria-label="Кордон AI — в начало страницы">
          <Logo size={30} />
        </a>
        <nav className={styles.links} aria-label="Разделы">
          <ul>
            {LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} aria-current={active === l.id ? "true" : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="btn btn-primary btn-sm" href="#pilot">
          Пилот 60 дней
        </a>
      </div>
    </header>
  );
}
