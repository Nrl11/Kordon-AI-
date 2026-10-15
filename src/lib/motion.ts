"use client";

import { useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
  /* animations run on real time: after a browser hiccup they catch up
     instead of slowing down */
  gsap.ticker.lagSmoothing(0);
}

export { gsap, useGSAP };

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const COMPACT = "(max-width: 1039px)";

export function matches(query: string) {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery(REDUCED);
export const useCompact = () => useMediaQuery(COMPACT);

/** Fonts are ready (or enough time has passed that we stop waiting). */
export function fontsReady(timeout = 1400) {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  return Promise.race([
    document.fonts.ready.then(() => undefined),
    new Promise<void>((r) => setTimeout(r, timeout)),
  ]);
}
