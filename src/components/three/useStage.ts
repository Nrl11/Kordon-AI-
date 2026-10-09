"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { matches, REDUCED } from "@/lib/motion";

/* Жизненный цикл объёмной сцены: создаётся лениво, рисуется только пока
   видна на экране, подстраивается под размер, освобождает память. */

export interface Stage {
  /** вернуть true, если нужен ещё кадр (анимация не закончилась) */
  frame: (t: number, dt: number) => boolean;
  resize: (w: number, h: number, dpr: number) => void;
  pointer?: (x: number, y: number) => void;
  dispose: () => void;
}

export interface StageCtx {
  reduced: boolean;
}

export function useStage<S extends Stage>(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  create: (canvas: HTMLCanvasElement, ctx: StageCtx) => Promise<S> | S,
) {
  const stageRef = useRef<S | null>(null);
  const kickRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const createRef = useRef(create);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    if (!canvas || !box) return;
    const reduced = matches(REDUCED);
    let disposed = false;
    let raf = 0;
    let visible = false;
    let last = 0;
    /* чёткость: не выше 1,5 — разница с 2 не видна, а пикселей вдвое меньше;
       если кадры не успевают, опускаем до 1 */
    let dprCap = 1.5;
    let slow = 0;
    let fast = 0;
    let onSlow = () => {};
    const cleanups: (() => void)[] = [];

    const loop = (now: number) => {
      raf = 0;
      const s = stageRef.current;
      if (!s || !visible || disposed) return;
      /* рисуем на частоте экрана: пропуск кадров на 120–144 Гц даёт рваный шаг */
      const raw = last ? (now - last) / 1000 : 0.016;
      const dt = Math.min(raw, 0.1);
      last = now;
      if (dprCap > 1 && raw < 0.1) {
        if (raw > 1 / 40) slow++;
        else fast++;
        if (slow + fast >= 90) {
          if (slow > 45) onSlow();
          slow = fast = 0;
        }
      }
      const more = s.frame(now / 1000, dt);
      if (more) raf = requestAnimationFrame(loop);
      else last = 0;
    };
    const kick = () => {
      if (!raf && visible && stageRef.current) raf = requestAnimationFrame(loop);
    };
    kickRef.current = kick;

    (async () => {
      let s: S;
      try {
        s = await createRef.current(canvas, { reduced });
      } catch (e) {
        console.error(e);
        if (!disposed) setFailed(true);
        return;
      }
      if (disposed) {
        s.dispose();
        return;
      }
      stageRef.current = s;
      const resize = () => {
        const w = box.clientWidth;
        const h = box.clientHeight;
        s.resize(w, h, Math.min(window.devicePixelRatio || 1, dprCap));
        kick();
      };
      onSlow = () => {
        dprCap = 1;
        resize();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(box);
      cleanups.push(() => ro.disconnect());

      const io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting;
          if (visible) kick();
        },
        { rootMargin: "120px 0px" },
      );
      io.observe(box);
      cleanups.push(() => io.disconnect());

      if (s.pointer && !reduced && window.matchMedia("(pointer: fine)").matches) {
        const onMove = (e: PointerEvent) => {
          const r = box.getBoundingClientRect();
          s.pointer!(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
          kick();
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        cleanups.push(() => window.removeEventListener("pointermove", onMove));
      }
      const onVis = () => {
        if (document.hidden) visible = false;
        else {
          const r = box.getBoundingClientRect();
          visible = r.bottom > 0 && r.top < window.innerHeight;
          kick();
        }
      };
      document.addEventListener("visibilitychange", onVis);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVis));
      setReady(true);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
      stageRef.current?.dispose();
      stageRef.current = null;
    };
  }, [canvasRef]);

  const kick = useCallback(() => kickRef.current(), []);
  return { stageRef, kick, ready, failed };
}
