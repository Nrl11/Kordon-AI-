import { DEPTS, MODELS } from "./flow";

/* The floor plan of the first screen and its labels — plain numbers, no
   three.js. The page imports the labels to render them; the 3D scene
   (heroScene.ts, with three.js) loads as a separate chunk. Keeping these
   here stops three.js from landing in the page's first bundle. */

export interface HeroLabel {
  id: string;
  text: string;
  at: readonly [number, number, number];
  side: "left" | "right" | "below" | "above";
  kind: "dept" | "model" | "local" | "core" | "zone";
  index: number;
}

/* floor layout: x runs left to right, z toward the viewer; the wall sits at z = 0 */
export const WALL_X = 4.0; // half the wall length
export const OPEN = 0.68; // half the opening width
export const POST = 0.16; // arch post thickness
export const ARCH_H = 1.3; // arch height
export const WALL_H = 0.6;
export const WALL_T = 0.26;
export const DEPT_X = [-3.0, -1.5, 0, 1.5, 3.0];
export const DEPT_Z = 2.5;
export const MODEL_X = [-2.4, -0.8, 0.8, 2.4];
export const MODEL_Z = -2.75;
export const LOCAL = { x: -3.05, z: 1.05 };
export const GATE_IN = 0.85;
export const GATE_OUT = -0.85;
export const CARD_Y = 0.6;
export const BEAD_Y = 0.11;
export const CORE_Y = ARCH_H + 0.28;

export const HERO_LABELS: HeroLabel[] = [
  ...DEPTS.map((t, i) => ({
    id: `d${i}`,
    text: t,
    at: [DEPT_X[i], 0, DEPT_Z + 0.46] as const,
    side: "below" as const,
    kind: "dept" as const,
    index: i,
  })),
  ...MODELS.map((t, i) => ({
    id: `m${i}`,
    text: t,
    at: [MODEL_X[i], 0.56, MODEL_Z - 0.42] as const,
    side: "above" as const,
    kind: "model" as const,
    index: i,
  })),
  { id: "local", text: "Local model", at: [LOCAL.x, 0, LOCAL.z + 0.48], side: "below", kind: "local", index: 0 },
  { id: "core", text: "Kordon", at: [0.34, CORE_Y, 0], side: "right", kind: "core", index: 0 },
  { id: "zin", text: "Your company", at: [3.15, 0, 0.5], side: "below", kind: "zone", index: 0 },
  { id: "zout", text: "External models", at: [3.15, WALL_H, -0.35], side: "above", kind: "zone", index: 1 },
];
