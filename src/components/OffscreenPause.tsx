"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Page sections that are far off screen get data-offscreen, which pauses
   their infinite CSS animations (the rule lives in globals.css).
   JS scenes already stop on their own when they're not visible. */
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
