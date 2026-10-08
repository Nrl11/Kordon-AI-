"use client";

import { reopenConsent } from "@/lib/consent";

/* ссылка в подвале: снова открыть выбор cookie */
export default function ConsentLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={reopenConsent}>
      Настройки cookie
    </button>
  );
}
