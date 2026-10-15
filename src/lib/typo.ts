import type { ReactNode } from "react";

/* Light typography for strings: a dash never starts a line, and one- or
   two-letter words («a», «to», «AI») don't hang at the end of a line. */
const NB = " ";

export function nb(s: string) {
  let out = s.replace(/ — /g, `${NB}— `);
  /* twice — to catch short words in a row («is a», «to an») */
  for (let k = 0; k < 2; k++) out = out.replace(/(^|[\s(“])([A-Za-z]{1,2}) /g, `$1$2${NB}`);
  return out;
}

export const typo = (n: ReactNode) => (typeof n === "string" ? nb(n) : n);

/* subheading under h1/h2: no trailing period (an ellipsis stays) */
export const noDot = (s: string) => s.replace(/(?<!\.)\.\s*$/, "");
export const sub = (n: ReactNode) => (typeof n === "string" ? nb(noDot(n)) : n);
