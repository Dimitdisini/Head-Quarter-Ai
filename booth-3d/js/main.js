import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { Assets, PH } from './core/util.js';
import { setAnisotropy } from './core/tex.js';
import { buildLobby, buildCarpet } from './structure.js';
import { buildChitato, peopleChitato } from './chitato.js';
import { buildJetz, peopleJetz } from './jetz.js';
import { visitor, crewChitato, crewJetz, pose } from './people.js';

const params = new URLSearchParams(location.search);
const HEADLESS = params.has('shot');
const $ = (s) => document.querySelector(s);
const status = (t, p) => {
  const el = $('#load-text'); if (el) el.textContent = t;
  const bar = $('#load-bar'); if (bar && p != null) bar.style.width = `${p}%`;
};
const tick = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));

// ----------------------------------------------------------------------
// RENDERER
// ----------------------------------------------------------------------
const canvasWrap = $('#viewport');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: HEADLESS });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasWrap.appendChild(renderer.domElement);
setAnisotropy(renderer.capabilities.getMaxAnisotropy());
RectAreaLightUniformsLib.init();

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight);
labelRenderer.domElement.className = 'labels';
canvasWrap.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e8ecef');
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.environment = envTex;

const camera = new THREE.PerspectiveCamera(46, canvasWrap.clientWidth / canvasWrap.clientHeight, 0.05, 200);
camera.position.set(0, 2.2, 14.5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 1.1, 0);
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 0.4;
controls.maxDistance = 70;

// ----------------------------------------------------------------------
// LIGHTING GLOBAL (lobby siang: skylight atrium + ambient langit)
// ----------------------------------------------------------------------
const hemi = new THREE.HemisphereLight('#eef4fb', '#cfc6b8', 0.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e4', 1.5);
sun.position.set(-6, 22, 9);
sun.target.position.set(0, 0, 0.5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera;
sc.left = -19; sc.right = 19; sc.top = 9; sc.bottom = -9; sc.near = 5; sc.far = 45;
sun.shadow.bias = -0.00015;
sun.shadow.normalBias = 0.025;
scene.add(sun, sun.target);

// lampu studio untuk mode "lihat terpisah"
const iso = new THREE.Group();
iso.visible = false;
{
  const k = new THREE.DirectionalLight('#ffffff', 2.2); k.position.set(4, 6, 6); k.castShadow = true; k.shadow.mapSize.set(2048, 2048);
  Object.assign(k.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 30 });
  k.shadow.bias = -0.0003; k.shadow.normalBias = 0.02;
  const f = new THREE.DirectionalLight('#dfe8ff', 0.8); f.position.set(-6, 3, 4);
  const r = new THREE.DirectionalLight('#fff0e0', 1.0); r.position.set(0, 4, -6);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshStandardMaterial({ color: '#f1efe9', roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.position.y = 0.001;
  iso.add(k, k.target, f, r, floor);
  iso.userData = { key: k, floor };
}
scene.add(iso);

// ----------------------------------------------------------------------
// POST PROCESSING
// ----------------------------------------------------------------------
const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const ao = new GTAOPass(scene, camera, 1, 1);
ao.blendIntensity = 0.85;
ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.0, samples: 16 });
ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
composer.addPass(ao);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.28, 0.5, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function resize(w = canvasWrap.clientWidth, h = canvasWrap.clientHeight, pr = Math.min(window.devicePixelRatio, 2)) {
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, !RENDERING_SHOT);
  composer.setPixelRatio(pr);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  labelRenderer.setSize(w, h);
}
let RENDERING_SHOT = false;
window.addEventListener('resize', () => { if (!RENDERING_SHOT) resize(); });

// ----------------------------------------------------------------------
// BUILD SCENE
// ----------------------------------------------------------------------
const peopleGroups = [];
const walkers = [];
let dimsGroup;

async function build() {
  status('Membangun lobby Indofood Tower…', 8); await tick();
  buildLobby(scene);
  buildCarpet(scene);
  status('Membangun Zona A — Chitato x TREASURE…', 25); await tick();
  buildChitato(scene);
  status('Membangun Zona B — JetZ x Hearts2Hearts…', 45); await tick();
  buildJetz(scene);
  status('Menempatkan crew & pengunjung…', 65); await tick();
  peopleGroups.push(peopleChitato(scene, { visitor, crewChitato }));
  peopleGroups.push(peopleJetz(scene, { visitor, crewJetz }));
  buildWalkers();
  status('Garis dimensi & label…', 80); await tick();
  dimsGroup = buildDims();
  buildAssetLabels();
  status('Kompilasi shader & bayangan…', 90); await tick();
  resize();
  renderer.compile(scene, camera);
}

