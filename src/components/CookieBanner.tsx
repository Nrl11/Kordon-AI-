"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { consentServerSnapshot, consentSnapshot, saveConsent, subscribeConsent } from "@/lib/consent";
import styles from "./CookieBanner.module.css";

/* The cookie notice in the corner: it never covers content or gets in the way.
   Analytics cookies only after «Accept all». */
export default function CookieBanner() {
  const state = useSyncExternalStore(subscribeConsent, consentSnapshot, consentServerSnapshot);
  if (state !== "open") return null;
  return (
    <section className={styles.banner} aria-label="Cookie settings">
      <p>
        We use cookies: necessary ones to run the site, analytics only with your consent.{" "}
        <Link href="/privacy#cookie">Learn more</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className="btn btn-line btn-sm" onClick={() => saveConsent("necessary")}>
          Necessary only
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => saveConsent("all")}>
          Accept all
        </button>
      </div>
    </section>
  );
}
