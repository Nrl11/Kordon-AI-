/* Согласие на cookie. Выбор хранится в localStorage и в cookie
   kordon_consent (чтобы его видел и сервер). Аналитику, если её подключат,
   запускают только при «all» — по событию kordon:consent. */

export type Consent = "all" | "necessary";

const KEY = "kordon-consent";
const listeners = new Set<() => void>();
/* запасной вариант, если хранилище браузера недоступно */
let memo: Consent | "" = "";
/* баннер открыт руками из подвала */
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

/** «open» — показать баннер, иначе — сделанный выбор */
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
