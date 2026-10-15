import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { extrude, roundedRect } from "@/components/three/perimeter";
import { clamp01, createRenderer, damp, easeOut, inOut, keyLight, seg, shadowCatcher, softStudio } from "@/components/three/studio";
import type { Stage } from "@/components/three/useStage";
import { DEPTS, STORIES, STORY_LEN, T, type Phase } from "./flow";
import {
  ARCH_H,
  BEAD_Y,
  CARD_Y,
  CORE_Y,
  DEPT_X,
  DEPT_Z,
  GATE_IN,
  GATE_OUT,
  HERO_LABELS,
  LOCAL,
  MODEL_X,
  MODEL_Z,
  OPEN,
  POST,
  WALL_H,
  WALL_T,
  WALL_X,
} from "./heroLayout";

/* The first screen is a literal cordon. We stand inside the company:
   departments in the foreground, the perimeter wall across the frame,
   external models behind it. The wall has one opening — the Kordon arch with
   a gold core on top. Request documents travel from departments to the arch;
   a membrane in the opening scans them: personal data on the chip turns into
   a gold placeholder and the request goes out, restricted data turns toward
   the local model inside, a request over the limit bounces back. Underneath
   runs a steady background stream. */

export interface LabelState {
  x: number;
  y: number;
  on: boolean;
  hide: boolean;
}

export interface HeroScene extends Stage {
  labels: LabelState[];
  setPaused: (v: boolean) => void;
}

const V = (x: number, z: number, y = 0) => new THREE.Vector3(x, y, z);

/* polyline on the floor with lengths: a point by distance traveled */
class Path {
  pts: THREE.Vector3[];
  acc: number[];
  len: number;
  constructor(pts: THREE.Vector3[]) {
    this.pts = pts;
    this.acc = [0];
    for (let i = 1; i < pts.length; i++) this.acc.push(this.acc[i - 1] + pts[i].distanceTo(pts[i - 1]));
    this.len = this.acc[this.acc.length - 1];
  }
  at(s: number, out: THREE.Vector3, tan?: THREE.Vector3) {
    const d = Math.max(0, Math.min(this.len, s));
    let i = 1;
    while (i < this.acc.length - 1 && this.acc[i] < d) i++;
    const a = this.pts[i - 1];
    const b = this.pts[i];
    const span = this.acc[i] - this.acc[i - 1] || 1;
    out.lerpVectors(a, b, (d - this.acc[i - 1]) / span);
    if (tan) tan.subVectors(b, a).normalize();
    return out;
  }
}

const quad = (a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, n = 40) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return V(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.z + 2 * u * t * c.z + t * t * b.z);
  });
const line = (a: THREE.Vector3, b: THREE.Vector3, n = 12) =>
  Array.from({ length: n + 1 }, (_, i) => new THREE.Vector3().lerpVectors(a, b, i / n));

/** The arch is an upside-down "U" in the XY plane, open at the bottom. */
function archShape(open: number, post: number, height: number, r: number) {
  const s = new THREE.Shape();
  const xo = open + post;
  const ro = r + post;
  const yi = height - post;
  s.moveTo(-xo, 0);
  s.lineTo(-xo, height - ro);
  s.absarc(-xo + ro, height - ro, ro, Math.PI, Math.PI / 2, true);
  s.lineTo(xo - ro, height);
  s.absarc(xo - ro, height - ro, ro, Math.PI / 2, 0, true);
  s.lineTo(xo, 0);
  s.lineTo(open, 0);
  s.lineTo(open, yi - r);
  s.absarc(open - r, yi - r, r, 0, Math.PI / 2, false);
  s.lineTo(-open + r, yi);
  s.absarc(-open + r, yi - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-open, 0);
  s.lineTo(-xo, 0);
  return s;
}

