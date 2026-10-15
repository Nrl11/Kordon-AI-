"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, matches, REDUCED } from "@/lib/motion";

type W = Window & { __lenis?: Lenis };

/* Smooth scrolling on the shared GSAP ticker, one frame for everything. With
   reduced motion, native scrolling. On navigation to another page, jump to the top. */
export default function SmoothScroll() {
  const path = usePathname();

  useEffect(() => {
    if (matches(REDUCED)) return;
    const lenis = new Lenis({
      lerp: 0.11,
      anchors: { offset: -64 },
      stopInertiaOnNavigate: true,
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    (window as W).__lenis = lenis;
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as W).__lenis;
    };
  }, []);

  useEffect(() => {
    if (location.hash) return;
    (window as W).__lenis?.scrollTo(0, { immediate: true, force: true });
  }, [path]);

  return null;
}
