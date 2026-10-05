import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

/* Знак «Периметр» в объёме. Сетка брендбука 64×64 переведена в мир сцены:
   1 модуль = 0,1. Центр ядра — начало координат.
   Осевая линия контура — квадрат 52 со скруглением 12, толщина линии 6,
   проход 16 модулей на правой стороне; ядро Ø18; канал от ядра до прохода. */

export const A = 2.6; // половина стороны контура по осевой линии
export const R = 1.2; // радиус скругления по осевой линии
export const HALF = 0.3; // половина толщины линии
export const GAP = 0.8; // концы контура у прохода: y = ±0,8
export const CORE_R = 0.9;
export const CHANNEL_END = 2.7;

/** Контур как замкнутая фигура: внешний край, торец, внутренний край, торец.
    h — половина толщины до фаски (фаска добавит своё). */
export function contourShape(h: number) {
  const c = A - R;
  const ro = R + h;
  const ri = R - h;
  const xo = A + h;
  const xi = A - h;
  const s = new THREE.Shape();
  s.moveTo(xo, GAP);
  s.lineTo(xo, c);
  s.absarc(c, c, ro, 0, Math.PI / 2, false);
  s.lineTo(-c, xo);
  s.absarc(-c, c, ro, Math.PI / 2, Math.PI, false);
  s.lineTo(-xo, -c);
  s.absarc(-c, -c, ro, Math.PI, 1.5 * Math.PI, false);
  s.lineTo(c, -xo);
  s.absarc(c, -c, ro, 1.5 * Math.PI, 2 * Math.PI, false);
  s.lineTo(xo, -GAP);
  s.absarc(A, -GAP, h, 0, Math.PI, false);
  s.lineTo(xi, -c);
  s.absarc(c, -c, ri, 0, -Math.PI / 2, true);
  s.lineTo(-c, -xi);
  s.absarc(-c, -c, ri, -Math.PI / 2, -Math.PI, true);
  s.lineTo(-xi, c);
  s.absarc(-c, c, ri, Math.PI, Math.PI / 2, true);
  s.lineTo(c, xi);
  s.absarc(c, c, ri, Math.PI / 2, 0, true);
  s.lineTo(xi, GAP);
  s.absarc(A, GAP, h, Math.PI, 2 * Math.PI, false);
  return s;
}

/** Канал: полоса от ядра до прохода с круглым торцом. */
export function channelShape(h: number) {
  const s = new THREE.Shape();
  s.moveTo(0, -h);
  s.lineTo(CHANNEL_END, -h);
  s.absarc(CHANNEL_END, 0, h, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(0, h);
  s.lineTo(0, -h);
  return s;
}

/** Прямоугольник со скруглёнными углами по центру. */
export function roundedRect(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const rr = Math.min(r, w / 2, h / 2);
  const s = new THREE.Shape();
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rr);
  s.lineTo(x + w, y + h - rr);
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  s.lineTo(x + rr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rr);
  s.lineTo(x, y + rr);
  s.quadraticCurveTo(x, y, x + rr, y);
  return s;
}

/** Выдавливание со скруглённой фаской, отцентрованное по глубине.
    Нормали сглажены по фаске и скруглениям, но лицевые грани остаются
    плоскими — иначе на тёмном лаке видны разводы. */
export function extrude(shape: THREE.Shape, depth: number, bevel: number, curveSegments = 48) {
  const core = Math.max(depth - 2 * bevel, 0.001);
  const raw = new THREE.ExtrudeGeometry(shape, {
    depth: core,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 8,
    curveSegments,
  });
  raw.translate(0, 0, -core / 2);
  const g = toCreasedNormals(raw, 0.6);
  raw.dispose();

  const pos = g.getAttribute("position");
  const nor = g.getAttribute("normal");
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    if (Math.abs(n.z) > 0.999) {
      const z = Math.sign(n.z);
      for (let k = 0; k < 3; k++) nor.setXYZ(i + k, 0, 0, z);
    }
  }
  nor.needsUpdate = true;
  return g;
}
