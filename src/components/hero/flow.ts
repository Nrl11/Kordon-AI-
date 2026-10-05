/* Что показывает первый экран: отделы внутри контура, Кордон в центре,
   нейросети снаружи. По кругу идут пять запросов — на каждом видно одно
   решение шлюза. */

export type Piece = string | { value: string; token: string };
export type Dest = number | "local" | "stop";
export type Tone = "gold" | "blue" | "red";

export interface FlowStory {
  from: number;
  to: Dest;
  text: Piece[];
  verdict: string;
  tone: Tone;
}

export const DEPTS = ["Юристы", "Маркетинг", "Финансы", "Разработка", "ИИ-агенты"];
export const MODELS = ["GigaChat", "YandexGPT", "OpenAI", "Claude"];

export const STORIES: FlowStory[] = [
  {
    from: 0,
    to: 3,
    text: ["Договор с ", { value: "Ивановым И. И.", token: "ФИО_1" }, ", паспорт ", { value: "4510 123456", token: "ПАСПОРТ_1" }],
    verdict: "персданные скрыты",
    tone: "gold",
  },
  { from: 1, to: 1, text: ["Переведи пресс-релиз на английский"], verdict: "простое — в модель дешевле", tone: "gold" },
  { from: 2, to: "local", text: ["Финмодель на 2027 год"], verdict: "закрытое не выходит наружу", tone: "blue" },
  {
    from: 3,
    to: 2,
    text: ["Почини деплой, ключ ", { value: "sk-live-8fK2xQ9v", token: "КЛЮЧ_1" }],
    verdict: "ключ скрыт",
    tone: "gold",
  },
  { from: 4, to: "stop", text: ["2 140 запросов за час"], verdict: "сверх лимита — остановлено", tone: "red" },
];

export type Phase = "go" | "core" | "out" | "done";

/* длительности шагов одного запроса, секунды:
   подлёт к ядру, проход сквозь ядро, путь к модели, пауза, перерыв */
export const T = { in: 1.35, core: 1.15, out: 1.25, hold: 1.5, gap: 0.4 };
export const STORY_LEN = T.in + T.core + T.out + T.hold + T.gap;

export const destName = (d: Dest) => (typeof d === "number" ? MODELS[d] : d === "local" ? "Локальная модель" : null);
