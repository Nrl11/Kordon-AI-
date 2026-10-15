import type { CSSProperties } from "react";
import styles from "./Logo.module.css";

type Tone = "light" | "dark";

/* The «Perimeter» mark per the brand book: a 64×64 grid, a 52×52 contour 6
   units thick with a 12 radius, a 16-unit passage on the right side, a core
   circle 18 across, a 6-unit channel from the core to the passage.
   At 16–32 px lines are 8 units thick. Graphite contour, gold core. */
export function LogoMark({
  size = 32,
  tone = "light",
  thick = size <= 32,
  className,
}: {
  size?: number;
  tone?: Tone;
  thick?: boolean;
  className?: string;
}) {
  const w = thick ? 8 : 6;
  const core = "var(--gold)";
  const contour = tone === "dark" ? "var(--on-ink)" : "currentColor";
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M58 24V18a12 12 0 0 0-12-12H18A12 12 0 0 0 6 18v28a12 12 0 0 0 12 12h28a12 12 0 0 0 12-12v-6"
        stroke={contour}
        strokeWidth={w}
        strokeLinecap="round"
      />
      <path d="M32 32H59" stroke={core} strokeWidth={w} strokeLinecap="round" />
      <circle cx="32" cy="32" r="9" fill={core} />
    </svg>
  );
}

/* Horizontal logo: the mark + «Kordon AI» (AI in gold).
   The gap between the mark and the name is half the mark's height. */
export function Logo({ size = 30, tone = "light", className }: { size?: number; tone?: Tone; className?: string }) {
  return (
    <span
      className={`${styles.logo} ${className ?? ""}`}
      data-tone={tone}
      style={{ "--s": `${size}px` } as CSSProperties}
    >
      <LogoMark size={size} tone={tone} />
      <span className={styles.word}>
        Kordon <span className={styles.ai}>AI</span>
      </span>
    </span>
  );
}
