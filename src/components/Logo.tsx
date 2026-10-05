import type { CSSProperties } from "react";
import styles from "./Logo.module.css";

type Tone = "light" | "dark";

/* Знак «Периметр» по брендбуку: сетка 64×64, контур 52×52 толщиной 6
   со скруглением 12, проход 16 модулей на правой стороне, ядро — круг
   диаметром 18, канал толщиной 6 от ядра до прохода.
   Для 16–32 px толщина линий — 8 модулей. Контур графитовый, ядро золотое. */
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

/* Горизонтальный логотип: знак + «Кордон AI» (AI — латиницей, золотом).
   Расстояние от знака до названия — половина высоты знака. */
export function Logo({ size = 30, tone = "light", className }: { size?: number; tone?: Tone; className?: string }) {
  return (
    <span
      className={`${styles.logo} ${className ?? ""}`}
      data-tone={tone}
      style={{ "--s": `${size}px` } as CSSProperties}
    >
      <LogoMark size={size} tone={tone} />
      <span className={styles.word}>
        Кордон <span className={styles.ai}>AI</span>
      </span>
    </span>
  );
}
