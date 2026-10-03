import * as THREE from 'three';
import { M, P } from './core/mat.js';
import { mesh, rbox, box, PH, registerAsset, bake, rng } from './core/util.js';
import * as T from './core/tex.js';
import * as PR from './props.js';
import { buildShell, endWall } from './structure.js';
import { createPerson, pose, makeStandee, SKIN, HAIR } from './people.js';

const WALL = -1.88;
export const H2H = ['Jiwoo', 'Carmen', 'Ian', 'A-na', 'Stella', 'Juun', 'Ye-on', 'Yuha'];

function addAsset(scene, code, name, object, spec, focus) {
  object.name = code;
  scene.add(object);
  registerAsset({ code, name, zone: 'B', object, spec, focus });
  return object;
}

const LOCKER_COLORS = ['#f4b3c8', '#a9c8f2', '#cbbcf0', '#a9c8f2', '#f4b3c8', '#cbbcf0'];

/** 1 modul loker sekolah 40 x 45 x 230 cm (pintu tinggi) */
function lockerModule(color, seed, open = 0) {
  const g = new THREE.Group();
  const W = 0.4, D = 0.45, H = 2.2, base = 0.08;
  const body = M.gloss(color, 0.35);
  g.add(mesh(box(W, H, D), body, { y: base + H / 2 }));
  g.add(mesh(box(W, base, D - 0.04), M.paint('#3b3f4a', 0.6), { y: base / 2, z: -0.02 }));
  // pintu (engsel di kiri)
  const door = new THREE.Group();
  const dm = M.print(T.lockerDoor(color, seed), 0.38);
  door.add(mesh(box(W - 0.03, H - 0.06, 0.018), dm, { x: (W - 0.03) / 2 }));
  // handle + gembok
  door.add(mesh(rbox(0.03, 0.12, 0.025, 0.01), M.chrome(), { x: W - 0.07, y: -0.05, z: 0.02 }));
  if (seed % 3 === 0) {
    door.add(mesh(rbox(0.035, 0.045, 0.02, 0.008), M.metal('#c9a53a', 0.3), { x: W - 0.07, y: -0.15, z: 0.025 }));
    door.add(mesh(new THREE.TorusGeometry(0.012, 0.003, 6, 16, Math.PI), M.chrome(), { x: W - 0.07, y: -0.125, z: 0.025 }));
  }
  door.position.set(-W / 2 + 0.015, base + H / 2, D / 2 + 0.01);
  door.rotation.y = -open;
  g.add(door);
  if (open > 0) {
    // isi loker kejutan
    g.add(mesh(box(W - 0.04, H - 0.1, 0.01), M.paint('#2a2d36', 0.7), { y: base + H / 2, z: D / 2 - 0.005 }));
    g.add(mesh(box(W - 0.05, 0.015, D - 0.06), M.paint('#e7e7e7', 0.5), { y: base + 1.2, z: 0 }));
    g.add(mesh(box(W - 0.05, 0.015, D - 0.06), M.paint('#e7e7e7', 0.5), { y: base + 1.65, z: 0 }));
    g.add(PR.snackPack(T.jetzPack(['sweet', 'tortilla', 'croissant'][seed % 3]), { w: 0.16, h: 0.24, d: 0.06, y: base + 1.33, z: 0.08, rx: -0.15 }));
    g.add(PR.keychain('pack', seed).translateY(base + 1.6).translateZ(0.12));
    g.add(PR.keychain('heart', seed + 1).translateX(0.08).translateY(base + 1.6).translateZ(0.12));
    g.add(mesh(new THREE.PlaneGeometry(0.28, 0.2), M.print(T.smallSign(['KAMU', 'MENANG!', 'tukar di kasir'], { w: 512, h: 360, bg: '#ffe066', color: '#16213e', bigIndex: 1 }), 0.5), { y: base + 1.9, z: 0.0, rx: -0.1 }));
  }
  return g;
}

