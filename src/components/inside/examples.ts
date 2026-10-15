/* Examples for the «What Kordon does with a request» scene. Every word is a
   tile. Sensitive pieces have a kind: personal data and secrets are masked
   with a placeholder; confidential data isn't masked — it simply never
   leaves the network. */

export type Kind = "pii" | "secret" | "closed";
export interface Word {
  t: string;
  kind?: Kind;
  label?: string; // label above the found piece
  token?: string; // the placeholder the model sees
  glue?: boolean; // sticks to the previous word (punctuation)
}
export interface Row {
  k: string;
  v: string;
  tone: "gold" | "blue" | "green";
}
export interface Example {
  tab: string;
  who: string;
  req: Word[];
  ans: Word[];
  rows: Row[];
  closed?: boolean;
  model: number; // which external model gets the request (unnamed on the diagram)
}

const w = (s: string): Word[] =>
  s
    .split(" ")
    .filter(Boolean)
    .map((t) => (/^[,.:;)]+$/.test(t) ? { t, glue: true } : { t }));

export const EXAMPLES: Example[] = [
  {
    tab: "Legal",
    who: "Legal",
    req: [
      ...w("Draft a demand letter to"),
      { t: "John Carter", kind: "pii", label: "name", token: "NAME_1" },
      { t: ",", glue: true },
      ...w("SSN"),
      { t: "123-45-6789", kind: "pii", label: "SSN", token: "SSN_1" },
      { t: ",", glue: true },
      ...w("$48,000 overdue"),
    ],
    ans: [
      ...w("Here is the demand letter to"),
      { t: "John Carter", kind: "pii", token: "NAME_1" },
      ...w("(SSN"),
      { t: "123-45-6789", kind: "pii", token: "SSN_1" },
      { t: "):", glue: true },
      ...w("pay $48,000 by November 1."),
    ],
    rows: [
      { k: "Data class", v: "personal data", tone: "gold" },
      { k: "Rule", v: "out only after masking", tone: "gold" },
      { k: "Team budget", v: "62% — on track", tone: "green" },
      { k: "Model", v: "external", tone: "gold" },
    ],
    model: 0,
  },
  {
    tab: "Engineering",
    who: "Engineering",
    req: [...w("Fix the deploy — it fails with key"), { t: "sk-live-8fK2xQ9v", kind: "secret", label: "API key", token: "KEY_1" }],
    ans: [...w("Key"), { t: "sk-live-8fK2xQ9v", kind: "secret", token: "KEY_1" }, ...w("has expired: rotate it and restart the pod.")],
    rows: [
      { k: "Data class", v: "secret", tone: "gold" },
      { k: "Rule", v: "keys masked before leaving", tone: "gold" },
      { k: "Key budget", v: "18% — on track", tone: "green" },
      { k: "Model", v: "external", tone: "gold" },
    ],
    model: 2,
  },
  {
    tab: "Finance",
    who: "Finance",
    req: [...w("Compare the margin in"), { t: "FY2027 model", kind: "closed", label: "confidential" }, ...w("with last year")],
    ans: w("Margin is up 3.2 points, driven by the B2B segment."),
    rows: [
      { k: "Data class", v: "confidential", tone: "blue" },
      { k: "Rule", v: "stays inside the network", tone: "blue" },
      { k: "Team budget", v: "40% — on track", tone: "green" },
      { k: "Model", v: "local", tone: "blue" },
    ],
    closed: true,
    model: 1,
  },
];

export const STEPS = ["Request", "Scan", "Masking", "Routing", "Answer"] as const;
export type Step = 0 | 1 | 2 | 3 | 4;

export function caption(step: Step, e: Example) {
  switch (step) {
    case 0:
      return "An employee writes as usual — in their chat or through the API. The request goes through Kordon.";
    case 1:
      return "Kordon reads the text and looks for personal data, keys and confidential documents.";
    case 2:
      return e.closed
        ? "Confidential data isn’t masked — it simply never leaves your network."
        : "Masking: what it finds becomes placeholders. The original stays with you.";
    case 3:
      return e.closed
        ? "Confidential data never goes to external models — the request goes to a local model inside your network."
        : "Once masked, the request can go out to an external model.";
    default:
      return e.closed
        ? "The local model answers — the request never left the company."
        : "The answer comes back with placeholders — Kordon puts the real data back.";
  }
}
