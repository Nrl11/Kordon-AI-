"use client";

import { usePathname } from "next/navigation";
import { STATS, starOf } from "@/lib/stats";
import styles from "./Footer.module.css";

/* Сноски с источниками — в подвале, только на тех страницах, где в тексте
   стоят звёздочки. Сейчас это цифры об утечках на странице безопасности. */
const NOTES: Record<string, { id: string; text: string; href: string }[]> = {
  "/security": STATS.map((s, i) => ({ id: `src-${i + 1}`, text: s.source, href: s.href })),
};

export default function PageNotes() {
  const notes = NOTES[usePathname()];
  if (!notes) return null;
  return (
    <ol className={styles.notes} aria-label="Источники">
      {notes.map((n, i) => (
        <li key={n.id} id={n.id}>
          <span aria-hidden="true">{starOf(i)}</span>
          <a href={n.href} target="_blank" rel="noopener noreferrer">
            {n.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