export function buildJetz(scene) {
  const zone = new THREE.Group();
  zone.name = 'ZonaJetZ';
  scene.add(zone);

  // ------------------------------------------------------------------
  // SHELL — classroom vibes, biru dengan aksen pink (brief hal. 14)
  // ------------------------------------------------------------------
  const shell = buildShell(zone, {
    name: 'B00-shell', x0: 0, x1: 15, floorTex: T.classroomTiles(),
    segments: [
      { x0: 0, x1: 5.5, mat: M.print(T.doodleWall('#b7cdf3', 4), 0.8) },
      { x0: 5.5, x1: 9.6, color: P.butter },
      { x0: 9.6, x1: 15, mat: M.print(T.doodleWall('#cdc4f2', 9), 0.8) },
    ],
    spots: [
      { x: 2.9, z: 0.85, tx: 2.9, ty: 0.9, tz: -1.05, intensity: 10, angle: 0.65, shadow: true },
      { x: 7.5, z: 0.85, tx: 7.5, ty: 1.1, tz: -1.2, intensity: 9, angle: 0.55, shadow: true },
      { x: 6.4, tx: 6.6, ty: 1.4, intensity: 5, color: '#ffd6e8' },
      { x: 8.6, tx: 8.4, ty: 1.4, intensity: 5, color: '#cfe6ff' },
      { x: 11.0, tx: 11.0, ty: 1.2, intensity: 9 },
      { x: 11.3, z: 0.85, tx: 11.3, ty: 0.75, tz: 0.55, intensity: 10, angle: 0.6, shadow: true },
      { x: 13.8, z: 0.85, tx: 13.8, ty: 1.0, tz: 0.3, intensity: 7 },
      { x: 13.6, tx: 13.6, ty: 1.6, intensity: 4 },
    ],
  });
  registerAsset({
    code: 'B00', name: 'Struktur Booth JetZ 15 x 4 x 2,5 m', zone: 'B', object: shell.group,
    spec: ['Platform 10 cm + vinyl motif ubin kelas 30x30 cm (biru-krem)', 'Dinding MDF cat + wallpaper doodle (bintang, hati) biru & lavender', 'Panel tengah kuning butter untuk stage', 'Kanopi putih 2,50 m, track light 2 rel, LED cove'],
    focus: { pos: [7.5, 2.2, 9.5], target: [7.5, 1.1, -0.5] },
  });
  // dinding ujung kanan
  const ew = endWall(15, 1, '#cdc4f2');
  // papan kapur menu paket di dinding kanan
  const chalk = new THREE.Group();
  chalk.add(mesh(rbox(0.04, 0.82, 1.08, 0.01), M.wood('oak', [1, 1], 0.5), {}));
  chalk.add(mesh(new THREE.PlaneGeometry(1.0, 0.75), M.print(T.chalkMenu(), 0.85), { x: -0.021, ry: -Math.PI / 2 }));
  chalk.add(mesh(box(0.06, 0.02, 0.9), M.wood('oak', [1, 1], 0.5), { x: -0.03, y: -0.42 }));
  chalk.position.set(14.86, PH + 1.45, -0.55);
  ew.add(chalk);
  const jl = T.canvasTex(512, 256, (ctx, w, h) => { ctx.clearRect(0, 0, w, h); T.drawJetzLogo(ctx, w / 2, h / 2, 140); });
  ew.add(mesh(new THREE.PlaneGeometry(0.9, 0.45), M.print(jl, 0.5, { transparent: true }), { x: 14.875, y: PH + 2.05, z: 0.9, ry: -Math.PI / 2, cast: false }));
  zone.add(ew);

  // ------------------------------------------------------------------
  // B01 — Locker Side A (dinding belakang 4,8 m) + Side B (pembatas)
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const open = i === 3 ? 1.0 : i === 9 ? 0.8 : 0;
      const m = lockerModule(LOCKER_COLORS[i % LOCKER_COLORS.length], i + 1, open);
      m.position.set(0.55 + 0.2 + i * 0.4, PH, WALL + 0.225 + 0.002);
      g.add(m);
    }
    // papan kelas gantung (protruding)
    const cs = new THREE.Group();
    cs.add(mesh(rbox(0.02, 0.18, 0.56, 0.01), M.paint('#ffffff', 0.5), {}));
    cs.add(mesh(new THREE.PlaneGeometry(0.54, 0.17), M.print(T.classSign(), 0.5), { x: 0.011, ry: Math.PI / 2 }));
    cs.add(mesh(new THREE.PlaneGeometry(0.54, 0.17), M.print(T.classSign(), 0.5), { x: -0.011, ry: -Math.PI / 2 }));
    [-0.2, 0.2].forEach(z => cs.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 6), M.chrome(), { y: 0.16, z })));
    cs.position.set(5.48, PH + 2.03, -1.35);
    g.add(cs);
    addAsset(zone, 'B01', 'Locker Side A + "Loker Kejutan"', g,
      ['Loker existing JetZ (pick up dari Cirebon → SPIT, kembali ke Cikokol)', 'Side A: 12 modul @40 cm = 4,8 m, tinggi 2,3 m', 'Warna pink / baby blue / lavender, stiker doodle', '2 pintu bisa dibuka: isi snack, charm & kartu "Kamu Menang!" (aktivitas motorik)', 'Papan kelas gantung "KELAS 2-H"'],
      { pos: [2.9, 1.5, 2.8], target: [2.9, 1.2, -1.6] });
  }
  {
    const g = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const m = lockerModule(LOCKER_COLORS[(i + 2) % LOCKER_COLORS.length], 20 + i, 0);
      m.rotation.y = Math.PI / 2;
      m.position.set(0.225 + 0.002, PH, -1.43 + 0.2 + i * 0.4);
      g.add(m);
    }
    addAsset(zone, 'B02', 'Locker Side B — Pembatas Chitato | JetZ', g,
      ['Sesuai brief: loker jadi pembatas antara Chitato dan JetZ', 'Side B: 8 modul (3,2 m) menghadap area JetZ', '4 modul sisa dipakai sebagai gudang stok di belakang kasir', 'Sisi Chitato ditutup panel amber + logo'],
      { pos: [3.2, 1.6, 1.6], target: [0.3, 1.1, 0.0] });
  }

  // ------------------------------------------------------------------
  // B03 — Standee 8 member Hearts2Hearts 165 cm (depan Side A)
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const outfits = [
      { top: 'blazer', c: '#5f6a7d', c2: '#4b5566', tie: '#ff7eb6', skirt: '#7d8aa8', hair: 'long', hc: '#231915' },
      { top: 'cardigan', c: '#f6c6d8', c2: '#f6c6d8', tie: null, skirt: '#9fb3d8', hair: 'longwave', hc: '#3b2a20' },
      { top: 'blazer', c: '#2c3e66', c2: '#22325a', tie: '#ffffff', skirt: '#8aa6d8', hair: 'bob', hc: '#141110' },
      { top: 'vest', c: '#cfe0ff', c2: '#cfe0ff', tie: '#1460d8', skirt: '#7d8aa8', hair: 'ponytail', hc: '#5a3d2a' },
      { top: 'blazer', c: '#5f6a7d', c2: '#4b5566', tie: '#ff7eb6', skirt: '#9fb3d8', hair: 'long', hc: '#2b2340' },
      { top: 'cardigan', c: '#cbbcf0', c2: '#cbbcf0', tie: null, skirt: '#7d8aa8', hair: 'longwave', hc: '#231915' },
      { top: 'vest', c: '#f4b3c8', c2: '#f4b3c8', tie: '#1460d8', skirt: '#8aa6d8', hair: 'bun', hc: '#3b2a20' },
      { top: 'blazer', c: '#2c3e66', c2: '#22325a', tie: '#ffffff', skirt: '#9fb3d8', hair: 'long', hc: '#141110' },
    ];
    H2H.forEach((n, i) => {
      const o = outfits[i];
      const p = createPerson({
        gender: 'f', height: 1.65, skin: SKIN[i % 3 === 0 ? 4 : i % 3],
        hair: { style: o.hair, color: o.hc },
        top: { type: o.top, color: o.c, color2: o.c2, sleeve: 'long', tie: o.tie },
        bottom: { type: 'skirt', color: o.skirt, pattern: 'plaid', lineColor: '#2a3a6a', length: 0.42, flare: 1.15, socks: '#ffffff' },
        shoes: { color: '#2a2020', sole: '#2a2020' },
      });
      const poses = ['stand', 'peace', 'stand', 'heart', 'peace', 'stand', 'wave', 'peace'];
      pose(p, poses[i], { tilt: i % 2 ? 0.15 : -0.1 });
      const st = makeStandee(p, { name: n, theme: 'jetz' });
      st.position.set(0.95 + i * 0.585, PH, -0.95);
      g.add(st);
    });
    addAsset(zone, 'B03', 'Standee 8 Member Hearts2Hearts 165 cm', g,
      ['Foamboard 5 mm cetak UV, potong kontur, tinggi 165 cm (brief)', 'Semua 8 member: ' + H2H.join(', '), 'Outfit seragam sekolah (classroom vibes)', 'Pelat nama biru JetZ di kaki standee', 'Visual figur = ilustrasi pengganti foto resmi'],
      { pos: [3.0, 1.4, 2.4], target: [3.0, 1.0, -1.05] });
  }

  // ------------------------------------------------------------------
  // B04 — Giant Headphone Stage + Main Stage DJ desk (silent disco)
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const cx = 0;
    // panggung bulat
    g.add(mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 64, 1, false, -Math.PI / 2, Math.PI), M.paint('#fff6e6', 0.45), { y: 0.05, z: -0.468 }));
    g.add(mesh(new THREE.TorusGeometry(1.6, 0.012, 8, 96, Math.PI), M.neon('#ff9cc8', 3), { y: 0.06, z: -0.468, rx: Math.PI / 2, cast: false }));
    // lingkaran pink di dinding
    g.add(mesh(new THREE.CircleGeometry(0.95, 64), M.paint('#f7a8c8', 0.7), { y: 1.33, z: -0.468, cast: false }));
    g.add(mesh(new THREE.RingGeometry(0.95, 1.0, 64), M.paint('#ffffff', 0.6), { y: 1.33, z: -0.466, cast: false }));
    // headband
    const Rb = 1.25;
    const yC = 0.82;
    g.add(mesh(new THREE.TorusGeometry(Rb, 0.15, 24, 96, Math.PI), M.gloss('#f6b8cf', 0.3), { y: yC, z: -0.2 }));
    g.add(mesh(new THREE.TorusGeometry(Rb - 0.15, 0.06, 16, 96, Math.PI), M.gloss('#fff3d6', 0.35), { y: yC, z: -0.05 }));
    g.add(mesh(new THREE.TorusGeometry(Rb - 0.24, 0.016, 10, 120, Math.PI), M.neon('#9fd8ff', 3.5), { y: yC, z: -0.02, cast: false }));
    g.add(mesh(new THREE.TorusGeometry(Rb + 0.16, 0.012, 10, 120, Math.PI), M.neon('#ffc2dc', 2.5), { y: yC, z: -0.2, cast: false }));
    // earcup kiri-kanan
    [-1, 1].forEach(s => {
      const cup = new THREE.Group();
      cup.add(mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.34, 64), M.gloss('#f6b8cf', 0.3), { rz: Math.PI / 2 }));
      cup.add(mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 64), M.gloss('#fff3d6', 0.35), { x: s * 0.2, rz: Math.PI / 2 }));
      cup.add(mesh(new THREE.TorusGeometry(0.38, 0.1, 18, 64), M.velvet('#f8d77a'), { x: -s * 0.2, ry: Math.PI / 2 }));
      cup.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 48), M.paint('#e9b9cf', 0.8), { x: -s * 0.2, rz: Math.PI / 2 }));
      cup.add(mesh(new THREE.TorusGeometry(0.52, 0.012, 8, 80), M.neon('#9fd8ff', 2.4), { x: s * 0.172, ry: Math.PI / 2, cast: false }));
      // penyangga
      cup.add(mesh(rbox(0.3, 0.3, 0.3, 0.04), M.paint('#f2f0ea', 0.5), { y: -0.55 }));
      cup.position.set(s * Rb, yC - 0.02, -0.2);
      g.add(cup);
    });
    // DJ desk = Main Stage POSM
    const desk = new THREE.Group();
    desk.add(mesh(rbox(1.5, 0.92, 0.55, 0.06), M.gloss('#ffffff', 0.25), { y: 0.46 }));
    desk.add(mesh(new THREE.PlaneGeometry(1.36, 0.7), M.print(T.mainStageJetz(), 0.45), { y: 0.47, z: 0.277 }));
    // outline neon biru
    const ol = new THREE.Shape();
    ol.moveTo(-0.72, 0.05); ol.lineTo(-0.72, 0.88); ol.lineTo(0.72, 0.88); ol.lineTo(0.72, 0.05);
    const pts = ol.getPoints(4).map(p => new THREE.Vector3(p.x, p.y, 0));
    desk.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05), 80, 0.012, 8, false), M.neon('#8fd3ff', 3.2), { z: 0.285, cast: false }));
    // controller
    const ctrl = new THREE.Group();
    ctrl.add(mesh(rbox(0.72, 0.05, 0.38, 0.015), M.paint('#121214', 0.35, 0.3), {}));
    [-0.22, 0.22].forEach(x => {
      ctrl.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.015, 40), M.paint('#2a2a2e', 0.25, 0.7), { x, y: 0.03, z: -0.02 }));
      ctrl.add(mesh(new THREE.TorusGeometry(0.1, 0.004, 6, 40), M.emissive('#ff7eb6', 2.2), { x, y: 0.038, z: -0.02, rx: Math.PI / 2, cast: false }));
      for (let i = 0; i < 4; i++) ctrl.add(mesh(rbox(0.04, 0.01, 0.04, 0.005), M.emissive(i % 2 ? '#7fd3ff' : '#ff7eb6', 1.4, '#222'), { x: x - 0.09 + i * 0.06, y: 0.03, z: 0.13, cast: false }));
    });
    for (let i = 0; i < 3; i++) ctrl.add(mesh(rbox(0.012, 0.02, 0.03, 0.004), M.paint('#dddddd', 0.4), { x: -0.03 + i * 0.03, y: 0.035, z: 0.08 }));
    for (let i = 0; i < 9; i++) ctrl.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.015, 10), M.paint('#cccccc', 0.4), { x: -0.04 + (i % 3) * 0.04, y: 0.035, z: -0.12 + Math.floor(i / 3) * 0.05 }));
    ctrl.position.set(0, 0.945, -0.02);
    desk.add(ctrl);
    // laptop
    const lap = new THREE.Group();
    lap.add(mesh(rbox(0.32, 0.012, 0.22, 0.006), M.metal('#c0c3c7', 0.3), {}));
    const lid = new THREE.Group();
    lid.add(mesh(rbox(0.32, 0.22, 0.008, 0.006), M.metal('#c0c3c7', 0.3), { y: 0.11 }));
    lid.add(mesh(new THREE.PlaneGeometry(0.29, 0.19), M.emissive('#9fd0ff', 0.9, '#0b0b10'), { y: 0.11, z: 0.0045, cast: false }));
    lid.position.set(0, 0.006, -0.11);
    lid.rotation.x = -0.25;
    lap.add(lid);
    lap.position.set(0.5, 0.93, 0.0);
    lap.rotation.y = -0.4;
    desk.add(lap);
    desk.position.set(0, 0.1, 0.55);
    g.add(desk);
    g.position.set(7.55, PH, WALL + 0.47);
    addAsset(zone, 'B04', 'Giant Headphone Stage + Main Stage (Silent Disco)', g,
      ['Headphone raksasa: rangka besi + EPS foam + fiberglass, cat duco pink pastel & krem', 'Lebar ±3,1 m, puncak 2,20 m, earcup Ø 104 cm', 'LED neon flex biru muda & pink di headband dan earcup', 'Panggung bulat Ø 2,9 m x 10 cm + LED pink di tepi', 'Main Stage POSM 150 x 55 x 92 cm + DJ controller & laptop', 'Konsep Silent Disco — patuh aturan gedung "tidak boleh ada suara dominan"'],
      { pos: [7.55, 1.5, 3.4], target: [7.55, 1.2, -1.2] });
  }
  {
    const g = PR.headphoneRack(8);
    g.position.set(9.35, PH, 1.0);
    g.rotation.y = -0.5;
    addAsset(zone, 'B05', 'Rak Headphone Silent Disco', g,
      ['8 headphone wireless (pink, biru, putih, lavender)', 'Tiang putih + papan info "Silent Disco"', 'Musik hanya terdengar di headphone (tanpa speaker)'],
      { pos: [9.9, 1.4, 2.6], target: [9.35, 1.0, 1.0] });
  }

  // ------------------------------------------------------------------
  // B06 — Header sign "JETZ × HEARTS2HEARTS"
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    const w = 2.7, h = 0.4, r = 0.2;
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2); s.lineTo(-w / 2 + r, h / 2); s.absarc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5);
    g.add(mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 24 }), M.paint('#fff8f2', 0.4), {}));
    g.add(mesh(new THREE.PlaneGeometry(2.45, 0.36), M.lightbox(T.headerJetz(), 1.15), { z: 0.092, cast: false }));
    const halo = new THREE.Shape();
    halo.moveTo(-w / 2 + r, -h / 2); halo.lineTo(w / 2 - r, -h / 2); halo.absarc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2); halo.lineTo(-w / 2 + r, h / 2); halo.absarc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5);
    const hp = halo.getPoints(40).map(p => new THREE.Vector3(p.x * 1.02, p.y * 1.08, 0));
    hp.push(hp[0].clone());
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp, true), 160, 0.012, 8, true), M.neon('#ffb48a', 2.6), { z: 0.04, cast: false }));
    g.position.set(12.25, PH + 2.03, WALL + 0.02);
    addAsset(zone, 'B06', 'Header Sign "JETZ × HEARTS2HEARTS"', g,
      ['Lightbox kapsul 270 x 40 x 8 cm, muka akrilik susu', 'Teks: JETZ × HEARTS2HEARTS / JETZREK-IN AJA!', 'Neon flex peach di tepi (halo)'],
      { pos: [12.25, 1.8, 2.0], target: [12.25, 2.1, -1.8] });
  }

  // ------------------------------------------------------------------
  // B07 — Rak merchandise biru (backpack paket, tote, kemasan)
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const W = 0.95, D = 0.36, H = 1.78;
    const fm = M.gloss('#9fc2f2', 0.35);
    [-1, 1].forEach(s => g.add(mesh(box(0.03, H, D), fm, { x: s * (W / 2 - 0.015), y: H / 2 })));
    g.add(mesh(box(W, H, 0.012), M.paint('#e3edfb', 0.6), { y: H / 2, z: -D / 2 + 0.006 }));
    g.add(mesh(box(W, 0.03, D), fm, { y: H - 0.015 }));
    const ys = [0.06, 0.48, 0.9, 1.32];
    ys.forEach((y, i) => {
      g.add(mesh(box(W - 0.06, 0.022, D - 0.02), M.paint('#ffffff', 0.4), { y }));
      g.add(mesh(box(W - 0.08, 0.008, 0.004), M.emissive('#fff0d8', 1.4), { y: y + 0.39, z: D / 2 - 0.03, cast: false }));
      if (i === 3) {
        for (let k = 0; k < 3; k++) { const b = PR.backpack(); b.position.set(-0.3 + k * 0.3, y + 0.012, -0.02); b.rotation.y = (k - 1) * 0.15; b.scale.setScalar(0.92); g.add(b); }
      } else if (i === 2) {
        const tx = [T.jetzPack('sweet'), T.jetzPack('croissant'), T.jetzPack('tortilla')];
        const row = PR.packRow([tx[0], tx[0], tx[1], tx[1], tx[2]], 5, { w: 0.16, h: 0.24, d: 0.06, gap: 0.02, seed: 31 });
        row.position.set(0, y + 0.012, 0.0); g.add(row);
      } else if (i === 1) {
        // paket siap jual dalam plastik repack bening (brief hal. 19)
        for (let k = 0; k < 3; k++) {
          const pk = new THREE.Group();
          pk.add(PR.backpack());
          pk.add(PR.snackPack(T.jetzPack('tortilla'), { w: 0.15, h: 0.22, d: 0.05, y: 0.2, z: 0.1, rx: -0.2 }));
          pk.add(PR.snackPack(T.jetzPack('sweet'), { w: 0.15, h: 0.22, d: 0.05, x: 0.08, y: 0.18, z: 0.12, rx: -0.25, ry: 0.2 }));
          pk.add(mesh(rbox(0.34, 0.44, 0.24, 0.04), M.acrylic('#f6fbff', 0.2), { y: 0.21, z: 0.03 }));
          pk.position.set(-0.3 + k * 0.3, y + 0.012, -0.02);
          pk.scale.setScalar(0.8);
          g.add(pk);
        }
      } else {
        const tx = [T.jetzPack('choco'), T.jetzPack('sweet')];
        const row = PR.packRow([tx[0], tx[1], tx[0], tx[1], tx[0]], 5, { w: 0.16, h: 0.24, d: 0.06, gap: 0.02, seed: 41 });
        row.position.set(0, y + 0.012, 0.0); g.add(row);
      }
    });
    g.add(mesh(new THREE.PlaneGeometry(0.5, 0.12), M.print(T.smallSign(['PAKET Rp35.000'], { w: 512, h: 128, bg: '#1460d8', color: '#ffffff', bigIndex: 0 }), 0.5), { y: 0.43, z: D / 2 + 0.002 }));
    g.position.set(10.25, PH, WALL + D / 2 + 0.01);
    addAsset(zone, 'B07', 'Rak Merchandise & Paket Selling', g,
      ['Rak MDF cat duco baby blue 95 x 36 x 178 cm, 4 ambalan + LED strip', 'Paket Rp35.000: 6 snack (1 Choco, 2 Sweet Stick, 2 Croissant, 1 Tortilla) + backpack hitam', 'Paket direpack dalam plastik bening (kebutuhan brief hal. 19)', 'Display backpack eksklusif di ambalan atas'],
      { pos: [10.6, 1.3, 1.4], target: [10.25, 1.0, -1.6] });
  }

  // ------------------------------------------------------------------
  // B08 — Pegboard gantungan kunci / charm (detail)
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const W = 1.0, H = 1.78;
    const fm = M.gloss('#f6b8cf', 0.35);
    [-1, 1].forEach(s => g.add(mesh(box(0.03, H, 0.3), fm, { x: s * (W / 2 - 0.015), y: H / 2 })));
    g.add(mesh(box(W, 0.03, 0.3), fm, { y: H - 0.015 }));
    const pb = T.pegboardTex('#ffd9e6').clone();
    pb.needsUpdate = true; pb.wrapS = pb.wrapT = THREE.RepeatWrapping; pb.repeat.set(2, 2.4);
    g.add(mesh(box(W - 0.06, 1.15, 0.012), new THREE.MeshStandardMaterial({ map: pb, roughness: 0.6 }), { y: 1.08, z: -0.1 }));
    // header
    g.add(mesh(new THREE.PlaneGeometry(0.9, 0.14), M.print(T.smallSign(['CHARM CORNER'], { w: 1024, h: 160, bg: '#ff7eb6', color: '#ffffff', bigIndex: 0 }), 0.45), { y: H - 0.12, z: -0.09 }));
    // hook + gantungan kunci: 6 kolom x 5 baris
    const types = ['heart', 'star', 'pack', 'letters', 'logo', 'tortilla', 'croissant', 'cloud'];
    const hooksBase = new THREE.Group();
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        const x = -0.375 + col * 0.15, y = 1.56 - row * 0.2;
        const hk = PR.pegHook(0.09);
        hk.position.set(x, y, -0.094);
        hooksBase.add(hk);
        // 2-3 charm per hook (berjejer di batang hook)
        const n = 2 + ((row + col) % 2);
        for (let k = 0; k < n; k++) {
          const t = types[(row * 6 + col + k) % types.length];
          const kc = PR.keychain(t, row * 31 + col * 7 + k);
          kc.position.set(x, y + 0.006, -0.094 + 0.03 + k * 0.022);
          kc.rotation.y = (k - 1) * 0.15;
          hooksBase.add(kc);
        }
        // label harga kecil
        if (col % 2 === 0) hooksBase.add(mesh(box(0.04, 0.02, 0.002), M.paint('#ffffff', 0.5), { x, y: y + 0.03, z: -0.09 + 0.093 }));
      }
    }
    g.add(bake(hooksBase));
    // ambalan bawah: kemasan
    g.add(mesh(box(W - 0.06, 0.022, 0.28), M.paint('#ffffff', 0.4), { y: 0.38 }));
    g.add(mesh(box(W - 0.06, 0.022, 0.28), M.paint('#ffffff', 0.4), { y: 0.05 }));
    const row = PR.packRow([T.jetzPack('tortilla'), T.jetzPack('croissant'), T.jetzPack('sweet'), T.jetzPack('choco'), T.jetzPack('tortilla')], 5, { w: 0.16, h: 0.24, d: 0.06, gap: 0.02, seed: 51 });
    row.position.set(0, 0.392, 0); g.add(row);
    const row2 = PR.packRow([T.jetzPack('sweet'), T.jetzPack('sweet'), T.jetzPack('croissant'), T.jetzPack('croissant'), T.jetzPack('choco')], 5, { w: 0.16, h: 0.24, d: 0.06, gap: 0.02, seed: 52 });
    row2.position.set(0, 0.062, 0); g.add(row2);
    g.position.set(11.35, PH, WALL + 0.16);
    addAsset(zone, 'B08', 'Pegboard Charm / Gantungan Kunci', g,
      ['Pegboard MDF berlubang 94 x 115 cm + rangka pink glossy', '30 hook krom, 2-3 charm per hook (±75 pcs display)', '8 tipe charm: hati, bintang, mini pack, manik huruf (S2U/H2H/JETZ/GESREK/RECEH), logo akrilik, tortilla, croissant, awan', 'Tiap charm: split ring + 3 mata rantai + jump ring', 'Ambalan bawah: kemasan 4 varian'],
      { pos: [11.35, 1.25, -0.4], target: [11.35, 1.15, -1.75] });
  }

  // ------------------------------------------------------------------
  // B09 — TV 55" + B10 Kasir JetZ (event desk)
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const tv = PR.screen(T.tvJetz(), 1.21, 0.68, { depth: 0.04, intensity: 1.2 });
    g.add(tv);
    g.add(mesh(box(0.3, 0.2, 0.04), M.paint('#222', 0.5), { z: -0.04 }));
    g.position.set(13.55, PH + 1.78, WALL + 0.06);
    addAsset(zone, 'B09', 'TV LED 55" (konten JetZ loop)', g,
      ['TV 55" + bracket dinding VESA', 'Konten: KV "JetZrek-in Aja!", TVC H2H, info paket', 'Pusat panel 1,88 m dari lantai'],
      { pos: [13.0, 1.7, 1.0], target: [13.55, 1.8, -1.8] });
  }
  {
    const g = new THREE.Group();
    g.add(PR.eventDesk('jetz'));
    const cs = PR.cashierSet('jetz'); cs.position.set(0.05, 1.0, -0.02); g.add(cs);
    // plastik repack + tumpukan paket di samping
    for (let k = 0; k < 2; k++) {
      const pk = new THREE.Group();
      pk.add(PR.backpack());
      pk.add(mesh(rbox(0.34, 0.42, 0.2, 0.04), M.acrylic('#f6fbff', 0.2), { y: 0.2 }));
      pk.position.set(-0.32 + k * 0.18, 1.0, 0.05);
      pk.scale.setScalar(0.55);
      g.add(pk);
    }
    // stok 4 modul loker sisa di belakang kasir
    for (let i = 0; i < 2; i++) {
      const lm = lockerModule(LOCKER_COLORS[i], 40 + i, 0);
      lm.scale.set(1, 0.48, 1);
      lm.position.set(-0.25 + i * 0.4, 0, -0.85);
      g.add(lm);
    }
    g.position.set(13.8, PH, 0.45);
    addAsset(zone, 'B10', 'Kasir JetZ / Event Desk', g,
      ['Event desk POSM existing 100 x 50 x 100 cm + header 200 cm', 'Tablet POS, EDC, QRIS', 'Paket backpack dalam plastik repack', 'Di belakang: modul loker sisa sebagai storage stok'],
      { pos: [13.3, 1.5, 2.8], target: [13.8, 1.0, 0.4] });
  }

  // ------------------------------------------------------------------
  // B11 — Meja Charm Making (mandatory brief) + 6 stool pastel
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const W = 2.3, D = 0.85, H = 0.75;
    const wood = M.wood('birch', [2, 1], 0.5);
    g.add(mesh(rbox(W, 0.035, D, 0.008), wood, { y: H - 0.0175 }));
    g.add(mesh(box(W - 0.2, 0.08, D - 0.2), M.paint('#e6d3b3', 0.6), { y: H - 0.075 }));
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => g.add(mesh(rbox(0.05, H - 0.035, 0.05, 0.01), wood, { x: sx * (W / 2 - 0.08), y: (H - 0.035) / 2, z: sz * (D / 2 - 0.08) })));
    // perlengkapan di atas meja
    const top = new THREE.Group();
    const trayKinds = ['mixed', 'beads', 'letters', 'mixed'];
    trayKinds.forEach((k, i) => { const tr = PR.beadTray(i + 1, k); tr.position.set(-0.85 + i * 0.57, 0, -0.05 + (i % 2) * 0.05); tr.rotation.y = (i % 2 ? 0.08 : -0.06); top.add(tr); });
    ['#ff7eb6', '#7fd3ff', '#ffe066', '#b9a6ff', '#ffffff'].forEach((c, i) => { const sp = PR.spool(c); sp.position.set(-0.3 + i * 0.06, 0, 0.27); top.add(sp); });
    [[-0.7, 0.28, 0.4], [0.35, 0.3, -0.6], [0.95, -0.28, 2.2]].forEach(([x, z, r]) => { const pl = PR.pliers(); pl.position.set(x, 0.004, z); pl.rotation.y = r; top.add(pl); });
    const ic = PR.acrylicSign(T.instructionCard(), 0.13, 0.18); ic.position.set(-1.0, 0, 0.3); ic.rotation.y = 0.3; top.add(ic);
    const ic2 = PR.acrylicSign(T.instructionCard(), 0.13, 0.18); ic2.position.set(1.0, 0, -0.3); ic2.rotation.y = Math.PI - 0.3; top.add(ic2);
    // charm jadi diletakkan di meja
    for (let i = 0; i < 6; i++) {
      const kc = PR.keychain(['letters', 'heart', 'star', 'pack', 'logo', 'cloud'][i], 90 + i);
      kc.rotation.x = -Math.PI / 2;
      kc.position.set(-0.6 + i * 0.25, 0.006, 0.18 + (i % 2) * 0.06);
      top.add(kc);
    }
    // pohon display charm akrilik di ujung meja
    const tree = new THREE.Group();
    tree.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 24), M.acrylic(), { y: 0.006 }));
    tree.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.34, 10), M.chrome(), { y: 0.18 }));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const arm = new THREE.Group();
      arm.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.09, 6), M.chrome(), { x: 0.045, rz: Math.PI / 2 }));
      const kc = PR.keychain(['letters', 'heart', 'pack', 'star', 'croissant', 'tortilla'][i], 120 + i);
      kc.position.set(0.085, 0, 0);
      arm.add(kc);
      arm.position.y = 0.26 + (i % 2) * 0.06;
      arm.rotation.y = a;
      tree.add(arm);
    }
    tree.position.set(1.0, 0, 0.18);
    top.add(tree);
    // cup kertas kecil isi manik
    for (let i = 0; i < 4; i++) top.add(mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.045, 16, 1, true), M.paint(['#ffd6e8', '#d6ecff', '#fff3c4', '#e6dcff'][i], 0.6), { x: 0.5 + i * 0.08, y: 0.0225, z: 0.3 }));
    top.position.y = H;
    g.add(top);
    // stool
    const cols = [P.pastelPink, '#bcd4f6', '#d5c8f4', '#f8dc8a', P.pastelPink, '#bcd4f6'];
    [[-0.75, 0.68], [-0.05, 0.7], [0.65, 0.68], [-0.45, -0.7], [0.35, -0.72], [1.35, 0.05]].forEach(([x, z], i) => { const s = PR.lowStool(cols[i]); s.position.set(x, 0, z); g.add(s); });
    g.position.set(11.4, PH, 0.55);
    addAsset(zone, 'B11', 'Meja Charm Making + 6 Stool (Mandatory)', g,
      ['Meja multipleks birch 230 x 85 x 75 cm, kaki kayu solid', '4 baki akrilik 3 sekat: manik warna, manik huruf, charm & ring', 'Benang/tali 5 warna, tang, kartu instruksi akrilik 4 langkah', 'Pohon display charm akrilik + contoh charm jadi', '6 stool krom dudukan pastel (pink, biru, lavender, butter)', 'Aktivitas wajib brief: charm making (motorik)'],
      { pos: [11.4, 1.6, 2.6], target: [11.4, 0.75, 0.5] });
  }
  {
    const g = PR.flexyRack(T.flexyJetz(), [T.jetzPack('sweet'), T.jetzPack('tortilla'), T.jetzPack('croissant')], { seed: 9 });
    g.position.set(14.35, PH, 1.5);
    g.rotation.y = -0.6;
    addAsset(zone, 'B12', 'Flexy Rack JetZ', g,
      ['POSM existing: 130 x 61 x 50 cm', '3 varian: Sweet Stick, Tortilla, Croissant', 'Grafis "Rek-in Aja!"'],
      { pos: [13.2, 1.4, 3.2], target: [14.35, 0.8, 1.5] });
  }
  {
    const g = PR.rollUpBanner(T.rollupJetz());
    g.position.set(0.95, PH, 1.6);
    g.rotation.y = 0.3;
    addAsset(zone, 'B13', 'Roll Up Banner JetZ', g,
      ['POSM existing: 80 x 200 cm', 'Visual "JetZ Rek-in Aja!" x H2H + 3 varian'],
      { pos: [1.8, 1.4, 4.0], target: [0.95, 1.1, 1.6] });
  }
  {
    // jam dinding kelas
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 40), M.paint('#ffffff', 0.4), { rx: Math.PI / 2 }));
    g.add(mesh(new THREE.TorusGeometry(0.17, 0.015, 8, 40), M.paint('#ff7eb6', 0.4), {}));
    g.add(mesh(box(0.012, 0.11, 0.004), M.paint('#222', 0.5), { y: 0.04, z: 0.024, rz: 0.4 }));
    g.add(mesh(box(0.01, 0.14, 0.004), M.paint('#222', 0.5), { y: 0.06, z: 0.026, rz: -1.2 }));
    g.position.set(9.95, PH + 2.0, WALL + 0.03);
    addAsset(zone, 'B14', 'Jam Dinding Kelas', g, ['Prop classroom vibes Ø 34 cm, bingkai pink'], { pos: [9.95, 1.8, 0.8], target: [9.95, 2.0, -1.8] });
  }

  return { zone, shell };
}

