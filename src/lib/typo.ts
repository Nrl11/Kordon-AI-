import type { ReactNode } from "react";

/* Русская типографика для строк: тире не начинает строку, короткие
   предлоги и союзы не висят в конце строки. */
const NB = " ";

export function nb(s: string) {
  let out = s.replace(/ — /g, `${NB}— `);
  /* дважды — чтобы поймать подряд идущие короткие слова («и в», «а не») */
  for (let k = 0; k < 2; k++) out = out.replace(/(^|[\s(«])([А-Яа-яЁё]{1,2}) /g, `$1$2${NB}`);
  /* «152-ФЗ» не рвётся на дефисе */
  out = out.replace(/(\d)-([А-ЯЁ]{1,4})/g, "$1‑$2");
  /* и «ИИ-агенты» не рвутся после «ИИ» */
  out = out.replace(/(^|[\s(«])ИИ-/g, "$1ИИ‑");
  return out;
}

export const typo = (n: ReactNode) => (typeof n === "string" ? nb(n) : n);

/* подзаголовок под h1/h2: без точки в конце (многоточие оставляем) */
export const noDot = (s: string) => s.replace(/(?<!\.)\.\s*$/, "");
export const sub = (n: ReactNode) => (typeof n === "string" ? nb(noDot(n)) : n);
