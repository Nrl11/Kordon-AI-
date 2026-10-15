"use client";

import { usePathname } from "next/navigation";
import { STATS, starOf } from "@/lib/stats";
import styles from "./Footer.module.css";

/* Source footnotes — in the footer, only on pages whose text carries
   asterisks. Right now that's the leak numbers on the security page. */
const NOTES: Record<string, { id: string; text: string; href: string }[]> = {
  "/security": STATS.map((s, i) => ({ id: `src-${i + 1}`, text: s.source, href: s.href })),
};

export default function PageNotes() {
  const notes = NOTES[usePathname()];
  if (!notes) return null;
  return (
    <ol className={styles.notes} aria-label="Sources">
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
