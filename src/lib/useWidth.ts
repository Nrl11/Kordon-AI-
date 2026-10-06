"use client";

import { useEffect, useState, type RefObject } from "react";

/* Ширина элемента — чтобы сцена выбирала свою раскладку (широкую или узкую)
   и рисовалась в пикселях, а не растягивалась. */
export function useWidth(ref: RefObject<HTMLElement | null>, initial = 760) {
  const [w, setW] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}
