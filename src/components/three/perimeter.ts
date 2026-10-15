import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

/* The "Perimeter" mark in 3D. The brand book's 64×64 grid mapped to scene
   space: 1 unit = 0.1. The core center is the origin.
   Contour centerline: a 52 square with a 12 corner radius, line thickness 6,
   a 16-unit gap on the right side; core Ø18; a channel from the core to the gap. */

export const A = 2.6; // half the contour side, along the centerline
export const R = 1.2; // corner radius, along the centerline
export const HALF = 0.3; // half the line thickness
export const GAP = 0.8; // contour ends at the gap: y = ±0.8
export const CORE_R = 0.9;
export const CHANNEL_END = 2.7;

/** The contour as a closed shape: outer edge, end cap, inner edge, end cap.
    h is half the thickness before the bevel (the bevel adds its own). */
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

/** Channel: a strip from the core to the gap with a round end. */
export function channelShape(h: number) {
  const s = new THREE.Shape();
  s.moveTo(0, -h);
  s.lineTo(CHANNEL_END, -h);
  s.absarc(CHANNEL_END, 0, h, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(0, h);
  s.lineTo(0, -h);
  return s;
}

/** Centered rectangle with rounded corners. */
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

/** Extrusion with a rounded bevel, centered in depth.
    Normals are smoothed across the bevel and the rounded corners, but the
    front faces stay flat; otherwise streaks show on the dark lacquer. */
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
