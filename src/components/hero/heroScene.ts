import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { CORE_R, HALF, channelShape, contourShape, extrude, roundedRect } from "@/components/three/perimeter";
import {
  clamp01,
  createRenderer,
  damp,
  easeOut,
  fitCamera,
  inOut,
  keyLight,
  seg,
  shadowCatcher,
  softStudio,
  type Box,
  type Region,
} from "@/components/three/studio";
import type { Stage } from "@/components/three/useStage";
import { DEPTS, MODELS, STORIES, STORY_LEN, T, type Phase } from "./flow";

/* Первый экран: знак «Периметр» в объёме — контур компании, ядро-Кордон,
   канал и проход к нейросетям. По линиям идёт фоновый поток запросов.
   Один запрос по очереди выделен: карточка с красной плашкой персданных
   подлетает к ядру, медленно проходит сквозь него под кольцом проверки и
   на выходе переворачивает плашку — золотом (данные скрыты) или синим
   (закрытое, едет в локальную модель). Запрос сверх лимита отскакивает. */

export interface HeroLabel {
  id: string;
  text: string;
  at: readonly [number, number];
  side: "left" | "right" | "below";
  kind: "dept" | "model" | "local" | "core";
  index: number;
}

export const DEPT_X = -1.28;
export const DEPT_Y = [1.5, 0.75, 0, -0.75, -1.5];
export const MODEL_X = 3.86;
export const MODEL_Y = [1.2, 0.4, -0.4, -1.2];
export const LOCAL = { x: 1.36, y: -1.56 };

export const HERO_LABELS: HeroLabel[] = [
  ...DEPTS.map((t, i) => ({
    id: `d${i}`,
    text: t,
    at: [DEPT_X, DEPT_Y[i]] as const,
    side: "left" as const,
    kind: "dept" as const,
    index: i,
  })),
  ...MODELS.map((t, i) => ({
    id: `m${i}`,
    text: t,
    at: [MODEL_X, MODEL_Y[i]] as const,
    side: "right" as const,
    kind: "model" as const,
    index: i,
  })),
  { id: "local", text: "Локальная модель", at: [LOCAL.x, LOCAL.y], side: "left", kind: "local", index: 0 },
  { id: "core", text: "Кордон", at: [0, -1.16], side: "below", kind: "core", index: 0 },
];

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

const Z = 0.3; // плоскость маршрутов: перед каналом, сквозь проход
const BOX: Box = [-3.15, 5.05, -3.05, 3.05];
const BOX_NARROW: Box = [-3.1, 5.75, -3.05, 3.05];
const REGION: Region = [0.01, 0.99, 0.02, 0.98];

/* ломаная с длинами: точка по пройденному пути */
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

