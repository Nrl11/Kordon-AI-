/* What the first screen shows: departments inside your network, Kordon in
   the middle, AI models outside. Five requests play in a loop — each one
   shows a single gateway decision. */

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

export const DEPTS = ["Legal", "Marketing", "Finance", "Engineering", "AI agents"];
export const MODELS = ["OpenAI", "Claude", "Gemini", "Mistral"];

export const STORIES: FlowStory[] = [
  {
    from: 0,
    to: 1,
    text: ["Contract with ", { value: "Maria Lopez", token: "NAME_1" }, ", SSN ", { value: "123-45-6789", token: "SSN_1" }],
    verdict: "personal data masked",
    tone: "gold",
  },
  { from: 1, to: 2, text: ["Translate this press release into Spanish"], verdict: "simple task — cheaper model", tone: "gold" },
  { from: 2, to: "local", text: ["Financial model for 2027"], verdict: "restricted data stays inside", tone: "blue" },
  {
    from: 3,
    to: 0,
    text: ["Fix the deploy, key ", { value: "sk-live-8fK2xQ9v", token: "KEY_1" }],
    verdict: "key masked",
    tone: "gold",
  },
  { from: 4, to: "stop", text: ["2,140 requests in an hour"], verdict: "over the limit — blocked", tone: "red" },
];

export type Phase = "go" | "core" | "out" | "done";

/* step durations for one request, in seconds:
   approach to the core, pass through the core, trip to the model, hold, gap */
export const T = { in: 1.35, core: 1.15, out: 1.25, hold: 2.1, gap: 0.4 };
export const STORY_LEN = T.in + T.core + T.out + T.hold + T.gap;

export const destName = (d: Dest) => (typeof d === "number" ? MODELS[d] : d === "local" ? "Local model" : null);