function buildWalkers() {
  const g = new THREE.Group();
  g.name = 'pengunjung-berjalan';
  const cfg = [
    { seed: 51, z: 3.7, speed: 1.15, x: -12, dir: 1, o: { gender: 'f', acc: { bag: 'tote' } } },
    { seed: 52, z: 4.4, speed: 1.3, x: 6, dir: -1, o: { gender: 'm', acc: { bag: 'backpack' } } },
    { seed: 53, z: 3.9, speed: 1.05, x: 14, dir: -1, o: { gender: 'f', acc: { phone: 'R' } } },
    { seed: 54, z: 5.2, speed: 1.2, x: -4, dir: 1, o: { gender: 'm' } },
    { seed: 55, z: 4.8, speed: 1.1, x: -18, dir: 1, o: { gender: 'f', acc: { bag: 'paper' } } },
  ];
  cfg.forEach(c => {
    const p = visitor(c.seed, c.o);
    p.root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    p.root.position.set(c.x, 0.004, c.z);
    p.root.rotation.y = c.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(p.root);
    walkers.push({ p, ...c, phase: c.seed });
  });
  scene.add(g);
  peopleGroups.push(g);
}

function buildDims() {
  const g = new THREE.Group();
  g.name = 'dimensi';
  const lm = new THREE.LineBasicMaterial({ color: '#1f2a24' });
  const line = (a, b) => { const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]); g.add(new THREE.Line(geo, lm)); };
  const label = (txt, pos, cls = '') => { const d = document.createElement('div'); d.className = 'dim ' + cls; d.textContent = txt; const o = new CSS2DObject(d); o.position.set(...pos); g.add(o); };
  const y = 2.75, z = 2.4;
  line([-15, y, z], [15, y, z]); line([-15, y - 0.1, z], [-15, y + 0.1, z]); line([0, y - 0.1, z], [0, y + 0.1, z]); line([15, y - 0.1, z], [15, y + 0.1, z]);
  label('15 m — Chitato x TREASURE', [-7.5, y + 0.12, z]);
  label('15 m — JetZ x Hearts2Hearts', [7.5, y + 0.12, z]);
  line([15.6, 0.02, -2], [15.6, 0.02, 2]); label('4 m', [15.9, 0.1, 0]);
  line([15.6, 0, 2], [15.6, 2.5, 2]); label('Maks 2,5 m', [16.2, 2.5, 2], 'warn');
  line([-16, 0.02, 3.2], [16, 0.02, 3.2]); label('Karpet hitam 32 x 6 m (+1 m tiap sisi)', [0, 0.05, 3.35], 'muted');
  g.visible = false;
  scene.add(g);
  return g;
}

const assetLabels = [];
function buildAssetLabels() {
  Assets.forEach(a => {
    if (!a.object) return;
    const box = new THREE.Box3().setFromObject(a.object);
    if (box.isEmpty()) return;
    const c = box.getCenter(new THREE.Vector3());
    const d = document.createElement('div');
    d.className = 'tag tag-' + a.zone;
    d.textContent = a.code;
    d.title = a.name;
    d.addEventListener('click', () => selectAsset(a.code));
    const o = new CSS2DObject(d);
    o.position.set(c.x, Math.min(box.max.y + 0.15, 2.7), c.z);
    o.visible = false;
    scene.add(o);
    assetLabels.push(o);
  });
}

// ----------------------------------------------------------------------
// KAMERA PRESET
// ----------------------------------------------------------------------
const VIEWS = {
  overview: { name: 'Overview 2 booth', pos: [0, 2.3, 14.5], target: [0, 1.25, 0] },
  chitato: { name: 'Zona Chitato (golden master)', pos: [-7.5, 1.65, 5.8], target: [-7.5, 1.2, -0.6] },
  jetz: { name: 'Zona JetZ (golden master)', pos: [7.5, 1.65, 5.8], target: [7.5, 1.2, -0.6] },
  eye: { name: 'Mata pengunjung — dari Lobby SPIT', pos: [-17, 1.6, 4.2], target: [-6, 1.25, 0] },
  eye2: { name: 'Mata pengunjung — dari Indomaret', pos: [17, 1.6, 4.2], target: [6, 1.25, 0] },
  aerial: { name: 'Aerial 3/4', pos: [-11, 7.5, 12.0], target: [0, 0.6, 0] },
  plan: { name: 'Denah atas (top view)', pos: [0, 24, 0.01], target: [0, 0, 0] },
  divider: { name: 'Pembatas loker Chitato | JetZ', pos: [0.1, 1.6, 4.8], target: [0.1, 1.2, -0.5] },
  stage: { name: 'Headphone stage', pos: [7.55, 1.5, 3.6], target: [7.55, 1.3, -1.3] },
  charm: { name: 'Charm making (close-up)', pos: [11.6, 1.45, 2.3], target: [11.3, 0.8, 0.3] },
  keychain: { name: 'Pegboard gantungan kunci (macro)', pos: [11.35, 1.35, -1.20], target: [11.35, 1.25, -1.84] },
  lightbox: { name: 'Lightbox TREASURE + standee', pos: [-3.7, 1.55, 3.4], target: [-3.7, 1.2, -1.4] },
  selling: { name: 'Selling area Chitato', pos: [-11.2, 1.65, 4.2], target: [-13.3, 1.0, -0.4] },
};