export function createHeroScene(
  canvas: HTMLCanvasElement,
  opts: { reduced: boolean; onPhase: (story: number, phase: Phase) => void },
): HeroScene {
  const renderer = createRenderer(canvas, true);
  const scene = new THREE.Scene();
  const env = softStudio(renderer);
  scene.environment = env;
  /* материалы знака: тёмно-синий сатин с лаком — блик идёт по фаске;
     сатиновое золото ядра — мягкие блики без пятен */
  const satin = new THREE.MeshPhysicalMaterial({
    color: "#17213b",
    roughness: 0.38,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.05,
  });
  const coreGold = new THREE.MeshPhysicalMaterial({ color: "#ecbd59", metalness: 1, roughness: 0.22, envMapIntensity: 1.25 });
  const barGold = new THREE.MeshPhysicalMaterial({ color: "#e8b650", metalness: 1, roughness: 0.3, envMapIntensity: 1.15 });
  const bead = {
    pii: new THREE.MeshPhysicalMaterial({ color: "#e0453a", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
    clean: new THREE.MeshPhysicalMaterial({ color: "#2f3d63", roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }),
    gold: new THREE.MeshPhysicalMaterial({ color: "#efc061", metalness: 1, roughness: 0.2, envMapIntensity: 1.2 }),
    blue: new THREE.MeshPhysicalMaterial({ color: "#3b5bea", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
  };
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  keyLight(scene, 1.3, true);
  const wall = shadowCatcher(0.1);
  wall.position.z = -1.05;
  scene.add(wall);

  const trash: { dispose: () => void }[] = [];
  const keep = <G extends { dispose: () => void }>(g: G) => (trash.push(g), g);

  /* ——— знак ——— */
  const sign = new THREE.Group();
  const contour = new THREE.Mesh(keep(extrude(contourShape(HALF - 0.12), 0.7, 0.12, 72)), satin);
  const channel = new THREE.Mesh(keep(extrude(channelShape(HALF - 0.07), 0.3, 0.07, 36)), barGold);
  const core = new THREE.Mesh(keep(new THREE.SphereGeometry(CORE_R, 128, 96)), coreGold);
  for (const m of [contour, channel, core]) m.castShadow = true;
  sign.add(contour, channel, core);
  scene.add(sign);

  /* кольцо проверки вокруг ядра — крутится, пока запрос внутри */
  const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(1.13, 0.02, 16, 160)), coreGold);
  ring.visible = false;
  scene.add(ring);
  const ring2 = new THREE.Mesh(keep(new THREE.TorusGeometry(1.21, 0.01, 10, 160)), barGold);
  ring2.visible = false;
  scene.add(ring2);

  /* ——— маршруты ——— */
  const P = (x: number, y: number) => new THREE.Vector3(x, y, Z);
  const quad = (a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, n = 40) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n;
      const u = 1 - t;
      return new THREE.Vector3(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y, Z);
    });
  const CORE = P(0, 0);
  const EXIT = P(3.0, 0);
  const inPts = DEPT_Y.map((y) => quad(P(DEPT_X + 0.1, y), P(-0.48, y * 0.92), CORE));
  const chPts = [CORE, P(1.5, 0), EXIT];
  const outPts = MODEL_Y.map((y) => quad(EXIT, P(3.45, 0), P(MODEL_X - 0.1, y)));
  const localPts = quad(CORE, P(0.62, -0.66), P(LOCAL.x - 0.1, LOCAL.y));

  const lineMats: LineMaterial[] = [];
  const flowMats: LineMaterial[] = []; // пунктир, который бежит по направлению потока
  const makeLine = (pts: THREE.Vector3[], color: string, width: number, opacity: number, dashed = false) => {
    const g = new LineGeometry();
    g.setPositions(pts.flatMap((p) => [p.x, p.y, p.z]));
    const m = new LineMaterial({
      color,
      linewidth: width,
      transparent: opacity < 1,
      opacity,
      depthWrite: false,
      dashed,
      dashSize: 0.07,
      gapSize: 0.09,
    });
    lineMats.push(m);
    if (dashed) flowMats.push(m);
    trash.push(g, m);
    const l = new Line2(g, m);
    l.computeLineDistances();
    scene.add(l);
    return { line: l, geo: g, segs: pts.length - 1 };
  };
  /* внутри контура — синие линии запросов компании, снаружи — золото после Кордона;
     тонкая основа и бегущий пунктир поверх */
  inPts.forEach((p) => {
    makeLine(p, "#2a47d6", 1, 0.16);
    makeLine(p, "#2a47d6", 1.6, 0.55, true);
  });
  makeLine(localPts, "#2a47d6", 1, 0.16);
  makeLine(localPts, "#2a47d6", 1.6, 0.55, true);
  outPts.forEach((p) => {
    makeLine(p, "#c99731", 1, 0.3);
    makeLine(p, "#c99731", 1.7, 0.85, true);
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

  /* ——— фоновый поток: жемчужины запросов ———
     до ядра: красная — в запросе персданные, тёмная — чистый запрос;
     после ядра: золотая — ушёл в маске, синяя — остался в локальной модели.
     Все идут с одной скоростью и проходят ядро через равные промежутки,
     поэтому шаг между ними одинаковый и на общем канале они не слипаются. */
  const SPEED = 1.1; // единиц сцены в секунду
  const GAP = 0.66; // секунд между жемчужинами в ядре → шаг ≈ 0.73 по каналу
  const beadGeo = keep(new THREE.SphereGeometry(0.068, 24, 16));
  const lineMat = keep(new THREE.MeshBasicMaterial({ color: 0x8e9ab4 }));
  const beads = Array.from({ length: 18 }, () => {
    const m = new THREE.Mesh(beadGeo, bead.clean);
    m.visible = false;
    scene.add(m);
    return m;
  });

  /* ——— выделенный запрос: карточка с плашкой персданных ——— */
  const CW = 0.76;
  const CH = 0.4;
  const lead = new THREE.Group();
  lead.add(new THREE.Mesh(keep(extrude(roundedRect(CW, CH, 0.08), 0.075, 0.018, 10)), satin));
  const tLine = keep(new THREE.PlaneGeometry(0.3, 0.032));
  const lt1 = new THREE.Mesh(tLine, lineMat);
  lt1.position.set(-0.13, 0.085, 0.039);
  const lt2 = new THREE.Mesh(tLine, lineMat);
  lt2.position.set(-0.16, 0.015, 0.039);
  lt2.scale.x = 0.75;
  lead.add(lt1, lt2);
  /* плашка: спереди красная, сзади — золотая или синяя */
  const BAR_X = 0.14;
  const bar = new THREE.Group();
  bar.position.set(BAR_X, -0.085, 0.06);
  const barGeo = keep(extrude(roundedRect(0.32, 0.115, 0.032), 0.014, 0.004, 6));
  const barFront = new THREE.Mesh(barGeo, bead.pii);
  barFront.position.z = 0.008;
  const barBack = new THREE.Mesh(barGeo, coreGold);
  barBack.position.z = -0.008;
  bar.add(barFront, barBack);
  lead.add(bar);
  lead.visible = false;
  scene.add(lead);

  /* пути выделенного запроса для каждой истории */
  const leadPath = STORIES.map((s) => {
    const pin = inPts[s.from];
    if (s.to === "stop") return new Path(pin);
    if (s.to === "local") return new Path([...pin, ...localPts.slice(1)]);
    return new Path([...pin, ...chPts.slice(1), ...outPts[s.to].slice(1)]);
  });
  const inLen = inPts.map((p) => new Path(p).len);

  /* расписание фона: жемчужина n проходит центр ядра в момент n·GAP;
     отдел, модель и персданные — по кругу, с разными периодами */
  const DESTS: (number | "local")[] = [3, 0, "local", 2, 1, 3, 0, 1, "local", 2];
  const PII = [1, 0, 1, 1, 0, 1, 0];
  const mod = (n: number, m: number) => ((n % m) + m) % m;
  const routes = DEPTS.map((_, from) =>
    [0, 1, 2, 3, "local" as const].map((dest) =>
      dest === "local"
        ? new Path([...inPts[from], ...localPts.slice(1)])
        : new Path([...inPts[from], ...chPts.slice(1), ...outPts[dest].slice(1)]),
    ),
  );
  const routeFor = (from: number, dest: number | "local") => routes[from][dest === "local" ? 4 : dest];
  const HEAD = Math.max(...inLen) / SPEED; // сколько жемчужина идёт до ядра
  const TAIL = Math.max(...routes.flatMap((r, from) => r.map((p) => p.len - inLen[from]))) / SPEED;

  /* ——— состояние ——— */
  let width = 1;
  let height = 1;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  let paused = false;
  let clock = 0;
  let story = -1;
  let storyT0 = 0;
  let lastPhase: Phase | null = null;
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
      const pii = PII[mod(n, PII.length)] === 1;
      m.material = s < L ? (pii ? bead.pii : bead.clean) : dest === "local" ? bead.blue : pii ? bead.gold : bead.clean;
      /* вырастает из точки отдела, тает у модели */
      let k = Math.min(1, s / 0.24, (path.len - s) / 0.24);
      /* рядом с выделенной карточкой — уступает ей место */
      if (lead.visible) k *= clamp01((m.position.distanceTo(lead.position) - 0.44) / 0.3);
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
    const masked = s.text.some((p) => typeof p !== "string");
    const fade = 1 - seg(e, STORY_LEN - T.gap - 0.35, STORY_LEN - T.gap);
    const path = leadPath[story];
    const L = inLen[s.from];

    /* где карточка: подлёт (до входа в ядро), проход сквозь ядро медленно, путь к модели */
    const enter = L - CORE_R - CW / 2 - 0.02; // передний край касается ядра
    const exit = L + CORE_R + CW / 2 + 0.05; // задний край вышел из ядра
    const enterEff = Math.max(enter, 0.3); // у коротких маршрутов карточке нужно хоть немного разгона
    let d: number;
    let squash = 1;
    let grow = 1;
    if (stop) {
      const a = inOut(seg(e, 0.05, T.in));
      d = 0.14 + a * (enter - 0.14);
      grow = 0.38 + 0.62 * Math.min(1, a * 1.4);
      const hit = seg(e, T.in, T.in + 0.35);
      d -= Math.sin(Math.PI * hit) * 0.28; // отскок
      squash = 1 - 0.12 * Math.sin(Math.PI * seg(e, T.in, T.in + 0.18));
    } else if (e < T.in) {
      /* карточка вырастает из точки отдела и к ядру подходит в полный размер */
      const k = inOut(seg(e, 0.05, T.in));
      d = 0.14 + k * (enterEff - 0.14);
      grow = 0.38 + 0.62 * k;
    } else if (e < T.in + T.core) {
      d = enterEff + (exit - enterEff) * seg(e, T.in, T.in + T.core);
    } else {
      d = exit + (path.len - exit) * easeOut(seg(e, T.in + T.core, T.in + T.core + T.out));
    }
    path.at(d, lead.position, tan);
    /* карточка слегка поворачивается по ходу, на канале — ровно */
    const aim = Math.atan2(tan.y, tan.x);
    lead.rotation.set(0, 0, aim * 0.55 * (d < L ? 1 : 0.25));
    lead.scale.set(squash, 1 / Math.sqrt(squash), 1);

    /* плашка: переворачивается, когда выходит из ядра */
    bar.visible = masked || s.to === "local" || stop;
    barBack.material = s.to === "local" ? bead.blue : coreGold;
    let flip = 0;
    if (!stop) {
      const barD = d - L + BAR_X; // насколько плашка прошла за центр ядра
      flip = clamp01((barD - CORE_R + 0.05) / 0.32);
    }
    const ang = Math.PI * inOut(flip);
    bar.rotation.x = ang;
    bar.position.z = 0.06 + Math.sin(ang) * 0.12;

    /* остановленный запрос падает и гаснет */
    let vis = fade;
    if (stop) {
      const drop = seg(e, T.in + 0.45, T.in + 1.5);
      lead.position.y -= drop * drop * 1.6;
      lead.rotation.z += drop * 0.9;
      vis *= 1 - seg(e, T.in + 1.1, T.in + 1.6);
    } else {
      const arrive = seg(e, T.in + T.core + T.out - 0.25, T.in + T.core + T.out);
      vis *= 1 - arrive;
    }
    lead.visible = vis > 0.02;
    lead.scale.multiplyScalar(Math.max(0.0001, Math.min(1, e / 0.25) * vis * grow));

    /* маршрут */
    allHi.forEach((h) => draw(h, 0));
    if (fade > 0.02) {
      draw((stop ? hiStop : hiIn)[s.from], stop ? seg(e, 0, T.in) * 0.86 : seg(e, 0, T.in * 0.9));
      if (s.to === "local") draw(hiLocal, seg(e, T.in + T.core, T.in + T.core + T.out * 0.85));
      else if (typeof s.to === "number") draw(hiOut[s.to], seg(e, T.in + T.core + T.out * 0.3, T.in + T.core + T.out));
    }

    /* ядро: пульс и кольца проверки, пока карточка внутри */
    const inside = stop ? seg(e, T.in - 0.05, T.in + 0.6) : seg(e, T.in - 0.1, T.in + T.core + 0.1);
    const pulse = Math.sin(Math.PI * inside);
    core.scale.setScalar(1 + 0.05 * pulse);
    ring.visible = pulse > 0.01;
    ring2.visible = pulse > 0.01 && !stop;
    ring.material = stop ? bead.pii : coreGold;
    /* отражения в ядре проворачиваются, пока оно разбирает запрос */
    coreGold.envMapRotation.set(0, 0.6 + inside * Math.PI * 1.4, 0);
    ring.scale.setScalar(0.82 + 0.18 * pulse);
    ring2.scale.setScalar(0.8 + 0.2 * pulse);
    ring.rotation.set(1.2 + inside * 3.4, inside * 4.2, 0);
    ring2.rotation.set(-0.4 - inside * 2.6, 1.1 + inside * 3.0, 0);

    HERO_LABELS.forEach((l, i) => {
      let on = false;
      if (l.kind === "dept") on = l.index === s.from;
      if (phase === "out" || phase === "done") {
        if (l.kind === "model") on = s.to === l.index;
        if (l.kind === "local") on = s.to === "local";
      }
      if (l.kind === "core") on = phase === "core";
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

    ptr.sx = damp(ptr.sx, ptr.x, 4, dt);
    ptr.sy = damp(ptr.sy, ptr.y, 4, dt);
    /* пунктир бежит по направлению потока */
    if (!opts.reduced && !paused) flowMats.forEach((m) => (m.dashOffset -= dt * 0.45));
    /* камера чуть «дышит» — объём читается и без мыши */
    const driftY = opts.reduced ? 0 : Math.sin(clock * 0.21) * 2.4;
    const driftP = opts.reduced ? 0 : Math.sin(clock * 0.16 + 1) * 1.1;
    const tall = width / height < 0.9;
    const narrow = width < 560;
    fitCamera(
      camera,
      narrow ? BOX_NARROW : BOX,
      REGION,
      width / height,
      -6 * (tall ? 0.5 : 1) + driftY + ptr.sx * 3.2,
      3 + driftP + ptr.sy * 2.2,
    );
    renderer.render(scene, camera);

    HERO_LABELS.forEach((l, i) => {
      v.set(l.at[0], l.at[1], Z);
      v.project(camera);
      labels[i].x = (v.x * 0.5 + 0.5) * width;
      labels[i].y = (-v.y * 0.5 + 0.5) * height;
      /* на телефоне внутри контура тесно: кто отправил — видно в билете под схемой */
      labels[i].hide = narrow && (l.kind === "dept" || l.kind === "local");
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
    },
    pointer: (x, y) => {
      ptr.x = Math.max(-1, Math.min(1, x));
      ptr.y = Math.max(-1, Math.min(1, y));
    },
    dispose: () => {
      trash.forEach((t) => t.dispose());
      for (const m of [satin, coreGold, barGold, ...Object.values(bead)]) m.dispose();
      wall.geometry.dispose();
      (wall.material as THREE.Material).dispose();
      env.dispose();
      renderer.dispose();
    },
  };
}
