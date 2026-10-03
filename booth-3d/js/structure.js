import * as THREE from 'three';
import { M, P } from './core/mat.js';
import { mesh, rbox, box, grp, PH, MAX_H, registerAsset } from './core/util.js';
import * as T from './core/tex.js';
import { trackHead } from './props.js';

// ======================================================================
// LOBBY INDOFOOD TOWER (konteks lingkungan) + karpet proteksi + shell booth
// Sumbu: X = panjang 30 m (Chitato -15..0, JetZ 0..15), Z = kedalaman
// (dinding belakang z=-2, sisi depan z=+2), Y = tinggi.
// ======================================================================

export function buildLobby(scene) {
  const g = new THREE.Group();
  g.name = 'lobby';
  // lantai granit lobby
  const marble = T.lobbyMarble().clone();
  marble.needsUpdate = true;
  marble.wrapS = marble.wrapT = THREE.RepeatWrapping;
  marble.repeat.set(90 / 2.4, 60 / 2.4);
  const floorM = new THREE.MeshPhysicalMaterial({ map: marble, roughness: 0.16, clearcoat: 0.4, clearcoatRoughness: 0.12 });
  const floor = mesh(new THREE.PlaneGeometry(90, 60), floorM, { rx: -Math.PI / 2, cast: false });
  g.add(floor);

  // kolom lobby (diletakkan di luar jalur pandang utama booth)
  const colM = M.paint('#efece6', 0.35);
  const colGeo = new THREE.CylinderGeometry(0.45, 0.45, 9, 40);
  [[-24, -8], [-8, -8], [8, -8], [24, -8], [-24, 18], [-8, 18], [8, 18], [24, 18]].forEach(([x, z]) => {
    g.add(mesh(colGeo, colM, { x, y: 4.5, z }));
    g.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 40), M.metal('#b8a77e', 0.35), { x, y: 0.06, z }));
  });

  // plafon lobby + downlight
  const ceil = mesh(new THREE.PlaneGeometry(90, 60), M.paint('#f3f1ec', 0.9), { y: 9, rx: Math.PI / 2, cast: false, receive: false });
  ceil.name = 'lobby-ceiling';
  g.add(ceil);
  const dlM = M.emissive('#fff6e8', 3.5);
  const dlGeo = new THREE.CircleGeometry(0.12, 20);
  for (let x = -36; x <= 36; x += 4) for (let z = -20; z <= 24; z += 4) {
    if (Math.abs(z) < 5 && Math.abs(x) < 17) continue;
    g.add(mesh(dlGeo, dlM, { x, y: 8.98, z, rx: Math.PI / 2, cast: false, receive: false }));
  }
  // skylight atrium di atas area booth
  const skyM = new THREE.MeshBasicMaterial({ color: '#eef5fb' });
  const sky = mesh(new THREE.PlaneGeometry(36, 12), skyM, { y: 8.97, rx: Math.PI / 2, cast: false, receive: false });
  sky.name = 'skylight';
  sky.userData = { mat: skyM };
  g.add(sky);
  for (let x = -18; x <= 18; x += 3) {
    const bm = mesh(box(0.08, 0.25, 12), M.paint('#d8d8d8', 0.5, 0.4), { x, y: 8.85, cast: false });
    bm.name = 'skylight-beam';
    g.add(bm);
  }

  // fasad kaca belakang + kota
  const cityM = new THREE.MeshBasicMaterial({ map: T.cityFacade() });
  g.add(mesh(new THREE.PlaneGeometry(90, 14), cityM, { y: 6, z: -22, cast: false, receive: false }));
  const mull = M.paint('#3a3f45', 0.4, 0.6);
  for (let x = -44; x <= 44; x += 2.5) g.add(mesh(box(0.08, 9, 0.12), mull, { x, y: 4.5, z: -14, cast: false }));
  g.add(mesh(box(90, 0.15, 0.2), mull, { y: 3.2, z: -14, cast: false }));
  g.add(mesh(new THREE.PlaneGeometry(90, 9), M.glass(), { y: 4.5, z: -14.02, cast: false, receive: false }));

  // tenant sesuai denah brief (sisi seberang booth di seberang concourse lobby z=+19.5)
  const tenants = [
    { name: 'Bank INA', x0: -16, x1: -8, bg: '#0f3d6e', fg: '#ffffff' },
    { name: 'Bellamama', x0: -7, x1: 3, bg: '#f4e3c6', fg: '#6a3e1d' },
    { name: 'Warunk Upnormal', x0: 4, x1: 16, bg: '#1d1d1d', fg: '#ffd21f' },
  ];
  tenants.forEach(t => {
    const w = t.x1 - t.x0, cx = (t.x0 + t.x1) / 2;
    const tg = new THREE.Group();
    // dinding atas tenant dari y=3.9 sampai plafon y=9
    tg.add(mesh(box(w, 5.1, 0.3), M.paint('#e7e3dc', 0.6), { y: 6.45, z: 0 }));
    // signage tenant
    tg.add(mesh(new THREE.PlaneGeometry(w - 0.6, 0.7), M.lightbox(T.tenantSign(t.name, t.bg, t.fg), 1.1), { y: 3.55, z: -0.16, ry: Math.PI, cast: false }));
    // kaca etalase tenant
    tg.add(mesh(new THREE.PlaneGeometry(w - 0.4, 3.2), M.glass(), { y: 1.6, z: -0.05, ry: Math.PI, cast: false }));
    tg.add(mesh(new THREE.PlaneGeometry(w - 0.4, 3.2), M.emissive('#f6efe2', 0.35, '#3a342c'), { y: 1.6, z: 0.4, ry: Math.PI, cast: false }));
    for (let x = -w / 2 + 0.2; x <= w / 2; x += (w - 0.4) / 3) tg.add(mesh(box(0.06, 3.2, 0.08), mull, { x, y: 1.6, z: -0.05 }));
    tg.position.set(cx, 0, 19.5);
    g.add(tg);
  });
  // Lobby SPIT (kiri) & Indomaret Point (kanan)
  const spit = new THREE.Group();
  spit.add(mesh(box(0.3, 4, 10), M.paint('#e7e3dc', 0.6), { y: 2 }));
  spit.add(mesh(new THREE.PlaneGeometry(6, 0.8), M.lightbox(T.tenantSign('Lobby SPIT', '#2b2b2b', '#ffffff'), 1.0), { x: 0.16, y: 3.3, ry: Math.PI / 2, cast: false }));
  for (let i = 0; i < 4; i++) {
    spit.add(mesh(rbox(0.25, 1.0, 1.1, 0.03), M.metal('#c9cdd2', 0.25), { x: 1.4, y: 0.5, z: -1.8 + i * 1.2 }));
    spit.add(mesh(new THREE.PlaneGeometry(0.9, 0.6), M.glass(), { x: 1.4, y: 1.0, z: -1.2 + i * 1.2, ry: Math.PI / 2, cast: false }));
  }
  spit.position.set(-21, 0, 1);
  g.add(spit);
  const ind = new THREE.Group();
  ind.add(mesh(box(0.3, 4.2, 10), M.paint('#e7e3dc', 0.6), { y: 2.1 }));
  ind.add(mesh(new THREE.PlaneGeometry(6, 0.8), M.lightbox(T.tenantSign('Indomaret Point', '#0d4ea6', '#ffd21f'), 1.0), { x: -0.16, y: 3.3, ry: -Math.PI / 2, cast: false }));
  ind.add(mesh(new THREE.PlaneGeometry(7, 2.8), M.emissive('#f6f1e6', 0.45, '#2d2a26'), { x: -0.17, y: 1.5, ry: -Math.PI / 2, cast: false }));
  ind.position.set(21, 0, 1);
  g.add(ind);

  // pot tanaman lobby
  const potM = M.paint('#3a3a38', 0.6);
  const leafM = M.paint('#2f6b3a', 0.7);
  [[-18, -4], [18, -4], [-18, 6], [18, 6], [-9.5, 7.5], [9.5, 7.5]].forEach(([x, z]) => {
    const p = new THREE.Group();
    p.add(mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.7, 24), potM, { y: 0.35 }));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      p.add(mesh(new THREE.SphereGeometry(0.22, 10, 8), leafM, { x: Math.cos(a) * 0.18, y: 0.95 + (i % 3) * 0.22, z: Math.sin(a) * 0.18, sy: 1.6, sx: 0.5, rz: Math.cos(a) * 0.5, rx: Math.sin(a) * 0.5 }));
    }
    p.position.set(x, 0, z);
    g.add(p);
  });

  scene.add(g);
  return g;
}

