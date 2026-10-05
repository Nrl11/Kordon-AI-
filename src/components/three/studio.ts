import * as THREE from "three";

/* «Студия» для объёмной сцены первого экрана: рендерер, мягкое окружение,
   ключевой свет с тенью, камера по рамке и плавности. Объём даёт свет
   и мягкая тень, а не свечение. */

export function createRenderer(canvas: HTMLCanvasElement, shadows = false) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  r.setClearColor(0x000000, 0);
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1;
  if (shadows) {
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.VSMShadowMap;
  }
  return r;
}

/** Мягкая студия для первого экрана: купол с плавным переходом от светлого
    верха к тёплому низу и два больших размытых софтбокса — на золоте ровные
    мягкие блики без пятен. */
export function softStudio(renderer: THREE.WebGLRenderer) {
  const s = new THREE.Scene();
  const trash: { dispose: () => void }[] = [];
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(20, 48, 32),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: [
        "varying vec3 vP;",
        "void main(){",
        "  float y = vP.y;",
        "  vec3 top = vec3(1.55, 1.55, 1.6);",
        "  vec3 mid = vec3(0.62, 0.63, 0.66);",
        "  vec3 low = vec3(0.42, 0.38, 0.34);",
        "  vec3 c = y > 0.0 ? mix(mid, top, smoothstep(0.0, 0.85, y)) : mix(mid, low, smoothstep(0.0, -0.7, y));",
        "  gl_FragColor = vec4(c, 1.0);",
        "}",
      ].join("\n"),
    }),
  );
  s.add(dome);
  trash.push(dome.geometry, dome.material as THREE.Material);
  const soft = (w: number, h: number, k: number, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(1, 48),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k * 0.99, k * 0.97), side: THREE.DoubleSide }),
    );
    m.scale.set(w, h, 1);
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
    trash.push(m.geometry, m.material as THREE.Material);
  };
  soft(7, 4, 3.2, -4, 9, 8); // большой софтбокс сверху-спереди
  soft(2.2, 7, 1.6, 12, 2, -2); // контровой справа — блик по кромке контура
  soft(5, 2, 0.9, -10, -2, 6); // слабая заливка слева
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(s, 0.06).texture;
  pmrem.dispose();
  trash.forEach((t) => t.dispose());
  return tex;
}

/** Ключевой свет сверху-слева, почти спереди: тень ложится под объект. */
export function keyLight(scene: THREE.Scene, intensity = 1.3, shadow = false) {
  const key = new THREE.DirectionalLight(0xffffff, intensity);
  key.position.set(-2.4, 8, 10);
  if (shadow) {
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -10, near: 1, far: 40 });
    key.shadow.radius = 22;
    key.shadow.blurSamples = 24;
    key.shadow.bias = -0.0004;
  }
  scene.add(key, key.target);
  return key;
}

/** Невидимая стена или пол, на которых видна только мягкая тень. */
export function shadowCatcher(opacity = 0.1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(140, 90), new THREE.ShadowMaterial({ color: 0x1c1912, opacity }));
  m.receiveShadow = true;
  return m;
}

const DEG = Math.PI / 180;
export type Box = readonly [number, number, number, number]; // x0, x1, y0, y1
export type Region = readonly [number, number, number, number]; // u0, u1, v0, v1

/** Камера смотрит на центр рамки и отходит так, чтобы рамка вписалась
    в регион экрана; сдвиг объектива ставит рамку в регион без перекоса. */
export function fitCamera(
  camera: THREE.PerspectiveCamera,
  box: Box,
  region: Region,
  aspect: number,
  yaw: number,
  pitch: number,
  z = 0,
) {
  const tanH = Math.tan((camera.fov / 2) * DEG);
  const needW = (box[1] - box[0]) / (region[1] - region[0]);
  const needH = (box[3] - box[2]) / (region[3] - region[2]);
  const dist = Math.max(needH / (2 * tanH), needW / (2 * tanH * aspect));
  const tx = (box[0] + box[1]) / 2;
  const ty = (box[2] + box[3]) / 2;
  const y = yaw * DEG;
  const p = pitch * DEG;
  camera.position.set(tx + dist * Math.sin(y) * Math.cos(p), ty + dist * Math.sin(p), z + dist * Math.cos(y) * Math.cos(p));
  camera.aspect = aspect;
  camera.lookAt(tx, ty, z);
  camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[8] = 1 - (region[0] + region[1]);
  camera.projectionMatrix.elements[9] = region[2] + region[3] - 1;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  camera.updateMatrixWorld();
}

/* плавность */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const seg = (s: number, a: number, b: number) => clamp01((s - a) / (b - a));
export const inOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
/** экспоненциальное приближение к цели, не зависит от частоты кадров */
export const damp = (cur: number, to: number, rate: number, dt: number) => cur + (to - cur) * (1 - Math.exp(-rate * dt));
