/* Одинаковое форматирование на сервере и в браузере (без Intl, чтобы не было
   расхождений гидрации из-за разных пробелов-разделителей). */

const NBSP = " ";

export function num(n: number) {
  const sign = n < 0 ? "−" : "";
  const s = Math.round(Math.abs(n)).toString();
  return sign + s.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export function rub(n: number) {
  return `${num(n)}${NBSP}₽`;
}

/** 24 100 000 → «24,1 млн ₽» */
export function rubShort(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1e6) {
    const v = abs / 1e6;
    const s = (v >= 100 ? Math.round(v).toString() : v.toFixed(1)).replace(".", ",").replace(/,0$/, "");
    return `${sign}${s}${NBSP}млн${NBSP}₽`;
  }
  if (abs >= 1e3) return `${sign}${num(abs / 1e3)}${NBSP}тыс.${NBSP}₽`;
  return `${sign}${num(abs)}${NBSP}₽`;
}

export function pct(n: number) {
  return `${Math.round(n * 100)}${NBSP}%`;
}
