/* Почта из поля «Пилот» на главной передаётся в форму заявки на
   странице «Как начать». В адрес страницы её не кладём — только в
   sessionStorage, и забираем один раз. */

const KEY = "kordon:pilot";

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function requestPilot(email: string) {
  try {
    sessionStorage.setItem(KEY, email.trim());
  } catch {
    /* хранилище недоступно — форма откроется пустой */
  }
}

export function takePilot(): string | null {
  try {
    const v = sessionStorage.getItem(KEY);
    if (!v) return null;
    sessionStorage.removeItem(KEY);
    return isEmail(v) ? v : null;
  } catch {
    return null;
  }
}
