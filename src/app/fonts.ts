import { Unbounded, Wix_Madefor_Display, Wix_Madefor_Text } from "next/font/google";

/* Headings and large figures. */
export const display = Wix_Madefor_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/* Body text, UI and figures (tabular figures via font-variant-numeric: tabular-nums). */
export const text = Wix_Madefor_Text({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

/* Logo wordmark only, as in the brand book. */
export const brand = Unbounded({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-brand",
  display: "swap",
});