/** Karpet hitam proteksi lantai: area booth 30x4 m + 1 m semua sisi = 32 x 6 m */
export function buildCarpet(scene) {
  const g = new THREE.Group();
  g.name = 'karpet';
  const t = T.carpetBlack();
  g.add(mesh(new THREE.PlaneGeometry(32, 6), new THREE.MeshStandardMaterial({ map: t, roughness: 0.98, color: '#ffffff' }), { y: 0.004, rx: -Math.PI / 2, cast: false }));
  // lakban hitam di tepi karpet
  const tape = M.paint('#0b0b0b', 0.35);
  g.add(mesh(box(32.05, 0.002, 0.05), tape, { y: 0.006, z: 3, cast: false }));
  g.add(mesh(box(32.05, 0.002, 0.05), tape, { y: 0.006, z: -3, cast: false }));
  g.add(mesh(box(0.05, 0.002, 6.05), tape, { x: 16, y: 0.006, cast: false }));
  g.add(mesh(box(0.05, 0.002, 6.05), tape, { x: -16, y: 0.006, cast: false }));
  scene.add(g);
  registerAsset({
    code: 'S01', name: 'Karpet Proteksi Hitam 32 x 6 m', zone: 'S', object: g,
    spec: ['Karpet needle punch hitam + lakban hitam di semua sambungan', 'Lebih 1 m dari booth di semua sisi (aturan gedung)', 'Luas 192 m²'],
    focus: { pos: [0, 16, 14], target: [0, 0, 0] },
  });
  return g;
}

