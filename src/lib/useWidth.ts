"use client";

import { useEffect, useState, type RefObject } from "react";

/* Element width, so a scene can pick its layout (wide or narrow) and draw in
   real pixels instead of stretching. */
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
