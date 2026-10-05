import { Unbounded, Wix_Madefor_Display, Wix_Madefor_Text } from "next/font/google";

/* Заголовки и крупные цифры. */
export const display = Wix_Madefor_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

/* Текст, интерфейс и цифры (ровные цифры — font-variant-numeric: tabular-nums). */
export const text = Wix_Madefor_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-text",
  display: "swap",
});

/* Только название в логотипе, как в брендбуке. */
export const brand = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: "600",
  variable: "--font-brand",
  display: "swap",
});