export function createHeroScene(
  canvas: HTMLCanvasElement,
  opts: { reduced: boolean; onPhase: (story: number, phase: Phase) => void },
): HeroScene {
  const renderer = createRenderer(canvas, true);
  const scene = new THREE.Scene();
  const env = softStudio(renderer);
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 200);
  const key = keyLight(scene, 1.15, true);
  key.position.set(-4, 11, 8);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe5f2, 0.45));

  const trash: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => (trash.push(g), g);

  /* ——— materials: dark navy satin, gold for the core, porcelain for documents ——— */
  const satin = keep(
    new THREE.MeshPhysicalMaterial({ color: "#17213b", roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.05 }),
  );
  const gold = keep(new THREE.MeshPhysicalMaterial({ color: "#ecbd59", metalness: 1, roughness: 0.22, envMapIntensity: 1.25 }));
  const goldSoft = keep(new THREE.MeshPhysicalMaterial({ color: "#e8b650", metalness: 1, roughness: 0.32, envMapIntensity: 1.1 }));
  const porcelain = keep(
    new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.45,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
      emissive: "#ffffff",
      emissiveIntensity: 0.16,
    }),
  );
  const modelMat = keep(
    new THREE.MeshPhysicalMaterial({ color: "#26304a", roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 0.9 }),
  );
  const localMat = keep(
    new THREE.MeshPhysicalMaterial({ color: "#2a47d6", roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 0.9 }),
  );
  const blueRing = keep(new THREE.MeshBasicMaterial({ color: "#7c93f2" }));
  const textLine = keep(new THREE.MeshBasicMaterial({ color: "#e6eaf3" }));
  const navyLine = keep(new THREE.MeshBasicMaterial({ color: "#8d98b3" }));
  const bead = {
    pii: keep(new THREE.MeshPhysicalMaterial({ color: "#e0453a", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 })),
    clean: keep(new THREE.MeshPhysicalMaterial({ color: "#3a4767", roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 })),
    gold: keep(new THREE.MeshPhysicalMaterial({ color: "#efc061", metalness: 1, roughness: 0.2, envMapIntensity: 1.2 })),
    blue: keep(new THREE.MeshPhysicalMaterial({ color: "#3b5bea", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 })),
  };

  /* ——— floor: soft shadow and the company zone in front of the wall ——— */
  const floor = shadowCatcher(0.13);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  trash.push(floor.geometry, floor.material as THREE.Material);

  const zoneD = DEPT_Z + 0.85 - 0.18;
  const zone = new THREE.Mesh(
    keep(new THREE.ShapeGeometry(roundedRect(WALL_X * 2, zoneD, 0.45), 24)),
    keep(new THREE.MeshBasicMaterial({ color: "#edf1fd" })),
  );
  zone.rotation.x = -Math.PI / 2;
  zone.position.set(0, 0.002, 0.18 + zoneD / 2);
  scene.add(zone);

  /* ——— perimeter wall and the Kordon arch ——— */
  const segLen = WALL_X - (OPEN + POST);
  const wallGeo = keep(new RoundedBoxGeometry(segLen, WALL_H, WALL_T, 4, 0.08));
  for (const sgn of [-1, 1]) {
    const w = new THREE.Mesh(wallGeo, satin);
    w.position.set(sgn * (OPEN + POST + segLen / 2), WALL_H / 2, 0);
    w.castShadow = true;
    scene.add(w);
  }
  const arch = new THREE.Mesh(keep(extrude(archShape(OPEN, POST, ARCH_H, 0.26), 0.46, 0.05, 32)), satin);
  arch.castShadow = true;
  scene.add(arch);
  /* gold trim inside the opening */
  scene.add(new THREE.Mesh(keep(extrude(archShape(OPEN - 0.03, 0.03, ARCH_H - POST + 0.03, 0.26), 0.5, 0.012, 32)), goldSoft));

  /* scanning membrane: a gold scanner band sweeps from top to bottom */
  const memH = ARCH_H - POST - 0.04;
  const memUni = {
    uScan: { value: 1 },
    uOn: { value: 0 },
    uColor: { value: new THREE.Color("#f0c96d") },
  };
  const membrane = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(OPEN * 2 - 0.08, memH)),
    keep(
      new THREE.ShaderMaterial({
        uniforms: memUni,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: [
          "uniform float uScan; uniform float uOn; uniform vec3 uColor; varying vec2 vUv;",
          "void main(){",
          "  float band = exp(-pow((vUv.y - uScan) * 7.0, 2.0));",
          "  float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);",
          "  float lines = 0.7 + 0.3 * step(0.5, fract(vUv.y * 46.0));",
          "  float a = uOn * (0.08 + 0.55 * band) * edge * lines;",
          "  gl_FragColor = vec4(uColor, a);",
          "}",
        ].join("\n"),
      }),
    ),
  );
  membrane.position.set(0, memH / 2 + 0.01, 0);
  scene.add(membrane);

  /* core above the arch and the scanning rings */
  const core = new THREE.Mesh(keep(new THREE.SphereGeometry(0.23, 64, 48)), gold);
  core.position.set(0, CORE_Y, 0);
  core.castShadow = true;
  scene.add(core);
  const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(0.36, 0.012, 12, 96)), gold);
  const ring2 = new THREE.Mesh(keep(new THREE.TorusGeometry(0.42, 0.007, 10, 96)), goldSoft);
  ring.position.copy(core.position);
  ring2.position.copy(core.position);
  ring.visible = ring2.visible = false;
  scene.add(ring, ring2);

  /* a ring on the floor where the request ends its trip: gold — accepted by a
     model, blue — stayed inside the network, red — returned to the sender */
  const landMat = keep(new THREE.MeshBasicMaterial({ color: "#e0b04a", transparent: true, opacity: 0, depthWrite: false }));
  const landRing = new THREE.Mesh(keep(new THREE.RingGeometry(0.34, 0.4, 72)), landMat);
  landRing.rotation.x = -Math.PI / 2;
  landRing.visible = false;
  scene.add(landRing);

  /* ——— departments, external models, local model ——— */
  const padGeo = keep(new THREE.CylinderGeometry(0.36, 0.38, 0.08, 48));
  const padRingGeo = keep(new THREE.TorusGeometry(0.31, 0.014, 8, 64));
  DEPT_X.forEach((x) => {
    const p = new THREE.Mesh(padGeo, porcelain);
    p.position.set(x, 0.04, DEPT_Z);
    p.castShadow = true;
    scene.add(p);
    const r = new THREE.Mesh(padRingGeo, blueRing);
    r.rotation.x = Math.PI / 2;
    r.position.set(x, 0.081, DEPT_Z);
    scene.add(r);
  });
  const modelGeo = keep(new RoundedBoxGeometry(0.7, 0.52, 0.7, 4, 0.1));
  const studGeo = keep(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 32));
  const modelStuds: THREE.Mesh[] = [];
  MODEL_X.forEach((x) => {
    const m = new THREE.Mesh(modelGeo, modelMat);
    m.position.set(x, 0.26, MODEL_Z);
    m.castShadow = true;
    scene.add(m);
    const s = new THREE.Mesh(studGeo, goldSoft);
    s.position.set(x, 0.53, MODEL_Z);
    scene.add(s);
    modelStuds.push(s);
  });
  const local = new THREE.Mesh(keep(new RoundedBoxGeometry(0.76, 0.64, 0.76, 4, 0.1)), localMat);
  local.position.set(LOCAL.x, 0.32, LOCAL.z);
  local.castShadow = true;
  scene.add(local);
  const localStud = new THREE.Mesh(studGeo, porcelain);
  localStud.position.set(LOCAL.x, 0.655, LOCAL.z);
  scene.add(localStud);

  /* ——— paths on the floor ——— */
  const gin = V(0, GATE_IN);
  const gout = V(0, GATE_OUT);
  const inPts = DEPT_X.map((x) => quad(V(x, DEPT_Z - 0.45), V(x * 0.42, 1.75), gin));
  const thruPts = line(gin, gout);
  const outPts = MODEL_X.map((x) => quad(gout, V(x * 0.35, -2.0), V(x, MODEL_Z + 0.45)));
  const localPts = quad(gin, V(-1.5, 1.0), V(LOCAL.x + 0.5, LOCAL.z));

  const lineMats: LineMaterial[] = [];
  const flowMats: LineMaterial[] = [];
  const makeLine = (pts: THREE.Vector3[], color: string, width: number, opacity: number, dashed = false) => {
    const g = new LineGeometry();
    g.setPositions(pts.flatMap((p) => [p.x, 0.012, p.z]));
    const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false, dashed, dashSize: 0.09, gapSize: 0.1 });
    lineMats.push(m);
    if (dashed) flowMats.push(m);
    trash.push(g, m);
    const l = new Line2(g, m);
    l.computeLineDistances();
    scene.add(l);
    return { line: l, geo: g, segs: pts.length - 1 };
  };
  inPts.forEach((p) => {
    makeLine(p, "#2a47d6", 1, 0.18);
    makeLine(p, "#2a47d6", 1.6, 0.5, true);
  });
  makeLine(thruPts, "#c99731", 1.6, 0.6, true);
  makeLine(localPts, "#2a47d6", 1, 0.18);
  makeLine(localPts, "#2a47d6", 1.6, 0.5, true);
  outPts.forEach((p) => {
    makeLine(p, "#c99731", 1, 0.3);
    makeLine(p, "#c99731", 1.7, 0.8, true);
  });
  const hiIn = inPts.map((p) => makeLine(p, "#2a47d6", 3, 1));
  const hiLocal = makeLine(localPts, "#2a47d6", 3, 1);
  const hiOut = outPts.map((p) => makeLine(p, "#b8861f", 3, 1));
  const hiStop = inPts.map((p) => makeLine(p, "#d93a2f", 3, 1));
  const allHi = [...hiIn, hiLocal, ...hiOut, ...hiStop];
  const draw = (h: (typeof allHi)[number], k: number) => {
    const n = Math.round(h.segs * clamp01(k));
    h.line.visible = n > 0;
    h.geo.instanceCount = n;
  };
  allHi.forEach((h) => draw(h, 0));

  const inLen = inPts.map((p) => new Path(p).len);
  const thruPath = new Path(thruPts);
  const thruLen = thruPath.len;

  /* ——— background stream: evenly spaced beads ———
     before the arch: red — the request has personal data, dark — clean;
     past the arch: gold — sent out after masking, blue — stayed with the
     local model. All move at one speed and pass the arch on schedule, so
     they never bunch up. */
  const SPEED = 1.05;
  const GAP = 0.72;
  const DESTS: (number | "local")[] = [3, 0, "local", 2, 1, 3, 0, 1, "local", 2];
  const PII = [1, 0, 1, 1, 0, 1, 0];
  const mod = (n: number, m: number) => ((n % m) + m) % m;
  const routes = DEPT_X.map((_, from) =>
    [0, 1, 2, 3, "local" as const].map((dest) =>
      dest === "local"
        ? new Path([...inPts[from], ...localPts.slice(1)])
        : new Path([...inPts[from], ...thruPts.slice(1), ...outPts[dest].slice(1)]),
    ),
  );
  const routeFor = (from: number, dest: number | "local") => routes[from][dest === "local" ? 4 : dest];
  const HEAD = Math.max(...inLen) / SPEED;
  const TAIL = Math.max(...routes.flatMap((r, from) => r.map((p) => p.len - inLen[from]))) / SPEED;
  const beadGeo = keep(new THREE.SphereGeometry(0.07, 24, 16));
  const beads = Array.from({ length: 22 }, () => {
    const m = new THREE.Mesh(beadGeo, bead.clean);
    m.visible = false;
    scene.add(m);
    return m;
  });

  /* ——— featured request: a dark document with a personal data chip ———
     dark rather than white, so it reads at once against the light floor
     and the glowing membrane */
  const CW = 1.0;
  const CH = 0.64;
  const lead = new THREE.Group();
  const card = new THREE.Mesh(keep(extrude(roundedRect(CW, CH, 0.09), 0.06, 0.016, 10)), satin);
  lead.add(card);
  const tLine = keep(new THREE.PlaneGeometry(0.56, 0.045));
  const lt1 = new THREE.Mesh(tLine, textLine);
  lt1.position.set(-0.1, 0.17, 0.032);
  const lt2 = new THREE.Mesh(tLine, navyLine);
  lt2.position.set(-0.16, 0.07, 0.032);
  lt2.scale.x = 0.8;
  lead.add(lt1, lt2);
  const BAR_X = 0.14;
  const bar = new THREE.Group();
  bar.position.set(BAR_X, -0.12, 0.045);
  const barGeo = keep(extrude(roundedRect(0.48, 0.16, 0.045), 0.016, 0.004, 6));
  const barFront = new THREE.Mesh(barGeo, bead.pii);
  barFront.position.z = 0.008;
  const barBack = new THREE.Mesh(barGeo, gold);
  barBack.position.z = -0.008;
  bar.add(barFront, barBack);
  lead.add(bar);
  lead.visible = false;
  scene.add(lead);

  /* only static objects cast shadows — walls, arch, departments and models —
     so the shadow map is computed once, not every frame */
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  /* featured request path: from the department to the arch, then through it to
     a model or to the local one. On the way to the local model the document
     stops beside it, then rises and lands on top without clipping the box */
  const localLeadPts = quad(gin, V(-1.35, 1.0), V(LOCAL.x + 1.1, LOCAL.z));
  const leadPath = STORIES.map((s) => {
    const pin = inPts[s.from];
    if (s.to === "stop") return new Path(pin);
    if (s.to === "local") return new Path([...pin, ...localLeadPts.slice(1)]);
    return new Path([...pin, ...thruPts.slice(1), ...outPts[s.to].slice(1)]);
  });

  /* ——— camera: the scene frame fits the canvas, a lens shift centers it ——— */
  /* the frame follows the real edges: wall ends, core, models and departments with their labels */
  const corners = [
    ...[-1, 1].flatMap((sx) => [
      new THREE.Vector3(sx * (WALL_X + 0.1), 0, 0.2),
      new THREE.Vector3(sx * (WALL_X + 0.1), WALL_H, -0.15),
      new THREE.Vector3(sx * (MODEL_X[3] + 0.4), 0.95, MODEL_Z - 0.55),
      new THREE.Vector3(sx * (DEPT_X[4] + 0.5), 0, DEPT_Z + 0.8),
      new THREE.Vector3(sx * WALL_X, 0, DEPT_Z + 0.85),
    ]),
    new THREE.Vector3(0, CORE_Y + 0.42, 0),
  ];
  const target = new THREE.Vector3(0, 0.35, -0.1);
  const fit = { dist: 14, sx: 0, sy: 0 };
  const DEG = Math.PI / 180;
  const place = (yaw: number, pitch: number, dist: number) => {
    camera.position.set(
      target.x + dist * Math.sin(yaw * DEG) * Math.cos(pitch * DEG),
      target.y + dist * Math.sin(pitch * DEG),
      target.z + dist * Math.cos(yaw * DEG) * Math.cos(pitch * DEG),
    );
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };
  const tmp = new THREE.Vector3();
  const box = () => {
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const c of corners) {
      tmp.copy(c).project(camera);
      x0 = Math.min(x0, tmp.x);
      x1 = Math.max(x1, tmp.x);
      y0 = Math.min(y0, tmp.y);
      y1 = Math.max(y1, tmp.y);
    }
    return { x0, x1, y0, y1 };
  };
  const refit = (aspect: number, yaw: number, pitch: number) => {
    camera.aspect = aspect;
    let d = fit.dist;
    for (let i = 0; i < 8; i++) {
      place(yaw, pitch, d);
      const b = box();
      const s = Math.max((b.x1 - b.x0) / 1.9, (b.y1 - b.y0) / 1.86);
      d *= 1 + (s - 1) * 0.9;
    }
    place(yaw, pitch, d);
    const b = box();
    fit.dist = d;
    fit.sx = (b.x0 + b.x1) / 2;
    fit.sy = (b.y0 + b.y1) / 2;
  };

  /* ——— state ——— */
  let width = 1;
  let height = 1;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  let paused = false;
  let clock = 0;
  let story = -1;
  let storyT0 = 0;
  let lastPhase: Phase | null = null;
  let base = { yaw: 0, pitch: 47 };
  const v = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const labels: LabelState[] = HERO_LABELS.map(() => ({ x: 0, y: 0, on: false, hide: false }));

  function updateFlows(t: number) {
    let used = 0;
    for (let n = Math.ceil((t - TAIL) / GAP); n <= Math.floor((t + HEAD) / GAP) && used < beads.length; n++) {
      const from = mod(n, DEPTS.length);
      const dest = DESTS[mod(n, DESTS.length)];
      const path = routeFor(from, dest);
      const L = inLen[from];
      const s = L + (t - n * GAP) * SPEED;
      if (s < 0 || s > path.len) continue;
      const m = beads[used++];
      path.at(s, m.position);
      m.position.y = BEAD_Y;
      const pii = PII[mod(n, PII.length)] === 1;
      m.material = s < L ? (pii ? bead.pii : bead.clean) : dest === "local" ? bead.blue : pii ? bead.gold : bead.clean;
      let k = Math.min(1, s / 0.24, (path.len - s) / 0.24);
      if (lead.visible) {
        const dx = m.position.x - lead.position.x;
        const dz = m.position.z - lead.position.z;
        k *= clamp01((Math.hypot(dx, dz) - 0.46) / 0.3);
      }
      m.visible = k > 0.01;
      m.scale.setScalar(Math.max(0.0001, k));
    }
    for (let i = used; i < beads.length; i++) beads[i].visible = false;
  }

  function updateStory(t: number) {
    if (story < 0 || t - storyT0 >= STORY_LEN) {
      story = (story + 1) % STORIES.length;
      storyT0 = t;
      lastPhase = null;
    }
    const s = STORIES[story];
    const e = t - storyT0;
    const phase: Phase = e < T.in ? "go" : e < T.in + T.core ? "core" : e < T.in + T.core + T.out ? "out" : "done";
    if (phase !== lastPhase) {
      lastPhase = phase;
      opts.onPhase(story, phase);
    }
    const stop = s.to === "stop";
    const toLocal = s.to === "local";
    const masked = s.text.some((p) => typeof p !== "string");
    const fade = 1 - seg(e, STORY_LEN - T.gap - 0.35, STORY_LEN - T.gap);
    const path = leadPath[story];
    const L = inLen[s.from];

    /* where the document is: approaching the arch, passing through it, heading
       to the model, and finally landing: it rises above the destination and
       eases down into it while a ring spreads across the floor */
    const eOut = T.in + T.core + T.out;
    const dest = toLocal
      ? { x: LOCAL.x, z: LOCAL.z, top: 0.66 }
      : typeof s.to === "number"
        ? { x: MODEL_X[s.to], z: MODEL_Z, top: 0.55 }
        : { x: DEPT_X[s.from], z: DEPT_Z, top: 0.09 };
    let d: number;
    let grow = 1;
    let y = CARD_Y;
    let shrink = 1;
    let bank = 1;
    const kIn = inOut(seg(e, 0.05, T.in));
    const kCore = seg(e, T.in, T.in + T.core);
    /* when the document lands and when the floor ring plays */
    let landAt = eOut;
    if (e < T.in) {
      d = 0.1 + kIn * (L - 0.1);
      grow = 0.45 + 0.55 * Math.min(1, kIn * 1.6);
      path.at(d, lead.position, tan);
    } else if (stop) {
      /* hits the membrane, shakes "no" and returns to its department */
      const hit = seg(e, T.in, T.in + 0.35);
      const back = inOut(seg(e, T.in + 0.8, T.in + 2.1));
      d = L - Math.sin(Math.PI * hit) * 0.14 - back * (L - 0.12);
      path.at(d, lead.position, tan);
      const sh = seg(e, T.in + 0.3, T.in + 0.8);
      lead.position.x += Math.sin(sh * Math.PI * 6) * 0.05 * (1 - sh);
      bank = 0;
      landAt = T.in + 2.1;
    } else if (toLocal) {
      /* enters the arch for a check, comes back out and turns to the local model */
      if (e < T.in + T.core) thruPath.at(Math.sin(Math.PI * kCore) * 0.34, lead.position, tan);
      else path.at(L + (path.len - L) * inOut(seg(e, T.in + T.core, eOut)), lead.position, tan);
    } else if (e < T.in + T.core) {
      path.at(L + thruLen * inOut(kCore), lead.position, tan);
    } else {
      path.at(L + thruLen + (path.len - L - thruLen) * inOut(seg(e, T.in + T.core, eOut)), lead.position, tan);
    }
    /* landing: the document first rises, then moves over the destination and
       shrinks into a token — only the token drops inside, so the document
       itself never passes through the model */
    const kRise = inOut(seg(e, landAt, landAt + 0.32));
    const kMove = inOut(seg(e, landAt + 0.22, landAt + 0.62));
    const kShrink = inOut(seg(e, landAt + 0.62, landAt + 0.92));
    const kDrop = inOut(seg(e, landAt + 0.92, landAt + 1.2));
    if (kRise > 0) {
      y = CARD_Y + (dest.top + 0.5 - CARD_Y) * kRise;
      bank *= 1 - kRise;
    }
    if (kMove > 0) {
      lead.position.x += (dest.x - lead.position.x) * kMove;
      lead.position.z += (dest.z - lead.position.z) * kMove;
    }
    if (kShrink > 0) shrink = 1 - 0.86 * kShrink;
    if (kDrop > 0) {
      y += (dest.top + 0.03 - y) * kDrop;
      shrink *= 1 - kDrop;
    }
    lead.position.y = y;
    /* the document faces the camera and banks slightly as it moves */
    lead.rotation.set(0, (base.yaw * Math.PI) / 180, -tan.x * 0.1 * bank);

    /* floor ring at the destination */
    const p = seg(e, landAt + 1.0, landAt + 1.7);
    landRing.visible = p > 0 && p < 1 && fade > 0.02;
    if (landRing.visible) {
      landRing.position.set(dest.x, stop ? 0.095 : 0.015, dest.z);
      landRing.scale.setScalar(0.8 + 1.1 * easeOut(p));
      landMat.opacity = 0.85 * (1 - p);
      landMat.color.set(stop ? "#e0453a" : toLocal ? "#3b5bea" : "#e0b04a");
    }

    /* the chip flips as the document passes the membrane */
    bar.visible = masked || toLocal || stop;
    barBack.material = toLocal ? bead.blue : gold;
    let flip = 0;
    if (toLocal) flip = seg(e, T.in + T.core * 0.3, T.in + T.core * 0.65);
    else if (!stop) flip = clamp01((0.12 - lead.position.z) / 0.3);
    const ang = Math.PI * inOut(flip);
    bar.rotation.x = ang;
    bar.position.z = 0.04 + Math.sin(ang) * 0.12;

    const vis = fade * shrink;
    lead.visible = vis > 0.02;
    lead.scale.setScalar(Math.max(0.0001, Math.min(1, e / 0.25) * vis * grow));

    /* the route lights up behind the document */
    allHi.forEach((h) => draw(h, 0));
    if (fade > 0.02) {
      draw((stop ? hiStop : hiIn)[s.from], stop ? seg(e, 0, T.in) * 0.9 : seg(e, 0, T.in * 0.92));
      if (toLocal) draw(hiLocal, seg(e, T.in + T.core, T.in + T.core + T.out * 0.85));
      else if (typeof s.to === "number") draw(hiOut[s.to], seg(e, T.in + T.core * 0.9, T.in + T.core + T.out));
    }

    /* membrane and core: the check runs while the document is in the arch */
    const check = stop ? seg(e, T.in - 0.1, T.in + 0.7) : seg(e, T.in - 0.15, T.in + T.core + 0.1);
    const pulse = Math.sin(Math.PI * check);
    /* at rest the membrane glows faintly, so the opening reads as a checkpoint */
    memUni.uOn.value = 0.28 + 0.72 * pulse * fade;
    memUni.uScan.value = 1 - check;
    memUni.uColor.value.set(stop ? "#ff5a4c" : toLocal ? "#8ea2ff" : "#f0c96d");
    core.scale.setScalar(1 + 0.12 * pulse);
    ring.visible = ring2.visible = pulse > 0.01;
    ring.material = stop ? bead.pii : gold;
    ring.scale.setScalar(0.75 + 0.25 * pulse);
    ring2.scale.setScalar(0.7 + 0.3 * pulse);
    ring.rotation.set(1.2 + check * 3.4, check * 4.2, 0);
    ring2.rotation.set(-0.4 - check * 2.6, 1.1 + check * 3.0, 0);
    gold.envMapRotation.set(0, 0.6 + check * Math.PI * 1.4, 0);
    /* the model that received the request flashes briefly as the document lands */
    const arrive = Math.sin(Math.PI * seg(e, landAt + 0.95, landAt + 1.5));
    modelStuds.forEach((st, i) => st.scale.setScalar(1 + (s.to === i ? 0.5 * arrive : 0)));
    localStud.scale.setScalar(1 + (toLocal ? 0.5 * arrive : 0));

    HERO_LABELS.forEach((l, i) => {
      let on = false;
      if (l.kind === "dept") on = l.index === s.from;
      if (phase === "out" || phase === "done") {
        if (l.kind === "model") on = s.to === l.index;
        if (l.kind === "local") on = toLocal;
      }
      if (l.kind === "core") on = phase === "core" || (stop && phase !== "go");
      labels[i].on = on && fade > 0.3;
    });
  }

  function frame(_t: number, dt: number) {
    if (!paused) clock += dt;
    if (opts.reduced) {
      if (story < 0) {
        story = 0;
        storyT0 = -(T.in + T.core + T.out - 0.3);
      }
      updateStory(0);
    } else {
      updateFlows(clock);
      updateStory(clock);
    }

    ptr.sx = damp(ptr.sx, ptr.x, 3.5, dt);
    ptr.sy = damp(ptr.sy, ptr.y, 3.5, dt);
    if (!opts.reduced && !paused) flowMats.forEach((m) => (m.dashOffset -= dt * 0.4));
    /* the camera "breathes" a little and follows the mouse, so the depth reads on its own */
    const yaw = base.yaw + (opts.reduced ? 0 : Math.sin(clock * 0.19) * 3) + ptr.sx * 4;
    const pitch = base.pitch + (opts.reduced ? 0 : Math.sin(clock * 0.15 + 1) * 1.2) - ptr.sy * 2;
    place(yaw, pitch, fit.dist);
    camera.projectionMatrix.elements[8] = fit.sx;
    camera.projectionMatrix.elements[9] = fit.sy;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    renderer.render(scene, camera);

    const narrow = width < 560;
    HERO_LABELS.forEach((l, i) => {
      v.set(l.at[0], l.at[1], l.at[2]);
      v.project(camera);
      labels[i].x = (v.x * 0.5 + 0.5) * width;
      labels[i].y = (-v.y * 0.5 + 0.5) * height;
      labels[i].hide = narrow && l.kind === "dept";
    });
    return !opts.reduced || Math.abs(ptr.sx - ptr.x) > 0.001;
  }

  return {
    frame,
    labels,
    setPaused: (p) => {
      paused = p;
    },
    resize: (w, h, dpr) => {
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      lineMats.forEach((m) => m.resolution.set(width, height));
      /* on a narrow screen the camera looks down more steeply, so the scene gets taller */
      base = width / height < 0.95 ? { yaw: 0, pitch: 58 } : { yaw: 0, pitch: 47 };
      refit(width / height, base.yaw, base.pitch);
    },
    pointer: (x, y) => {
      ptr.x = Math.max(-1, Math.min(1, x));
      ptr.y = Math.max(-1, Math.min(1, y));
    },
    dispose: () => {
      trash.forEach((t) => t.dispose());
      env.dispose();
      renderer.dispose();
    },
  };
}