/**
 * Shell booth: platform, dinding belakang (segmen berwarna), kanopi, fascia,
 * kolom, rel track light + spotlight.
 * segments: [{x0,x1,color|mat}], endWalls: {left:{...}, right:{...}}
 */
export function buildShell(scene, cfg) {
  const { x0, x1, floorTex, segments, name, spots = [] } = cfg;
  const W = x1 - x0, cx = (x0 + x1) / 2;
  const g = new THREE.Group();
  g.name = name;

  // --- platform 10 cm + nosing aluminium ---
  const ft = floorTex.clone();
  ft.needsUpdate = true;
  ft.wrapS = ft.wrapT = THREE.RepeatWrapping;
  ft.repeat.copy(floorTex.repeat);
  const floorM = new THREE.MeshPhysicalMaterial({ map: ft, roughness: 0.42, clearcoat: 0.2, clearcoatRoughness: 0.4 });
  g.add(mesh(box(W, PH - 0.006, 4), M.paint('#6b6b6b', 0.6), { x: cx, y: (PH - 0.006) / 2 }));
  g.add(mesh(new THREE.PlaneGeometry(W, 4), floorM, { x: cx, y: PH, rx: -Math.PI / 2, cast: false }));
  g.add(mesh(box(W, 0.02, 0.03), M.metal('#9a9da1', 0.3), { x: cx, y: PH - 0.008, z: 2.005 }));
  // ramp landai 30 cm di depan (aksesibilitas + aman tersandung)
  const rampGeo = new THREE.BufferGeometry();
  const rv = new Float32Array([
    -W / 2, PH, 0, W / 2, PH, 0, -W / 2, 0.004, 0.3,
    W / 2, PH, 0, W / 2, 0.004, 0.3, -W / 2, 0.004, 0.3,
  ]);
  rampGeo.setAttribute('position', new THREE.BufferAttribute(rv, 3));
  rampGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(12), 2));
  rampGeo.computeVertexNormals();
  g.add(mesh(rampGeo, M.paint('#5d5d5d', 0.7), { x: cx, z: 2.02 }));

  // --- dinding belakang per segmen ---
  const wallH = 2.36, wallT = 0.12;
  segments.forEach(s => {
    const w = s.x1 - s.x0;
    const m = s.mat || M.paint(s.color, s.rough ?? 0.75);
    g.add(mesh(box(w, wallH, wallT), m, { x: (s.x0 + s.x1) / 2, y: PH + wallH / 2, z: -2 + wallT / 2 }));
  });
  // belakang dinding (sisi lobby) putih rapi
  g.add(mesh(new THREE.PlaneGeometry(W, wallH), M.paint('#f2f1ee', 0.8), { x: cx, y: PH + wallH / 2, z: -2.001, ry: Math.PI, cast: false }));

  // --- kanopi ---
  const canopyY = MAX_H - 0.12; // underside
  const white = M.paint('#f7f6f3', 0.6);
  const canopyRoof = mesh(box(W, 0.12, 4.0), white, { x: cx, y: MAX_H - 0.06, z: 0 });
  canopyRoof.name = 'canopy-roof';
  g.add(canopyRoof);
  // fascia depan & samping (tinggi 18 cm, memberikan clearance 2,32 m bebas halangan)
  const fH = 0.18;
  g.add(mesh(box(W, fH, 0.08), white, { x: cx, y: MAX_H - fH / 2, z: 2 - 0.04 }));
  // lis LED hangat di bawah fascia (wash ke area dalam)
  g.add(mesh(box(W - 0.2, 0.012, 0.03), M.emissive('#ffe2b0', 3.5), { x: cx, y: MAX_H - fH - 0.006, z: 1.93, cast: false }));
  // cove LED di pertemuan kanopi-dinding
  g.add(mesh(box(W - 0.1, 0.02, 0.04), M.emissive('#ffe8c2', 4.5), { x: cx, y: canopyY - 0.03, z: -1.86, cast: false }));

  // kolom ramping 6x6 cm hanya di ujung booth (portal frame perimeter — frontage terbuka penuh)
  const colM = M.paint('#f2f2f0', 0.5, 0.2);
  [x0 + 0.04, x1 - 0.04].forEach(x => {
    g.add(mesh(box(0.06, MAX_H - fH - PH, 0.06), colM, { x, y: PH + (MAX_H - fH - PH) / 2, z: 1.93 }));
  });

  // --- rel track light ---
  const railM = M.paint('#141414', 0.4, 0.4);
  const rails = [-0.9, 0.85];
  const heads = [];
  rails.forEach((z, ri) => {
    g.add(mesh(box(W - 0.6, 0.035, 0.035), railM, { x: cx, y: canopyY - 0.018, z }));
    const step = ri === 0 ? 1.0 : 1.5;
    for (let x = x0 + 0.6; x <= x1 - 0.5; x += step) {
      const h = trackHead();
      h.position.set(x, canopyY - 0.035, z);
      // arahkan: rel belakang ke dinding, rel depan ke lantai/area tengah
      const tgt = ri === 0 ? new THREE.Vector3(x, 1.3, -2) : new THREE.Vector3(x, 0.6, -0.5);
      const head = h.userData.head;
      const dir = tgt.clone().sub(h.position.clone().add(new THREE.Vector3(0, -0.09, 0))).normalize();
      h.rotation.y = Math.atan2(dir.x, dir.z);
      head.rotation.x = -Math.asin(dir.y) * 1 + 0;
      head.rotation.x = Math.atan2(-dir.y, Math.hypot(dir.x, dir.z));
      g.add(h);
      heads.push({ x, z, tgt });
    }
  });

  // spotlights nyata: dipilih supaya ringan tapi akurat
  const lights = new THREE.Group();
  spots.forEach((s, i) => {
    const L = new THREE.SpotLight(s.color || '#ffe9cf', s.intensity ?? 9, s.distance ?? 7, s.angle ?? 0.5, s.penumbra ?? 0.65, 2);
    L.position.set(s.x, canopyY - 0.15, s.z ?? -0.9);
    L.target.position.set(s.tx ?? s.x, s.ty ?? 1.2, s.tz ?? -2);
    L.castShadow = !!s.shadow;
    if (L.castShadow) {
      L.shadow.mapSize.set(1024, 1024);
      L.shadow.bias = -0.0004;
      L.shadow.normalBias = 0.02;
      L.shadow.radius = 4;
    }
    lights.add(L, L.target);
  });
  // wash dinding belakang (area light lembut)
  const wash = new THREE.RectAreaLight('#ffe7c8', cfg.wash ?? 4.8, W - 0.4, 0.6);
  wash.position.set(cx, canopyY - 0.1, -1.2);
  wash.lookAt(cx, 0.8, -2.2);
  lights.add(wash);
  // fill dari kanopi ke lantai
  const fill = new THREE.RectAreaLight('#fff1de', cfg.fill ?? 3.5, W - 0.6, 3.0);
  fill.position.set(cx, canopyY - 0.02, 0.2);
  fill.rotation.x = -Math.PI / 2;
  lights.add(fill);
  g.add(lights);

  scene.add(g);
  return { group: g, canopyY, heads };
}

/** Dinding ujung (samping) booth */
export function endWall(x, faceDir, color, o = {}) {
  const g = new THREE.Group();
  const H = 2.36, D = o.depth ?? 4.0, t = 0.12;
  g.add(mesh(box(t, H, D), M.paint(color, 0.75), { x: x + faceDir * -t / 2, y: PH + H / 2, z: -2 + D / 2 }));
  // sambungan ke kanopi
  g.add(mesh(box(t + 0.02, MAX_H - PH - H, D), M.paint('#f7f6f3', 0.6), { x: x + faceDir * -t / 2, y: PH + H + (MAX_H - PH - H) / 2, z: -2 + D / 2 }));
  return g;
}
