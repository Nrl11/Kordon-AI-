"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, matches, REDUCED } from "@/lib/motion";

type W = Window & { __lenis?: Lenis };

/* Плавная прокрутка, синхронная с ScrollTrigger. При сниженной анимации —
   обычная нативная прокрутка. При переходе на другую страницу — сразу наверх. */
export default function SmoothScroll() {
  const path = usePathname();

  useEffect(() => {
    if (matches(REDUCED)) return;
    const lenis = new Lenis({
      lerp: 0.11,
      anchors: { offset: -64 },
      stopInertiaOnNavigate: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
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
    ScrollTrigger.refresh();
  }, [path]);

  return null;
}

/** Прокрутка к якорю с учётом Lenis (для кнопок, а не ссылок). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as W).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -64 });
  else el.scrollIntoView({ behavior: matches(REDUCED) ? "auto" : "smooth", block: "start" });
}
