/* Сколько компания тратит на ИИ в месяц и сколько вернёт шлюз.
   Два рычага, которые не пересекаются:
   — подписки: шлюз видит, кому не нужен дорогой тариф, — их переводят на базовый;
   — запросы к API: простое уходит на дешёвые модели, повторы — из кэша. */

export const PRICE = { senior: 18000, base: 2000 } as const;
export const ROUTE_CHEAPER = 10; // во сколько раз дешевле модель для простых задач

export interface Inputs {
  people: number; // сотрудников с ИИ
  seniorShare: number; // доля на дорогом тарифе
  api: number; // расходы на API в месяц, ₽
  needSenior: number; // из них дорогой тариф реально нужен
  simple: number; // доля простых задач среди запросов к API
  cache: number; // доля повторных запросов
}

export const DEFAULTS: Inputs = {
  people: 500,
  seniorShare: 0.25,
  api: 1_400_000,
  needSenior: 0.4,
  simple: 0.4,
  cache: 0.15,
};

export function bill(i: Inputs) {
  const seniors = Math.round(i.people * i.seniorShare);
  const subs = seniors * PRICE.senior + (i.people - seniors) * PRICE.base;
  const moved = Math.round(seniors * (1 - i.needSenior));
  const subsSaved = moved * (PRICE.senior - PRICE.base);

  const cacheSaved = i.api * i.cache;
  const simpleSpend = (i.api - cacheSaved) * i.simple; // простые запросы сейчас
  const routeSaved = simpleSpend * (1 - 1 / ROUTE_CHEAPER);
  const apiSaved = cacheSaved + routeSaved;

  const before = subs + i.api;
  const after = before - subsSaved - apiSaved;
  return {
    seniors,
    moved,
    subs,
    api: i.api,
    subsAfter: subs - subsSaved,
    apiAfter: i.api - apiSaved,
    subsSaved,
    apiSaved,
    cacheSaved,
    routeSaved,
    simpleSpend,
    before,
    after,
    year: (before - after) * 12,
    share: before > 0 ? (before - after) / before : 0,
  };
}

export type Bill = ReturnType<typeof bill>;