// ======================================================================
// Orang di zona JetZ
// ======================================================================
export function peopleJetz(scene, { visitor, crewJetz }) {
  const g = new THREE.Group();
  g.name = 'orang-jetz';
  const place = (p, x, z, ry = 0, y = PH) => { const b = bake(p.root); b.position.set(x, y, z); b.rotation.y = ry; g.add(b); return b; };

  // DJ / MC di panggung (headphone, tangan ke atas)
  const dj = createPerson({
    gender: 'm', height: 1.75, skin: '#eac4a4', hair: { style: 'medium', color: '#141110' },
    top: { type: 'hoodie', color: '#7d8aa8', sleeve: 'long' }, bottom: { type: 'wideleg', color: '#1a1a1a' },
    shoes: { color: '#f4f4f4' }, acc: { headphones: true, headphoneColor: '#ffffff' },
  });
  pose(dj, 'dj');
  place(dj, 7.55, -1.33, 0, PH + 0.1);
  // penari silent disco
  place(pose(visitor(31, { gender: 'f', acc: { headphones: true, headphoneColor: '#ff7eb6' } }), 'dance', { phase: 0.4 }), 6.7, 0.35, -0.2);
  place(pose(visitor(32, { gender: 'm', acc: { headphones: true, headphoneColor: '#7fd3ff' } }), 'dance', { phase: 2.1 }), 8.35, 0.5, 0.3);
  // Crew kasir & pembeli
  place(pose(crewJetz(1, { gender: 'f' }), 'cashier'), 13.8, -0.1, 0);
  const buyer = visitor(33, { gender: 'f', acc: { bag: 'backpack', bagColor: '#151515' } });
  pose(buyer, 'hand');
  place(buyer, 13.75, 1.2, Math.PI);
  // Fasilitator charm making
  place(pose(crewJetz(2, { gender: 'f', hair: { style: 'ponytail', color: '#231915' } }), 'point'), 12.95, 0.15, -1.2);
  // Peserta merangkai charm
  place(pose(visitor(34, { gender: 'f' }), 'craft'), 10.65, 1.23, Math.PI);
  place(pose(visitor(35, { gender: 'f', hair: { style: 'bob', color: '#141110' } }), 'craft', { yaw: 0.3 }), 11.35, 1.25, Math.PI);
  place(pose(visitor(36, { gender: 'm' }), 'craft'), 11.75, -0.17, 0);
  // Pose bareng standee H2H
  place(pose(visitor(37, { gender: 'f', acc: { phone: 'R' } }), 'selfie'), 2.1, -0.55, 0.2);
  place(pose(visitor(38, { gender: 'f' }), 'heart'), 3.6, -0.6, 0);
  const ph = visitor(39, { gender: 'm', acc: { phone: 'R' } });
  pose(ph, 'photo');
  place(ph, 3.4, 1.4, Math.PI);
  // Membuka loker kejutan
  const op = visitor(40, { gender: 'f', top: { type: 'cardigan', color: '#cfe0ff', sleeve: 'long' } });
  pose(op, 'tap');
  op.J.shoulderR.rotation.set(-1.0, 0, -0.3);
  place(op, 1.85, -0.72, Math.PI - 0.25);
  // Melihat pegboard charm (berdiri di samping kanan pegboard mengagumi gantungan kunci)
  place(pose(visitor(41, { gender: 'f' }), 'hold'), 12.15, -1.25, Math.PI - 0.65);

  scene.add(g);
  return g;
}
