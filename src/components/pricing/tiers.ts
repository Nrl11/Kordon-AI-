/* Модель лицензии из «Кордон AI — тарифы 2026». Цены на сайте не показываем. */

export const TIERS = [
  { max: 100, label: "100", fits: "первое подразделение" },
  { max: 250, label: "250", fits: "ИТ-подразделение, дочерняя компания" },
  { max: 500, label: "500", fits: "ИТ-компания, средний банк" },
  { max: 1000, label: "1 000", fits: "первая волна внедрения" },
  { max: 2000, label: "2 000", fits: "корпорация целиком — чаще всего" },
  { max: 5000, label: "5 000", fits: "крупный банк, телеком, ритейл" },
  { max: 10000, label: "10 000", fits: "федеральная компания" },
  { max: Infinity, label: "свыше", fits: "холдинг, госкорпорация — договорная" },
] as const;

export const BUFFER = 0.1;

export const MODULES = [
  { key: "guard", name: "Гардрейлы", text: "защита от инъекций, запретные темы, проверка ответов" },
  { key: "agent", name: "Периметр агента", text: "контроль маршрутов агентов: репозитории, трекеры, API" },
  { key: "closed", name: "Закрытый контур", text: "без интернета, зеркало обновлений, сверка хешей" },
  { key: "support", name: "Поддержка 24×7", text: "круглосуточно, с SLA" },
] as const;

/* ползунок в логарифмической шкале: 50 … 12 000 потребителей */
const LO = 50;
const HI = 12000;
export const toCount = (v: number) => {
  const raw = LO * Math.pow(HI / LO, v);
  const step = raw < 200 ? 10 : raw < 2000 ? 50 : 100;
  return Math.round(raw / step) * step;
};
export const toSlider = (count: number) => Math.log(count / LO) / Math.log(HI / LO);

export function tierFor(count: number) {
  return TIERS.findIndex((t) => count <= t.max);
}
