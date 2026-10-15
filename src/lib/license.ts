import type { Size } from "./lead";

/* "Get a quote" on the pricing page passes the chosen configuration to the
   request form on /start. It is not personal data — just the tier and
   add-on modules — so it can live in sessionStorage. */

export interface LicenseIntent {
  count: number;
  tier: string;
  modules: string[];
}

const KEY = "kordon:license";

export function requestLicense(detail: LicenseIntent) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(detail));
  } catch {
    /* storage unavailable — the form simply opens without the configuration */
  }
}

export function takeLicense(): LicenseIntent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const d = JSON.parse(raw) as LicenseIntent;
    return typeof d.tier === "string" && Array.isArray(d.modules) ? d : null;
  } catch {
    return null;
  }
}

export const describeLicense = (d: LicenseIntent) =>
  `${d.tier} AI users${d.modules.length ? ` · ${d.modules.join(", ")}` : ""}`;

/* which company size to preselect in the form from the AI user count */
export function sizeFor(count: number): Size {
  if (count <= 100) return "Under 100";
  if (count <= 500) return "100–500";
  if (count <= 2000) return "500–2,000";
  return "Over 2,000";
}
