"use client";

import { reopenConsent } from "@/lib/consent";

/* a footer link: open the cookie choice again */
export default function ConsentLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={reopenConsent}>
      Cookie settings
    </button>
  );
}
