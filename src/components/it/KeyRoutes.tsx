"use client";

import Routes, { type RGeo, type RNode, type RStep } from "@/components/scene/Routes";

/* Everyone gets their own key with rules. Requests from four keys reach
   Kordon in turn: one goes through, two stop at the gateway (wrong model,
   budget spent), and one goes only to the local model. */

const KEYS = [
  { id: "anna", note: "vk-…3f2a", title: "Anna, Legal", short: "Anna", sub: "all models · team budget" },
  { id: "ci", note: "vk-…91c0", title: "CI pipeline", short: "CI", sub: "low-cost models only" },
  { id: "delta", note: "vk-…c4d8", title: "Delta Logistics", short: "Delta", sub: "contractor · $600 a month" },
  { id: "bot", note: "vk-…7e15", title: "Support bot", short: "Bot", sub: "local models only" },
];
const MODELS = [
  { id: "strong", title: "Frontier model", short: "Frontier", sub: "cloud" },
  { id: "cheap", title: "Low-cost model", short: "Low-cost", sub: "cloud" },
  { id: "local", title: "Local model", short: "Local", sub: "in your network", kind: "local" as const },
];

const STEPS: RStep[] = [
  {
    from: "anna",
    to: "strong",
    verdict: "allowed · team budget at 62%",
    tone: "ok",
    caption: "Anna can use any model within her team's budget — the request went to the frontier model.",
  },
  {
    from: "ci",
    to: null,
    verdict: "denied 403 · frontier model not allowed",
    tone: "stop",
    caption: "The CI key is limited to low-cost models — the request for the frontier model stops at the gateway.",
  },
  {
    from: "delta",
    to: null,
    verdict: "denied 429 · monthly budget spent",
    tone: "stop",
    caption: "The contractor has used up its $600 — its requests are blocked until next month.",
  },
  {
    from: "bot",
    to: "local",
    verdict: "local model only",
    tone: "local",
    caption: "The support bot may only use the local model — the request never leaves your network.",
  },
];

/* key and model card widths — one shared width per column */
const SRC_W = 200;
const DST_W = 178;

function build(w: number): RGeo {
  if (w < 640) {
    /* top to bottom: cards in even rows of equal width */
    const h = 374;
    const gate = { x: w / 2, y: 196 };
    const sw = Math.floor((w - 24 - 18) / 4);
    const dw = Math.floor((w - 24 - 20) / 3);
    const nodes: RNode[] = [
      ...KEYS.map((k, i) => ({
        id: k.id,
        side: "src" as const,
        x: 12 + sw / 2 + i * (sw + 6),
        y: 84,
        width: sw,
        title: k.short,
        note: k.note,
      })),
      ...MODELS.map((m, i) => ({
        id: m.id,
        side: "dst" as const,
        x: 12 + dw / 2 + i * (dw + 10),
        y: 312,
        width: dw,
        title: m.short,
        kind: m.kind,
      })),
    ];
    return { w, h, vertical: true, gate, verdict: { x: w / 2, y: 236 }, nodes };
  }
  /* diagram centered in the card: keys in an even column on the left,
     models on the right, the gateway's decision under the sign, below all lines */
  const h = 380;
  const reach = Math.max(110, Math.min(190, (w - 56 - SRC_W - DST_W) / 2));
  const left = (w - (SRC_W + reach * 2 + DST_W)) / 2;
  const gx = Math.round(left + SRC_W + reach);
  const gate = { x: gx, y: 188 };
  const nodes: RNode[] = [
    ...KEYS.map((k, i) => ({
      id: k.id,
      side: "src" as const,
      x: gx - reach,
      y: 56 + i * 88,
      width: SRC_W,
      title: k.title,
      sub: k.sub,
      note: k.note,
    })),
    ...MODELS.map((m, i) => ({
      id: m.id,
      side: "dst" as const,
      x: gx + reach,
      y: 100 + i * 88,
      width: DST_W,
      title: m.title,
      sub: m.sub,
      kind: m.kind,
    })),
  ];
  return { w, h, gate, verdict: { x: gx, y: 338 }, nodes };
}

export default function KeyRoutes() {
  return <Routes build={build} steps={STEPS} label="How Kordon applies key rules" />;
}