let tween = null;
function flyTo(pos, target, dur = 1.1) {
  if (HEADLESS || dur === 0) { camera.position.set(...pos); controls.target.set(...target); controls.update(); return; }
  tween = { t: 0, dur, p0: camera.position.clone(), t0: controls.target.clone(), p1: new THREE.Vector3(...pos), t1: new THREE.Vector3(...target) };
}
function updateTween(dt) {
  if (!tween) return;
  tween.t += dt / tween.dur;
  const k = Math.min(1, tween.t);
  const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  camera.position.lerpVectors(tween.p0, tween.p1, e);
  controls.target.lerpVectors(tween.t0, tween.t1, e);
  if (k >= 1) tween = null;
  ptDirty = true;
}

// ----------------------------------------------------------------------
// MODE: siang / presentasi; isolasi aset
// ----------------------------------------------------------------------
let mode = 'day';
function setMode(m) {
  mode = m;
  const skyEl = scene.getObjectByName('skylight');
  if (m === 'day') {
    hemi.intensity = 0.55;
    sun.intensity = 1.5;
    renderer.toneMappingExposure = 1.05;
    scene.background.set('#e8ecef');
    scene.environment = envTex;
    bloom.strength = 0.28;
    if (skyEl && skyEl.userData && skyEl.userData.mat) skyEl.userData.mat.color.set('#eef5fb');
  } else {
    // Mode presentasi malam: pencahayaan lobby gelap dramatis, menonjolkan neon & lampu booth
    hemi.intensity = 0.08;
    sun.intensity = 0.15;
    renderer.toneMappingExposure = 1.35;
    scene.background.set('#101316');
    scene.environment = null;
    bloom.strength = 0.65;
    if (skyEl && skyEl.userData && skyEl.userData.mat) skyEl.userData.mat.color.set('#0b1016');
  }
  document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  ptDirty = true;
}

function applyViewRules(vName) {
  const isPlan = (vName === 'plan');
  scene.traverse(o => {
    if (o.name === 'canopy-roof' || o.name === 'lobby-ceiling' || o.name === 'skylight' || o.name === 'skylight-beam') {
      o.visible = !isPlan;
    }
  });
}

let isolated = null;
const visBackup = new Map();
function isolate(code) {
  restoreIsolation();
  const a = Assets.find(x => x.code === code);
  if (!a) return;
  scene.traverse(o => visBackup.set(o, o.visible));
  scene.children.forEach(o => { if (o !== iso && !o.isLight) o.visible = false; });
  hemi.visible = true; sun.visible = false; iso.visible = true;
  let node = a.object;
  node.visible = true;
  node.traverse(o => { o.visible = visBackup.get(o) ?? true; });
  while (node.parent && node.parent !== scene) {
    const par = node.parent;
    par.visible = true;
    par.children.forEach(ch => { if (ch !== node && !ch.isLight) ch.visible = false; });
    node = par;
  }
  // nonaktifkan lampu-lampu shell supaya pencahayaan studio konsisten
  scene.traverse(o => { if ((o.isSpotLight || o.isRectAreaLight) && o.parent && o.visible) o.visible = false; });
  const box = new THREE.Box3().setFromObject(a.object);
  const c = box.getCenter(new THREE.Vector3());
  const s = box.getSize(new THREE.Vector3());
  iso.position.set(c.x, 0, c.z);
  iso.userData.key.target.position.set(c.x, c.y, c.z);
  const r = Math.max(s.x, s.y, s.z);
  flyTo([c.x + r * 0.9, c.y + r * 0.45, c.z + r * 1.4], [c.x, c.y, c.z]);
  isolated = code;
  $('#btn-iso').classList.add('on');
  $('#btn-iso').textContent = 'Kembali ke booth penuh';
  ptDirty = true;
}
function restoreIsolation() {
  if (!isolated) return;
  visBackup.forEach((v, o) => { o.visible = v; });
  visBackup.clear();
  iso.visible = false; sun.visible = true;
  isolated = null;
  $('#btn-iso').classList.remove('on');
  $('#btn-iso').textContent = 'Lihat aset terpisah';
  ptDirty = true;
}

