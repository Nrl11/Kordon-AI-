/* Cost model "Kordon AI · model spend" — the same one we use in client
   estimates: user classes, auto-routing across models from different
   vendors, three ways to pay. The subscription pool is sized by the
   five-hour limits at peak hours and by the weekly quota. List prices
   as of October 2026, USD, before tax. */

type Scen = { in: number; out: number; cached: number; service: boolean; route?: [number, number, number] };
type Tier = { id: string; n: number; active: number; req: Record<string, number>; subMix: Partial<Record<SubKey, number>> };
type SubKey = "base" | "std" | "max";
export type Model = { name: string; in: number; cached: number; out: number; tok: number; wr: number };

const P = {
  days: 21,
  reasoning: 2,
  reasonLight: 1,
  scen: {
    rag: { in: 5000, out: 400, cached: 0.15, service: true },
    chat: { in: 12000, out: 700, cached: 0.5, service: false, route: [0.5, 0.4, 0.1] },
    doc: { in: 20000, out: 1500, cached: 0.5, service: false, route: [0.2, 0.55, 0.25] },
  } as Record<string, Scen>,
  kbTokensMonth: 2e6,
  embPrice: 0.02,
  subs: { base: 20, std: 30, max: 200 } as Record<SubKey, number>,
  poolSeat: 35,
  poolReserve: 1,
  winLimits: [1000, 50, 15],
  peakShare: 0.6,
  poolUtil: 0.8,
  poolCapacity: 23.5e6,
  weekUtil: 0.6,
  cacheW: 0.082,
  quotaW: [0.05, 1, 3.3],
};

/* USD per 1M tokens, vendor list prices */
export const MODELS: Record<string, Model> = {
  gem_lite: { name: "Gemini 3.5 Flash-Lite", in: 0.3, cached: 0.03, out: 2.5, tok: 1, wr: 1 },
  gem_pro: { name: "Gemini 3.1 Pro", in: 2, cached: 0.2, out: 12, tok: 1, wr: 1 },
  astra: { name: "GPT-6 Astra", in: 10, cached: 1, out: 50, tok: 1, wr: 1.25 },
  sonnet55: { name: "Claude Sonnet 5.5", in: 2, cached: 0.2, out: 10, tok: 1.6, wr: 1.25 },
  opus55: { name: "Claude Opus 5.5", in: 4, cached: 0.2, out: 20, tok: 1.6, wr: 1.25 },
  fable51: { name: "Claude Fable 5.1", in: 10, cached: 0.25, out: 50, tok: 1.6, wr: 1.25 },
};
/* which model can be picked as the strongest */
export const TOP_MODELS = ["astra", "fable51", "opus55", "gem_pro"] as const;
export type TopModel = (typeof TOP_MODELS)[number];

/* three user classes; for 150 people that is 30, 75 and 45 */
function tiers(n: number): Tier[] {
  const hi = Math.round(n * 0.2);
  const mid = Math.round(n * 0.5);
  return [
    { id: "hi", n: hi, active: 0.95, req: { rag: 10, chat: 30, doc: 20 }, subMix: { max: 1 / 3, std: 2 / 3 } },
    { id: "mid", n: mid, active: 0.85, req: { rag: 5, chat: 10, doc: 5 }, subMix: { std: 1 } },
    { id: "lo", n: Math.max(0, n - hi - mid), active: 0.6, req: { rag: 2, chat: 2, doc: 1 }, subMix: { base: 1 } },
  ];
}

/* USD per request */
function reqCost(m: Model, s: Scen, reasoning = 1) {
  const tin = s.in * m.tok;
  const tout = s.out * m.tok * reasoning;
  const c = s.cached;
  return (tin * (1 - c) * m.in * m.wr + tin * c * m.cached + tout * m.out) / 1e6;
}
/* effective tokens of one request against the subscription's weekly quota */
function effTok(s: Scen, reasoning: number) {
  return s.in * (1 - s.cached) + P.cacheW * s.in * s.cached + s.out * reasoning;
}

export type CostResult = {
  api: number; // pay-as-you-go API, with Kordon routing
  apiDirect: number; // pay-as-you-go API, everything sent to the strongest model
  subs: number; // a subscription for every user
  pool: number; // shared pool
  seats: number; // seats in the pool
  people: number;
};

export function computeCost(people: number, top: TopModel): CostResult {
  const T = tiers(people);
  const lv = [MODELS.gem_lite, MODELS.sonnet55, MODELS[top]];
  const reas = [P.reasonLight, P.reasoning, P.reasoning];
  let service = 0;
  let inter = 0;
  let direct = 0;
  let poolEff = 0;
  let winLoad = 0;
  for (const t of T) {
    const udays = t.n * t.active * P.days;
    for (const [sid, s] of Object.entries(P.scen)) {
      const r = (t.req[sid] || 0) * udays;
      if (!r) continue;
      if (s.service) {
        service += r * reqCost(MODELS.gem_lite, s, 1);
        continue;
      }
      direct += r * reqCost(MODELS[top], s, P.reasoning);
      s.route!.forEach((sh, k) => {
        const rk = r * sh;
        if (!rk) return;
        inter += rk * reqCost(lv[k], s, reas[k]);
        poolEff += rk * effTok(s, reas[k]) * P.quotaW[k];
        winLoad += ((rk / P.days) * P.peakShare) / P.winLimits[k];
      });
    }
  }
  const common = service + (P.kbTokensMonth * P.embPrice) / 1e6;
  const subCost = (t: Tier) => Object.entries(t.subMix).reduce((a, [k, sh]) => a + (sh ?? 0) * P.subs[k as SubKey], 0);
  const subs = common + T.reduce((a, t) => a + t.n * subCost(t), 0);
  const weeklyEff = poolEff / (P.days / 5);
  const accWindow = Math.ceil(winLoad / P.poolUtil);
  const accWeek = Math.ceil(weeklyEff / (P.poolCapacity * P.weekUtil));
  const seats = Math.max(accWindow, accWeek) + P.poolReserve;
  return {
    api: common + inter,
    apiDirect: common + direct,
    subs,
    pool: common + seats * P.poolSeat,
    seats,
    people,
  };
}
