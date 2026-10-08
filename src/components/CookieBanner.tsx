"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { consentServerSnapshot, consentSnapshot, saveConsent, subscribeConsent } from "@/lib/consent";
import styles from "./CookieBanner.module.css";

/* Плашка о cookie в углу экрана: не закрывает содержимое и не мешает читать.
   Аналитические cookie — только после «Принять все». */
export default function CookieBanner() {
  const state = useSyncExternalStore(subscribeConsent, consentSnapshot, consentServerSnapshot);
  if (state !== "open") return null;
  return (
    <section className={styles.banner} aria-label="Настройки cookie">
      <p>
        Используем cookie: необходимые — для работы сайта, аналитические — только с вашего согласия.{" "}
        <Link href="/privacy#cookie">Подробнее</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className="btn btn-line btn-sm" onClick={() => saveConsent("necessary")}>
          Только необходимые
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => saveConsent("all")}>
          Принять все
        </button>
      </div>
    </section>
  );
}
