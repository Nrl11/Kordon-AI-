"use client";

import Routes, { type RGeo, type RNode, type RStep } from "@/components/scene/Routes";

/* У каждого — свой ключ с правилами. Запросы от четырёх ключей по очереди
   приходят в Кордон: один проходит, два останавливаются на шлюзе (не та
   модель, кончился лимит), один уходит только в локальную модель. */

const KEYS = [
  { id: "anna", note: "vk-…3f2a", title: "Анна, юрист", short: "Анна", sub: "все модели · лимит отдела" },
  { id: "ci", note: "vk-…91c0", title: "CI-пайплайн", short: "CI", sub: "только дешёвые модели" },
  { id: "delta", note: "vk-…c4d8", title: "Подрядчик «Дельта»", short: "«Дельта»", sub: "50 тыс. ₽ в месяц" },
  { id: "bot", note: "vk-…7e15", title: "Бот поддержки", short: "Бот", sub: "только локальные модели" },
];
const MODELS = [
  { id: "strong", title: "Сильная модель", short: "Сильная", sub: "облако" },
  { id: "cheap", title: "Дешёвая модель", short: "Дешёвая", sub: "облако" },
  { id: "local", title: "Локальная модель", short: "Локальная", sub: "в вашем контуре", kind: "local" as const },
];

const STEPS: RStep[] = [
  {
    from: "anna",
    to: "strong",
    verdict: "пропущено · лимит отдела 62 %",
    tone: "ok",
    caption: "Анне доступны все модели в пределах лимита отдела — запрос ушёл в сильную модель.",
  },
  {
    from: "ci",
    to: null,
    verdict: "отказ 403 · сильная модель не положена",
    tone: "stop",
    caption: "Ключу CI разрешены только дешёвые модели — запрос к сильной остановлен на шлюзе.",
  },
  {
    from: "delta",
    to: null,
    verdict: "отказ 429 · лимит месяца исчерпан",
    tone: "stop",
    caption: "Подрядчик израсходовал 50 тыс. ₽ — до конца месяца его запросы не пройдут.",
  },
  {
    from: "bot",
    to: "local",
    verdict: "только локальная модель",
    tone: "local",
    caption: "Боту поддержки разрешена только локальная модель — запрос не выходит из контура.",
  },
];

/* ширина карточек ключей и моделей — у каждой колонки своя, общая */
const SRC_W = 200;
const DST_W = 178;

function build(w: number): RGeo {
  if (w < 640) {
    /* сверху вниз: карточки ровными рядами одной ширины */
    const h = 374;
    const gate = { x: w / 2, y: 196 };
    const sw = Math.floor((w - 24 - 18) / 4);
    const dw = Math.floor((w - 24 - 20) / 3);
    const nodes: RNode[] = [
      ...KEYS.map((k, i) => ({
        id: k.id,
        side: "src" as const,
        x: 12 + sw / 2 + i * (sw + 6),
        y: 84,
        width: sw,
        title: k.short,
        note: k.note,
      })),
      ...MODELS.map((m, i) => ({
        id: m.id,
        side: "dst" as const,
        x: 12 + dw / 2 + i * (dw + 10),
        y: 312,
        width: dw,
        title: m.short,
        kind: m.kind,
      })),
    ];
    return { w, h, vertical: true, gate, verdict: { x: w / 2, y: 236 }, nodes };
  }
  /* схема по центру карточки: ключи — ровной колонкой слева, модели —
     справа, решение шлюза — под знаком, ниже всех линий */
  const h = 380;
  const reach = Math.max(110, Math.min(190, (w - 56 - SRC_W - DST_W) / 2));
  const left = (w - (SRC_W + reach * 2 + DST_W)) / 2;
  const gx = Math.round(left + SRC_W + reach);
  const gate = { x: gx, y: 188 };
  const nodes: RNode[] = [
    ...KEYS.map((k, i) => ({
      id: k.id,
      side: "src" as const,
      x: gx - reach,
      y: 56 + i * 88,
      width: SRC_W,
      title: k.title,
      sub: k.sub,
      note: k.note,
    })),
    ...MODELS.map((m, i) => ({
      id: m.id,
      side: "dst" as const,
      x: gx + reach,
      y: 100 + i * 88,
      width: DST_W,
      title: m.title,
      sub: m.sub,
      kind: m.kind,
    })),
  ];
  return { w, h, gate, verdict: { x: gx, y: 338 }, nodes };
}

export default function KeyRoutes() {
  return <Routes build={build} steps={STEPS} label="Как Кордон применяет правила ключей" />;
}
