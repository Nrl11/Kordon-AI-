import type { CSSProperties } from "react";

/** Инлайновые CSS-переменные: vars({ "--v": 0.5 }) */
export const vars = (o: Record<`--${string}`, string | number>) => o as CSSProperties;

export const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(" ");
