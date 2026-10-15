"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { matches, REDUCED } from "./motion";

/* A scene that steps through its states on its own while on screen.
   It pauses when the pointer or focus is inside, when off screen, and with
   "reduce motion" (then steps change only by hand). */
export function useCycle<T extends HTMLElement = HTMLDivElement>(
  count: number,
  every: number | ((i: number) => number),
  enabled = true,
) {
  const ref = useRef<T>(null);
  const [i, setI] = useState(0);
  const [live, setLive] = useState(false);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting && !matches(REDUCED)), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ms = typeof every === "function" ? every(i) : every;
  useEffect(() => {
    if (!live || hold || !enabled) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % count), ms);
    return () => window.clearTimeout(t);
  }, [i, live, hold, enabled, count, ms]);

  /* pause handlers are separate from ref so they can be spread in markup */
  const pause = {
    onPointerEnter: () => setHold(true),
    onPointerLeave: () => setHold(false),
    onFocus: () => setHold(true),
    onBlur: (e: FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
    },
  };
  const bind = { ref, ...pause };

  return { i, setI, live, running: live && !hold && enabled, bind, pause, ref };
}
