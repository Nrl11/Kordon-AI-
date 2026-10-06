"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";
import { matches, REDUCED } from "./motion";

/* Сцена, которая сама листает свои шаги, пока видна на экране.
   Пауза — когда курсор или фокус внутри, вне экрана и при «уменьшить
   движение» (тогда шаги переключаются только руками). */
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

  /* обработчики паузы отдельно от ref — их можно раздать в разметке */
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