// ----------------------------------------------------------------------
// UI
// ----------------------------------------------------------------------
let selected = null;
function selectAsset(code) {
  const a = Assets.find(x => x.code === code);
  if (!a) return;
  selected = a;
  document.querySelectorAll('.asset-item').forEach(el => el.classList.toggle('on', el.dataset.code === code));
  const p = $('#asset-detail');
  p.innerHTML = `<div class="ad-code">${a.code} · ${a.zone === 'A' ? 'Zona Chitato' : a.zone === 'B' ? 'Zona JetZ' : 'Shared'}</div>
    <div class="ad-name">${a.name}</div><ul>${a.spec.map(s => `<li>${s}</li>`).join('')}</ul>`;
  p.classList.add('show');
  if (isolated) isolate(code);
  else if (a.focus) flyTo(a.focus.pos, a.focus.target);
}

function buildUI() {
  const vl = $('#views');
  Object.entries(VIEWS).forEach(([k, v]) => {
    const b = document.createElement('button');
    b.textContent = v.name;
    b.onclick = () => { restoreIsolation(); applyViewRules(k); flyTo(v.pos, v.target); };
    vl.appendChild(b);
  });
  const groups = { A: 'Zona A — Chitato x TREASURE', B: 'Zona B — JetZ x Hearts2Hearts', S: 'Shared / Venue' };
  const al = $('#assets');
  Object.entries(groups).forEach(([z, title]) => {
    const h = document.createElement('div'); h.className = 'asset-group'; h.textContent = title; al.appendChild(h);
    Assets.filter(a => a.zone === z).sort((a, b) => a.code.localeCompare(b.code)).forEach(a => {
      const it = document.createElement('div');
      it.className = 'asset-item';
      it.dataset.code = a.code;
      it.innerHTML = `<span class="c">${a.code}</span><span class="n">${a.name}</span>`;
      it.onclick = () => selectAsset(a.code);
      al.appendChild(it);
    });
  });
  $('#btn-iso').onclick = () => { if (isolated) restoreIsolation(); else if (selected) isolate(selected.code); else alert('Pilih aset dulu di daftar.'); };
  document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  const tg = (id, fn) => { const el = $(id); el.onchange = () => { fn(el.checked); ptDirty = true; }; };
  tg('#t-people', v => peopleGroups.forEach(g => g.visible = v));
  tg('#t-dims', v => dimsGroup.visible = v);
  tg('#t-hq', v => {
    useHQ = v;
    ao.enabled = v;
    bloom.enabled = v;
    renderer.shadowMap.type = v ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    renderer.shadowMap.needsUpdate = true;
  });
  tg('#t-walk', v => { walking = v; });
  $('#btn-shot').onclick = () => saveShot(3840, 2160);
  $('#btn-shot-hd').onclick = () => saveShot(1920, 1080);
  $('#btn-pt').onclick = togglePathTracing;
  $('#btn-hide-ui').onclick = () => document.body.classList.toggle('clean');
}

// ----------------------------------------------------------------------
// RENDER FOTO (PNG) & PATH TRACING
// ----------------------------------------------------------------------
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
function shotName() {
  const v = selected ? selected.code : 'booth';
  const d = new Date();
  return `Render Booth Chitato JetZ ${v} ${d.getHours()}${String(d.getMinutes()).padStart(2, '0')}.png`;
}
async function saveShot(w, h) {
  if (pt.active) {
    pt.capture = true;
    return;
  }
  RENDERING_SHOT = true;
  const prev = [canvasWrap.clientWidth, canvasWrap.clientHeight, renderer.getPixelRatio()];
  resize(w, h, 1);
  // render beberapa frame supaya AO/bloom stabil
  for (let i = 0; i < 2; i++) composer.render();
  await new Promise(r => renderer.domElement.toBlob(b => { download(b, shotName()); r(); }, 'image/png'));
  RENDERING_SHOT = false;
  resize(prev[0], prev[1], prev[2]);
}

