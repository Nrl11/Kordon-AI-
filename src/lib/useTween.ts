"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./motion";

/** Плавно «докручивает» число к новому значению (для итогов и счётчиков). */
export function useTween(value: number, ms = 650) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduce) return;
    const a = from.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const v = a + (value - a) * (1 - Math.pow(1 - k, 3));
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms, reduce]);

  return reduce ? value : shown;
}
