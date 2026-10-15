/* Same formatting on the server and in the browser (no Intl, so hydration
   never mismatches on locale-specific separators). US style: 1,480 · $2,640. */

export function num(n: number) {
  const sign = n < 0 ? "−" : "";
  const s = Math.round(Math.abs(n)).toString();
  return sign + s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** whole dollars: 2640 → «$2,640» */
export function usd(n: number) {
  const sign = n < 0 ? "−" : "";
  return `${sign}$${num(Math.abs(n))}`;
}

/** 24 100 000 → «$24.1M», 12 400 → «$12.4K» */
export function usdShort(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  const short = (v: number) => (v >= 100 ? Math.round(v).toString() : v.toFixed(1).replace(/\.0$/, ""));
  if (abs >= 1e6) return `${sign}$${short(abs / 1e6)}M`;
  if (abs >= 1e3) return `${sign}$${short(abs / 1e3)}K`;
  return `${sign}$${num(abs)}`;
}

export function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}
