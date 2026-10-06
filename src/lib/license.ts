import type { Size } from "./lead";

/* «Получить цену» на странице стоимости передаёт выбранную конфигурацию
   в форму заявки на странице «Как начать». Это не персданные — только
   ступень и модули, поэтому их можно держать в sessionStorage. */

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
    /* хранилище недоступно — форма просто откроется без конфигурации */
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
  `ступень ${d.tier}${d.modules.length ? ` · ${d.modules.join(", ")}` : ""}`;

/* сколько сотрудников выбрать в форме по числу потребителей */
export function sizeFor(count: number): Size {
  if (count <= 100) return "до 100";
  if (count <= 500) return "100–500";
  if (count <= 2000) return "500–2 000";
  return "больше 2 000";
}