const pt = { active: false, tracer: null, capture: false };
let ptDirty = true;
async function togglePathTracing() {
  const btn = $('#btn-pt');
  if (pt.active) {
    pt.active = false;
    btn.classList.remove('on');
    btn.textContent = 'Render fotorealistik (path tracing)';
    $('#pt-info').textContent = '';
    labelRenderer.domElement.style.display = '';
    return;
  }
  btn.textContent = 'Menyiapkan path tracer…';
  try {
    const { WebGLPathTracer } = await import('three-gpu-pathtracer');
    if (!pt.tracer) {
      pt.tracer = new WebGLPathTracer(renderer);
      pt.tracer.tiles.set(2, 2);
      pt.tracer.bounces = 5;
      pt.tracer.filterGlossyFactor = 0.5;
      pt.tracer.minSamples = 1;
      pt.tracer.renderScale = 1;
    }
    walking = false; $('#t-walk').checked = false;
    scene.updateMatrixWorld(true);
    // emissive & lampu ikut; bloom tidak ada di path tracing
    pt.tracer.setScene(scene, camera);
    pt.active = true;
    btn.classList.add('on');
    btn.textContent = 'Kembali ke mode realtime';
    labelRenderer.domElement.style.display = 'none';
  } catch (e) {
    console.error(e);
    btn.textContent = 'Render fotorealistik (path tracing)';
    alert('Path tracing gagal dijalankan di browser ini: ' + e.message);
  }
}

// ----------------------------------------------------------------------
// LOOP
// ----------------------------------------------------------------------
let walking = !HEADLESS;
let useHQ = false;
const clock = new THREE.Clock();
let frame = 0;
controls.addEventListener('change', () => { ptDirty = true; });

function loop() {
  const dt = Math.min(clock.getDelta(), 0.05);
  updateTween(dt);
  controls.update();
  if (walking) {
    walkers.forEach(w => {
      w.phase += dt * w.speed * 5.2;
      w.p.root.position.x += w.dir * w.speed * dt;
      if (w.p.root.position.x > 22) w.p.root.position.x = -22;
      if (w.p.root.position.x < -22) w.p.root.position.x = 22;
      pose(w.p, 'walk', { phase: w.phase });
    });
    renderer.shadowMap.needsUpdate = (frame % 2 === 0);
  }
  renderer.shadowMap.autoUpdate = !walking;
  if (pt.active && pt.tracer) {
    if (ptDirty) { pt.tracer.updateCamera(); ptDirty = false; }
    pt.tracer.renderSample();
    $('#pt-info').textContent = `Path tracing: ${Math.floor(pt.tracer.samples)} sampel` + (pt.tracer.samples < 64 ? ' — biarkan kamera diam sampai halus' : ' — siap disimpan');
    if (pt.capture) { pt.capture = false; renderer.domElement.toBlob(b => download(b, shotName()), 'image/png'); }
  } else {
    if (useHQ) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    labelRenderer.render(scene, camera);
  }
  frame++;
  requestAnimationFrame(loop);
}

// ----------------------------------------------------------------------
// START
// ----------------------------------------------------------------------
(async () => {
  try {
    await build();
    buildUI();
    setMode(params.get('mode') === 'night' ? 'night' : 'day');
    const vName = params.get('view') || 'overview';
    applyViewRules(vName);
    const v = VIEWS[vName] || VIEWS.overview;
    flyTo(v.pos, v.target, 0);
    if (params.get('asset')) { selectAsset(params.get('asset')); if (params.has('iso')) isolate(params.get('asset')); flyTo(...(() => { const a = Assets.find(x => x.code === params.get('asset')); return params.has('iso') ? [camera.position.toArray(), controls.target.toArray()] : [a.focus.pos, a.focus.target]; })(), 0); }
    if (params.has('people') && params.get('people') === '0') peopleGroups.forEach(g => g.visible = false);
    status('Siap', 100);
    $('#loader').classList.add('done');
    if (HEADLESS) {
      document.body.classList.add('clean');
      resize(window.innerWidth, window.innerHeight);
      if (tween) { camera.position.copy(tween.p1); controls.target.copy(tween.t1); tween = null; }
      controls.update();
      renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      const info = renderer.info;
      console.log('READY draw calls', info.render.calls, 'tris', info.render.triangles, 'assets', Assets.length);
      document.title = 'READY';
      return;
    }
    loop();
  } catch (e) {
    console.error(e);
    status('Error: ' + e.message, 100);
    document.title = 'ERROR ' + e.message;
  }
})();

window.__booth = { scene, camera, renderer, composer, Assets, VIEWS, flyTo, isolate, selectAsset, resize };
