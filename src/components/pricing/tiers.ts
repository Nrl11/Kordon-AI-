/* License model from "Kordon AI — pricing 2026". No prices on the site. */

export const TIERS = [
  { max: 100, label: "100", fits: "First department" },
  { max: 250, label: "250", fits: "IT department or subsidiary" },
  { max: 500, label: "500", fits: "Tech company, mid-size bank" },
  { max: 1000, label: "1,000", fits: "First rollout wave" },
  { max: 2000, label: "2,000", fits: "Entire enterprise — the most common choice" },
  { max: 5000, label: "5,000", fits: "Large bank, telecom, retailer" },
  { max: 10000, label: "10,000", fits: "Nationwide enterprise" },
  { max: Infinity, label: "10,000+", fits: "Conglomerate — terms by agreement" },
] as const;

export const BUFFER = 0.1;

export const MODULES = [
  { key: "guard", name: "Guardrails", text: "prompt-injection defense, blocked topics, answer checks" },
  { key: "agent", name: "Agent perimeter", text: "controls where agents go: repos, trackers, APIs" },
  { key: "closed", name: "Air-gapped", text: "no internet, update mirror, hash checks" },
  { key: "support", name: "24/7 support", text: "around the clock, with an SLA" },
] as const;

/* logarithmic slider: 50 … 12,000 AI users */
const LO = 50;
const HI = 12000;
export const toCount = (v: number) => {
  const raw = LO * Math.pow(HI / LO, v);
  const step = raw < 200 ? 10 : raw < 2000 ? 50 : 100;
  return Math.round(raw / step) * step;
};
export const toSlider = (count: number) => Math.log(count / LO) / Math.log(HI / LO);

export function tierFor(count: number) {
  return TIERS.findIndex((t) => count <= t.max);
}
