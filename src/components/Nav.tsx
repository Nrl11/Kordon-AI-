"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/css";
import { CTA, NAV } from "@/lib/site";
import { Logo } from "./Logo";
import styles from "./Nav.module.css";

/* Шапка сайта: разделы, «Решения» — выпадающим списком по ролям,
   справа главное действие. На телефоне — меню по кнопке. */
export default function Nav() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // меню на телефоне
  const [drop, setDrop] = useState(false); // список «Решения»
  const dropRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* закрыть всё при переходе на другую страницу */
  const [lastPath, setLastPath] = useState(path);
  if (lastPath !== path) {
    setLastPath(path);
    setOpen(false);
    setDrop(false);
  }

  useEffect(() => {
    if (!drop) return;
    const onDown = (e: PointerEvent) => {
      if (!dropRef.current?.contains(e.target as Node)) setDrop(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrop(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [drop]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-menu", open);
    return () => document.documentElement.removeAttribute("data-menu");
  }, [open]);

  const isOn = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <header className={cx(styles.nav, (scrolled || open) && styles.scrolled)} data-open={open || undefined}>
      <div className={cx("wrap", styles.inner)}>
        <Link className={styles.brand} href="/" aria-label="Кордон AI — на главную">
          <Logo size={30} />
        </Link>

        <nav className={styles.links} aria-label="Разделы сайта">
          <ul>
            {NAV.map((l) =>
              "children" in l ? (
                <li key={l.href} ref={dropRef} className={styles.dd}>
                  <button
                    type="button"
                    className={styles.ddBtn}
                    aria-expanded={drop}
                    aria-current={isOn(l.href) ? "page" : undefined}
                    onClick={() => setDrop((d) => !d)}
                  >
                    {l.label}
                    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  <div className={styles.menu} data-open={drop || undefined}>
                    {l.children.map((c) => (
                      <Link key={c.href} href={c.href} aria-current={path === c.href ? "page" : undefined}>
                        <b>{c.label}</b>
                        <small>{c.note}</small>
                      </Link>
                    ))}
                  </div>
                </li>
              ) : (
                <li key={l.href}>
                  <Link href={l.href} aria-current={isOn(l.href) ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <Link className={cx("btn btn-primary btn-sm", styles.cta)} href={CTA.href}>
          {CTA.label}
        </Link>
        <button
          type="button"
          className={styles.burger}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          onClick={() => setOpen((o) => !o)}
        >
          <i />
          <i />
        </button>
      </div>

      {/* меню на телефоне */}
      <div id="mobile-menu" className={styles.sheet} hidden={!open}>
        <ul className="wrap">
          {NAV.map((l) =>
            "children" in l ? (
              l.children.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} aria-current={path === c.href ? "page" : undefined}>
                    {c.label}
                    <small>{c.note}</small>
                  </Link>
                </li>
              ))
            ) : (
              <li key={l.href}>
                <Link href={l.href} aria-current={isOn(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ),
          )}
          <li>
            <Link className="btn btn-primary" href={CTA.href}>
              {CTA.label} <span className="arr" aria-hidden="true">→</span>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
