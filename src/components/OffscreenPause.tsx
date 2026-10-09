"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Секции страницы, ушедшие далеко за экран, помечаются data-offscreen —
   их бесконечные CSS-анимации встают на паузу (правило в globals.css).
   JS-сцены и так останавливаются сами, когда их не видно. */
export default function OffscreenPause() {
  const path = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.removeAttribute("data-offscreen");
          else e.target.setAttribute("data-offscreen", "");
        }),
      { rootMargin: "200px 0px" },
    );
    document.querySelectorAll("main section").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [path]);

  return null;
}
