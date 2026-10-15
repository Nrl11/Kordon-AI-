/* Cookie consent. The choice is stored in localStorage and in the
   kordon_consent cookie (so the server can see it too). Analytics, if added,
   start only on "all", via the kordon:consent event. */

export type Consent = "all" | "necessary";

const KEY = "kordon-consent";
const listeners = new Set<() => void>();
/* fallback in case browser storage is unavailable */
let memo: Consent | "" = "";
/* banner reopened by hand from the footer */
let reopened = false;

function read(): Consent | "" {
  try {
    const v = localStorage.getItem(KEY);
    return v === "all" || v === "necessary" ? v : memo;
  } catch {
    return memo;
  }
}

const emit = () => listeners.forEach((l) => l());

export function subscribeConsent(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** "open" means show the banner; otherwise, the choice already made */
export const consentSnapshot = (): Consent | "open" => {
  const v = read();
  return reopened || !v ? "open" : v;
};
export const consentServerSnapshot = (): Consent | "open" | "ssr" => "ssr";

export function getConsent(): Consent | "" {
  return read();
}

export function saveConsent(v: Consent) {
  memo = v;
  reopened = false;
  try {
    localStorage.setItem(KEY, v);
  } catch {}
  try {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `kordon_consent=${v}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  } catch {}
  window.dispatchEvent(new CustomEvent("kordon:consent", { detail: v }));
  emit();
}

export function reopenConsent() {
  reopened = true;
  emit();
}
