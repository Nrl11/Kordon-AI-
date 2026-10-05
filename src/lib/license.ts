import type { Size } from "./pilot";

/* «Получить цену» в блоке лицензии передаёт выбранную конфигурацию в форму заявки. */

export interface LicenseIntent {
  count: number;
  tier: string;
  modules: string[];
}

const EVENT = "kordon:license";

export function requestLicense(detail: LicenseIntent) {
  window.dispatchEvent(new CustomEvent<LicenseIntent>(EVENT, { detail }));
}

export function onLicense(cb: (d: LicenseIntent) => void) {
  const h = (e: Event) => cb((e as CustomEvent<LicenseIntent>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
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
