import * as THREE from 'three';
import { M, P } from './core/mat.js';
import { mesh, rbox, box, grp, PH, registerAsset, bake, rng } from './core/util.js';
import * as T from './core/tex.js';
import * as PR from './props.js';
import { buildShell, endWall } from './structure.js';
import { createPerson, pose, makeStandee } from './people.js';

const WALL = -1.88; // muka dinding belakang

// Urutan resmi member (brief hal. 5 & 12)
export const TEAM_LITE = ['Doyoung', 'Jihoon', 'Haruto', 'Park Jeongwoo', 'Asahi'];
export const TEAM_WAVY = ['So Junghwan', 'Junkyu', 'Yoo Jaehyuk', 'Choi Hyunsuk', 'Yoshi'];

function addAsset(scene, code, name, object, spec, focus) {
  object.name = code;
  scene.add(object);
  registerAsset({ code, name, zone: 'A', object, spec, focus });
  return object;
}

export function buildChitato(scene) {
  const zone = new THREE.Group();
  zone.name = 'ZonaChitato';
  scene.add(zone);

  // ------------------------------------------------------------------
  // SHELL
  // ------------------------------------------------------------------
  const shell = buildShell(zone, {
    name: 'A00-shell', x0: -15, x1: 0, floorTex: T.boothFloorChitato(),
    segments: [
      { x0: -15, x1: -11.0, color: '#f3f1ec' },
      { x0: -11.0, x1: -7.4, color: P.wallYellow },
      { x0: -7.4, x1: -3.7, color: P.liteGreen },
      { x0: -3.7, x1: 0, color: P.amber },
    ],
    spots: [
      { x: -12.9, tx: -12.9, ty: 1.2, intensity: 10 },
      { x: -9.2, tx: -9.2, ty: 1.0, intensity: 8 },
      { x: -5.55, z: 0.85, tx: -5.55, ty: 1.0, tz: -1.35, intensity: 9, shadow: true },
      { x: -3.7, z: 0.85, tx: -3.7, ty: 1.0, tz: -1.35, intensity: 9, shadow: true },
      { x: -1.85, z: 0.85, tx: -1.85, ty: 1.0, tz: -1.35, intensity: 9, shadow: true },
      { x: -13.2, z: 0.85, tx: -13.2, ty: 0.9, tz: 1.0, intensity: 8, shadow: true },
      { x: -14.0, z: 0.85, tx: -14.1, ty: 0.9, tz: 0.0, intensity: 6 },
      { x: -10.8, z: 0.85, tx: -11.2, ty: 0.6, tz: 1.3, intensity: 6 },
    ],
  });
  registerAsset({
    code: 'A00', name: 'Struktur Booth Chitato 15 x 4 x 2,5 m', zone: 'A', object: shell.group,
    spec: ['Platform multipleks 10 cm + vinyl terrazzo, nosing aluminium, ramp 30 cm', 'Dinding partisi MDF 18 mm finishing cat duco: putih, kuning, hijau Lite, amber', 'Kanopi rangka hollow + gypsum putih, fascia 34 cm, tinggi total 2,50 m (maks brief)', 'Kolom hollow 6x6 cm putih tiap ±5 m', 'Track light hitam 2 rel + LED cove 3000K + LED strip fascia'],
    focus: { pos: [-7.5, 2.2, 9.5], target: [-7.5, 1.1, -0.5] },
  });

  // dinding ujung kiri (putih + panel oranye + logo)
  const lw = endWall(-15, -1, '#f3f1ec');
  lw.add(mesh(box(0.02, 2.36, 0.7), M.gloss(P.orange, 0.4), { x: -14.87, y: PH + 1.18, z: 1.2 }));
  const lwLogo = mesh(new THREE.PlaneGeometry(0.9, 0.34), M.print(T.wallLogoChitato(false), 0.5, { transparent: true }), { x: -14.875, y: PH + 2.0, z: -0.4, ry: Math.PI / 2, cast: false });
  lw.add(lwLogo);
  zone.add(lw);
  // dinding pembatas ke JetZ: sisi Chitato amber + logo TREASURE
  const rw = endWall(0.0, 1, P.amber);
  rw.add(mesh(new THREE.PlaneGeometry(1.4, 0.52), M.print(T.wallLogoChitato(false), 0.5, { transparent: true }), { x: -0.125, y: PH + 1.85, z: 0.2, ry: -Math.PI / 2, cast: false }));
  zone.add(rw);

  // ------------------------------------------------------------------
  // A01 — Selling counter (Event Desk) + set kasir + stok
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const d = PR.eventDesk('chitato');
    g.add(d);
    const cs = PR.cashierSet('chitato');
    cs.position.set(0.05, 1.0, -0.02);
    g.add(cs);
    // tumpukan paket siap jual (backpack/tote + kemasan dalam plastik bening)
    for (let i = 0; i < 3; i++) {
      const pk = new THREE.Group();
      pk.add(PR.toteBag(T.toteChitato()));
      pk.add(PR.snackPack(T.chitatoPack(i % 2 ? 'lite' : 'bbq'), { w: 0.15, h: 0.22, d: 0.05, y: 0.13, z: 0.03, rx: -0.2 }));
      pk.add(mesh(rbox(0.36, 0.42, 0.09, 0.02), M.acrylic('#ffffff', 0.15), { y: 0.2 }));
      pk.position.set(-0.32 + i * 0.12, 1.0, 0.12 - i * 0.03);
      pk.rotation.set(-1.45, 0, 0.1 * i);
      pk.scale.setScalar(0.6);
      if (i < 2) g.add(pk);
    }
    g.add(PR.acrylicSign(T.smallSign(['PAKET', 'TREASURE', 'Rp35.000', 'snack + merch'], { w: 360, h: 512, bg: '#ffd21f', color: '#3b1b00', bigIndex: 2 }), 0.15, 0.21).translateX(0.36).translateY(1.0).translateZ(0.12));
    // kardus stok di belakang counter
    const cart = M.paint('#b98e5a', 0.85);
    [[-0.3, 0], [0.12, 0], [-0.1, 0.3]].forEach(([x, y], i) => g.add(mesh(rbox(0.4, 0.3, 0.3, 0.01), cart, { x, y: 0.15 + y, z: -0.55, ry: i * 0.1 })));
    g.position.set(-13.15, PH, 1.0);
    addAsset(zone, 'A01', 'Selling Counter / Event Desk Chitato', g,
      ['Event desk POSM existing: 100 x 50 x 100 cm + header 200 cm', 'Top solid surface putih, body HPL oranye glossy', 'Tablet POS, EDC, QRIS akrilik, sign A5 harga paket', 'Stok paket di belakang counter (kardus)', 'Target 1.800 paket @Rp35.000'],
      { pos: [-12.3, 1.5, 3.4], target: [-13.15, 1.0, 0.8] });
  }

  // ------------------------------------------------------------------
  // A02 — Rak display kayu + header logo (dinding belakang)
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const W = 1.9, D = 0.38, H = 1.85;
    const wood = M.wood('oak', [1, 1], 0.55);
    [-1, 1].forEach(s => g.add(mesh(box(0.03, H, D), wood, { x: s * (W / 2 - 0.015), y: H / 2 })));
    g.add(mesh(box(W, H, 0.015), M.paint('#f6efe2', 0.7), { y: H / 2, z: -D / 2 + 0.008 }));
    const shelfY = [0.08, 0.46, 0.84, 1.22, 1.6];
    const variants = [['bbq', 'lite'], ['lite', 'bbq'], ['orig', 'lite'], ['bbq', 'orig']];
    shelfY.forEach((y, i) => {
      g.add(mesh(box(W - 0.06, 0.025, D - 0.02), wood, { y }));
      g.add(mesh(box(W - 0.06, 0.012, 0.002), M.emissive('#ffe3b0', 1.4), { y: y + 0.36, z: D / 2 - 0.03, cast: false }));
      if (i === 4) {
        // rak paling atas: merchandise TREASURE
        g.add(PR.photocardStand(TEAM_WAVY, 'wavy').translateX(-0.55).translateY(y + 0.013).translateZ(0.02));
        g.add(PR.photocardStand(TEAM_LITE, 'lite').translateX(0.0).translateY(y + 0.013).translateZ(0.02));
        const tb = PR.toteBag(T.toteChitato());
        tb.position.set(0.62, y + 0.013, -0.04);
        tb.scale.setScalar(0.75);
        g.add(tb);
        return;
      }
      const v = variants[i];
      const tx = v.map(k => T.chitatoPack(k));
      const row = PR.packRow([tx[0], tx[0], tx[0], tx[1], tx[1], tx[1]], 6, { w: 0.17, h: 0.25, d: 0.06, gap: 0.12, seed: i + 3 });
      row.position.set(0, y + 0.013, -0.02);
      g.add(row);
      const row2 = PR.packRow([tx[0], tx[0], tx[0], tx[1], tx[1], tx[1]], 6, { w: 0.17, h: 0.25, d: 0.06, gap: 0.12, seed: i + 13 });
      row2.position.set(0, y + 0.013, 0.09);
      g.add(row2);
    });
    // header kotak kayu + logo
    const hb = new THREE.Group();
    hb.add(mesh(rbox(1.2, 0.36, 0.12, 0.01), wood, {}));
    hb.add(mesh(new THREE.PlaneGeometry(1.0, 0.33), M.print(T.wallLogoChitato(false), 0.5, { transparent: true }), { z: 0.062, cast: false }));
    hb.position.set(0, H + 0.24, -0.08);
    g.add(hb);
    g.position.set(-12.9, PH, WALL + D / 2 + 0.01);
    addAsset(zone, 'A02', 'Rak Display Produk + Merchandise', g,
      ['Rak multipleks 18 mm finishing HPL oak: 190 x 38 x 185 cm, 5 ambalan', 'LED strip 3000K di bawah tiap ambalan', 'Isi: Chitato Beef BBQ, Sapi Panggang, Lite Seaweed', 'Ambalan atas: photocard TREASURE (Team Wavy & Team Lite) + tote bag', 'Header kotak kayu 120 x 36 cm + logo Chitato'],
      { pos: [-12.2, 1.4, 1.4], target: [-12.9, 1.15, -1.7] });
  }

  // ------------------------------------------------------------------
  // A03 — Meja product trial (sampling) + 2 bar stool
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    g.add(mesh(rbox(0.6, 1.02, 0.6, 0.02), M.gloss(P.orange, 0.35), { y: 0.51 }));
    g.add(mesh(rbox(0.66, 0.04, 0.66, 0.01), M.paint('#f7f7f5', 0.25), { y: 1.04 }));
    g.add(mesh(new THREE.PlaneGeometry(0.5, 0.5), M.print(T.smallSign(['TESTER', 'Coba dulu,', 'pilih Team-mu!'], { w: 512, h: 512, bg: '#ffd21f', color: '#3b1b00', bigIndex: 0 }), 0.5), { y: 0.6, z: 0.301 }));
    // cup sampling kertas berisi chips
    const cupM = M.paint('#ffffff', 0.6);
    const chipM = M.paint('#f2c14e', 0.6);
    const r = rng(9);
    for (let i = 0; i < 6; i++) {
      const cx = -0.18 + (i % 3) * 0.18, cz = -0.08 + Math.floor(i / 3) * 0.16;
      g.add(mesh(new THREE.CylinderGeometry(0.035, 0.026, 0.06, 18, 1, true), cupM, { x: cx, y: 1.09, z: cz }));
      for (let k = 0; k < 5; k++) g.add(mesh(new THREE.SphereGeometry(0.018, 8, 6), chipM, { x: cx + (r() - 0.5) * 0.03, y: 1.115 + r() * 0.015, z: cz + (r() - 0.5) * 0.03, sy: 0.25, rx: r() * 2, rz: r() * 2 }));
    }
    // tisu & hand sanitizer
    g.add(mesh(rbox(0.12, 0.06, 0.12, 0.01), M.paint('#ffffff', 0.6), { x: 0.2, y: 1.09, z: 0.2 }));
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 16), M.plastic('#e7f3ff', 0.2), { x: -0.22, y: 1.12, z: 0.2 }));
    const s1 = PR.barStool(P.chitatoYellow); s1.position.set(-0.45, 0, 0.5); g.add(s1);
    const s2 = PR.barStool(P.chitatoYellow); s2.position.set(0.45, 0, 0.55); g.add(s2);
    g.position.set(-14.2, PH, -0.25);
    addAsset(zone, 'A03', 'Meja Product Trial + Bar Stool', g,
      ['Meja tinggi 60 x 60 x 106 cm, HPL oranye, top solid surface', '2 bar stool dudukan beludru kuning, kaki krom (sewa)', 'Cup sampling kertas, tisu, hand sanitizer', 'Sesuai objektif brief: product trial'],
      { pos: [-13.0, 1.5, 1.8], target: [-14.2, 0.9, -0.2] });
  }

  // ------------------------------------------------------------------
  // A04 — Totem pack (kemasan raksasa) + A05 flexy rack + A15 roll up
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const t1 = PR.totemPack(T.chitatoPack('bbq')); t1.position.set(0, 0, 0); t1.rotation.y = 0.25; g.add(t1);
    const t2 = PR.totemPack(T.chitatoPack('lite')); t2.position.set(0.85, 0, 0.15); t2.rotation.y = -0.15; g.add(t2);
    g.position.set(-11.75, PH, 1.35);
    addAsset(zone, 'A04', 'Totem Pack Chitato & Chitato Lite', g,
      ['POSM existing: 95 x 73 x 30 cm (2 unit)', 'Base plat putih 80 x 40 cm', 'Penanda transisi area Selling ke Activity'],
      { pos: [-10.9, 1.2, 3.4], target: [-11.4, 0.6, 1.4] });
  }
  {
    const g = PR.flexyRack(T.flexyChitato(), [T.chitatoPack('bbq'), T.chitatoPack('lite'), T.chitatoPack('orig')], { seed: 4 });
    g.position.set(-11.55, PH, -1.25);
    g.rotation.y = -0.35;
    addAsset(zone, 'A05', 'Flexy Rack Chitato', g,
      ['POSM existing: 130 x 61 x 50 cm', '3 ambalan, sisi & belakang bergrafis TREASURE', 'Isi 3 varian kemasan'],
      { pos: [-10.6, 1.3, 0.8], target: [-11.55, 0.8, -1.25] });
  }
  {
    const g = PR.rollUpBanner(T.rollupChitato());
    g.position.set(-14.45, PH, 1.55);
    g.rotation.y = 0.35;
    addAsset(zone, 'A15', 'Roll Up Banner Chitato', g,
      ['POSM existing: 80 x 200 cm', 'Info Paket TREASURE Rp35.000', 'Diletakkan di sisi pintu masuk (dari Lobby SPIT)'],
      { pos: [-13.6, 1.4, 4.0], target: [-14.45, 1.1, 1.55] });
  }

  // ------------------------------------------------------------------
  // A06 — Neon Arch Portal + Kiosk game "Wave Challenge"
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const cx = 0;
    const W = 1.7, H = 2.15, R = W / 2;
    const relief = 0.14;
    // panel relief kuning cerah (bentuk gapura)
    const outer = new THREE.Shape();
    outer.moveTo(-R, 0); outer.lineTo(-R, H - R); outer.absarc(0, H - R, R, Math.PI, 0, true); outer.lineTo(R, 0); outer.lineTo(-R, 0);
    const hole = new THREE.Path();
    const r2 = R - 0.14;
    hole.moveTo(-r2, 0.0001); hole.lineTo(-r2, H - R); hole.absarc(0, H - R, r2, Math.PI, 0, true); hole.lineTo(r2, 0.0001); hole.lineTo(-r2, 0.0001);
    outer.holes.push(hole);
    const archGeo = new THREE.ExtrudeGeometry(outer, { depth: relief, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 48 });
    g.add(mesh(archGeo, M.gloss('#ffd84a', 0.3), { z: 0 }));
    // ceruk dalam (lebih gelap)
    const inner = new THREE.Shape();
    inner.moveTo(-r2, 0); inner.lineTo(-r2, H - R); inner.absarc(0, H - R, r2, Math.PI, 0, true); inner.lineTo(r2, 0); inner.lineTo(-r2, 0);
    g.add(mesh(new THREE.ShapeGeometry(inner, 48), M.paint('#e9a90f', 0.8), { z: 0.003 }));
    // tabung neon flex mengikuti tepi dalam
    const path = new THREE.CurvePath();
    const rn = r2 - 0.03;
    path.add(new THREE.LineCurve3(new THREE.Vector3(-rn, 0.05, 0), new THREE.Vector3(-rn, H - R, 0)));
    const arc = new THREE.EllipseCurve(0, H - R, rn, rn, Math.PI, 0, true);
    const arcPts = arc.getPoints(48).map(p => new THREE.Vector3(p.x, p.y, 0));
    for (let i = 0; i < arcPts.length - 1; i++) path.add(new THREE.LineCurve3(arcPts[i], arcPts[i + 1]));
    path.add(new THREE.LineCurve3(new THREE.Vector3(rn, H - R, 0), new THREE.Vector3(rn, 0.05, 0)));
    const tube = new THREE.TubeGeometry(path, 240, 0.011, 10, false);
    const neon = mesh(tube, M.neon('#ffd34d', 4), { z: relief + 0.02, cast: false });
    g.add(neon);
    // klip neon
    for (let i = 0; i < 14; i++) {
      const p = path.getPointAt(i / 13);
      g.add(mesh(box(0.03, 0.012, 0.02), M.acrylic(), { x: p.x, y: p.y, z: relief + 0.01 }));
    }
    // kiosk 55" portrait (rangka totem)
    const k = new THREE.Group();
    k.add(mesh(rbox(0.82, 1.62, 0.09, 0.02), M.paint('#151515', 0.35), { y: 0.81 + 0.25 }));
    const scr = PR.screen(T.kioskScreen(), 0.7, 1.24, { depth: 0.02, intensity: 1.35 });
    scr.position.set(0, 1.12, 0.05);
    k.add(scr);
    k.add(mesh(rbox(0.6, 0.06, 0.45, 0.02), M.paint('#151515', 0.35), { y: 0.03 }));
    k.add(mesh(box(0.2, 0.22, 0.1), M.paint('#151515', 0.35), { y: 0.14 }));
    // kamera gerak di atas layar
    k.add(mesh(rbox(0.14, 0.035, 0.04, 0.01), M.paint('#0a0a0a', 0.3), { y: 1.9, z: 0.04 }));
    k.add(mesh(new THREE.CircleGeometry(0.008, 12), M.emissive('#ff3030', 2), { x: 0.05, y: 1.9, z: 0.061, cast: false }));
    k.position.set(0, 0, 0.18);
    g.add(k);
    // logo TREASURE di atas gapura (tipis, di dinding)
    const tlogo = T.canvasTex(512, 128, (ctx, w, h) => { ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#3b1b00'; ctx.font = '900 80px "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TREASURE', w / 2, h / 2); });
    g.position.set(-9.2, PH, WALL);
    // stiker lantai "berdiri di sini"
    const decal = mesh(new THREE.CircleGeometry(0.42, 48), M.print(T.floorTarget(), 0.6, { transparent: true }), { rx: -Math.PI / 2, y: 0.003, z: 1.55, cast: false });
    g.add(decal);
    addAsset(zone, 'A06', 'Neon Arch Portal + Kiosk Wave Challenge', g,
      ['Gapura relief MDF 18 mm cat duco kuning: 170 x 215 x 14 cm', 'LED neon flex 12V kuning hangat ±5,5 m + klip akrilik', 'Kiosk 55" portrait touchscreen + kamera gerak (motion game)', 'Game: pilih Team WAVY / LITE, ikuti gerakan TREASURE, skor tertinggi dapat merch', 'Stiker lantai "Berdiri di sini" Ø 84 cm'],
      { pos: [-9.2, 1.4, 2.6], target: [-9.2, 1.15, -1.6] });
  }

  // ------------------------------------------------------------------
  // A07 — Wave fin sculpture hijau (kiri) & A11 kayu (kanan)
  // ------------------------------------------------------------------
  function finSculpture(mat, baseH = 0.42, wavy = false) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.15, 0.17, baseH, 32), M.chrome(), { y: baseH / 2 }));
    g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 32), M.chrome(), { y: 0.01 }));
    const n = 11, W = 0.9;
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * 2 - 1;
      const h = (wavy ? 0.95 : 1.0) * Math.sqrt(1 - t * t * 0.85) * 1.05;
      const hh = wavy ? h * (0.85 + 0.15 * Math.sin(i * 1.3)) : Math.round(h * 6) / 6;
      g.add(mesh(rbox(0.035, hh, 0.32, 0.008), mat, { x: t * W / 2, y: baseH + hh / 2 + 0.02 }));
    }
    g.add(mesh(box(W + 0.02, 0.02, 0.1), mat, { y: baseH + 0.03 }));
    return g;
  }
  {
    const g = finSculpture(M.paint(P.liteGreenDeep, 0.6));
    g.position.set(-7.55, PH, 0.3);
    g.rotation.y = 0.1;
    addAsset(zone, 'A07', 'Wave Fin Sculpture (Hijau Lite)', g,
      ['11 sirip MDF 18 mm cat hijau Lite, profil bertingkat (gelombang)', 'Tiang krom Ø 30 cm x 42 cm', 'Tinggi total ±1,5 m — penanda zona Team LITE'],
      { pos: [-6.6, 1.3, 2.4], target: [-7.55, 0.9, 0.3] });
  }
  {
    const g = finSculpture(M.wood('oak', [1, 1], 0.5), 0.42, true);
    g.position.set(-0.85, PH, 0.25);
    g.rotation.y = -0.15;
    addAsset(zone, 'A11', 'Wave Fin Sculpture (Kayu)', g,
      ['11 sirip multipleks finishing HPL oak, profil bergelombang', 'Tiang krom Ø 30 cm', 'Penanda zona Team WAVY'],
      { pos: [-1.6, 1.3, 2.4], target: [-0.85, 0.9, 0.25] });
  }

  // ------------------------------------------------------------------
  // A08 / A09 — Lightbox member Team LITE (hijau) & Team WAVY (amber)
  // ------------------------------------------------------------------
  function lightboxWall(names, team, x0, frameColor, code, label) {
    const g = new THREE.Group();
    const w = 0.52, h = 1.3, gap = 0.17;
    names.forEach((n, i) => {
      const lb = PR.lightbox(T.memberPoster(n, team, i + (team === 'lite' ? 1 : 11)), w, h, frameColor, 0.08, 1.45);
      lb.position.set(i * (w + gap), 0.55 + h / 2, 0.04);
      g.add(lb);
      // pelat dasar
      g.add(mesh(box(w + 0.06, 0.5, 0.1), M.paint(frameColor, 0.5), { x: i * (w + gap), y: 0.25, z: 0.05 }));
    });
    // lis LED kuning di atas panel
    g.add(mesh(box(names.length * (w + gap), 0.015, 0.02), M.emissive('#ffe27a', 2.4), { x: (names.length - 1) * (w + gap) / 2, y: 1.95, z: 0.03, cast: false }));
    g.position.set(x0, PH, WALL);
    return g;
  }
  {
    const g = lightboxWall(TEAM_LITE, 'lite', -7.05, '#1d6b33');
    const logo = mesh(new THREE.PlaneGeometry(1.1, 0.41), M.print(T.wallLogoChitato(true), 0.5, { transparent: true }), { x: 0.3, y: 2.12, z: 0.01, cast: false });
    g.add(logo);
    addAsset(zone, 'A08', 'Lightbox Team LITE (5 member)', g,
      ['5 lightbox aluminium 52 x 130 x 8 cm, LED backlit 6500K', 'Urutan Team Lite [ki-ka]: ' + TEAM_LITE.join(', '), 'Grafis: KV resmi (ilustrasi di model ini masih pengganti)', 'Base box 58 x 50 x 10 cm hijau tua', 'Logo Chitato LITE Seaweed cutting akrilik'],
      { pos: [-5.6, 1.4, 2.2], target: [-5.6, 1.25, -1.8] });
  }
  {
    const g = lightboxWall(TEAM_WAVY, 'wavy', -3.4, '#8a4a0c');
    const logo = mesh(new THREE.PlaneGeometry(1.1, 0.41), M.print(T.wallLogoChitato(false), 0.5, { transparent: true }), { x: 2.5, y: 2.12, z: 0.01, cast: false });
    g.add(logo);
    addAsset(zone, 'A09', 'Lightbox Team WAVY (5 member)', g,
      ['5 lightbox aluminium 52 x 130 x 8 cm, LED backlit 6500K', 'Urutan Team Wavy [ki-ka]: ' + TEAM_WAVY.join(', '), 'Grafis: KV resmi (ilustrasi di model ini masih pengganti)', 'Base box coklat amber', 'Logo Chitato Beef BBQ cutting akrilik'],
      { pos: [-1.9, 1.4, 2.2], target: [-1.9, 1.25, -1.8] });
  }

  // ------------------------------------------------------------------
  // A10 — Header sign lightbox
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    g.add(mesh(rbox(3.1, 0.34, 0.1, 0.03), M.gloss('#ffc61a', 0.3), {}));
    g.add(mesh(new THREE.PlaneGeometry(3.0, 0.27), M.lightbox(T.headerChitato(), 1.25), { z: 0.051, cast: false }));
    g.add(mesh(rbox(3.16, 0.4, 0.06, 0.03), M.neon('#ffcf40', 1.6), { z: -0.03, cast: false }));
    g.position.set(-3.7, PH + 2.04, WALL + 0.06);
    addAsset(zone, 'A10', 'Header Sign "Chitato x Chitato Lite x TREASURE"', g,
      ['Lightbox 310 x 34 x 10 cm, rangka kuning', 'Halo LED belakang (glow hangat ke dinding)', 'Puncak 2,30 m — di bawah batas 2,5 m'],
      { pos: [-3.7, 1.9, 2.0], target: [-3.7, 2.1, -1.8] });
  }

  // ------------------------------------------------------------------
  // A12 — Standee TREASURE 180 cm (urutan resmi ki-ka: subset berurutan)
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    const list = [
      { name: 'Junkyu', x: -5.55, top: '#1a1a1a', top2: '#ffd21f', hair: 'medium', hc: '#2a1d16', bt: '#1a1a1a' },
      { name: 'Yoshi', x: -3.7, top: '#ffd21f', top2: '#1a1a1a', hair: 'short', hc: '#141110', bt: '#1a1a1a' },
      { name: 'Haruto', x: -1.85, top: '#1a1a1a', top2: '#f2f2f2', hair: 'medium', hc: '#141110', bt: '#2a2a2a' },
    ];
    list.forEach((s, i) => {
      const p = createPerson({
        gender: 'm', height: 1.8, skin: ['#f3d2b8', '#eac4a4', '#f6dcc6'][i],
        hair: { style: s.hair, color: s.hc },
        top: { type: i === 1 ? 'hoodie' : 'blazer', color: s.top, color2: s.top2, sleeve: 'long' },
        bottom: { type: 'pants', color: s.bt },
        shoes: { color: '#f4f4f4', sole: '#ffffff' },
      });
      pose(p, i === 1 ? 'peace' : 'stand', { tilt: 0.08 });
      if (i === 2) { p.J.shoulderL.rotation.set(-0.5, 0, 0.1); p.J.elbowL.rotation.set(-1.4, 0, 0); }
      const st = makeStandee(p, { name: s.name, theme: 'chitato' });
      st.position.set(s.x, PH, -1.3);
      g.add(st);
    });
    addAsset(zone, 'A12', 'Standee Member TREASURE 180 cm', g,
      ['Foamboard 5 mm cetak UV, potong kontur, tinggi member 180 cm', 'Urutan wajib [ki-ka] dari brief: Choi Hyunsuk, Junkyu, So Junghwan, Yoshi, Yoo Jaehyuk, Haruto, Doyoung, Park Jeongwoo, Jihoon', 'Di model: Junkyu – Yoshi – Haruto (urutan tetap sesuai brief)', 'Kaki penyangga lipat + pelat nama', 'Visual figur = ilustrasi pengganti foto resmi'],
      { pos: [-3.7, 1.5, 2.6], target: [-3.7, 1.0, -1.3] });
  }

  // ------------------------------------------------------------------
  // A13 — Pouf (drum) warna-warni + A14 decal lantai gelombang
  // ------------------------------------------------------------------
  {
    const g = new THREE.Group();
    [[P.chitatoYellow, -12.1, 0.2], [P.orange, -9.55, 0.45], [P.liteGreen, -5.0, 0.55], [P.chitatoYellow, -2.6, 0.7], [P.orange, -8.3, 1.0]].forEach(([c, x, z]) => {
      const p = PR.drumPouf(c); p.position.set(x, PH, z); g.add(p);
    });
    addAsset(zone, 'A13', 'Drum Pouf (5 unit)', g,
      ['Pouf silinder busa Ø 48 x 42 cm, kain beludru', 'Warna: kuning Chitato, oranye, hijau Lite', 'Tempat duduk santai & antre game'],
      { pos: [-7.5, 1.6, 3.6], target: [-7.5, 0.3, 0.6] });
  }
  {
    const g = new THREE.Group();
    g.add(mesh(new THREE.PlaneGeometry(9.5, 0.6), M.print(T.waveDecal(), 0.7, { transparent: true }), { rx: -Math.PI / 2, cast: false }));
    g.position.set(-5.6, PH + 0.002, 1.55);
    addAsset(zone, 'A14', 'Stiker Lantai "Make The Wave You Lite"', g,
      ['Stiker lantai anti-slip laminasi doff 950 x 60 cm', 'Gelombang oranye-kuning-hijau sepanjang sisi depan'],
      { pos: [-5.6, 3.2, 4.0], target: [-5.6, 0, 1.5] });
  }

  return { zone, shell };
}

// ======================================================================
// Orang di zona Chitato
// ======================================================================
export function peopleChitato(scene, { visitor, crewChitato }) {
  const g = new THREE.Group();
  g.name = 'orang-chitato';
  const place = (p, x, z, ry = 0, y = PH) => { const b = bake(p.root); b.position.set(x, y, z); b.rotation.y = ry; g.add(b); return b; };

  // Crew kasir
  place(pose(crewChitato(1, { gender: 'f' }), 'cashier'), -13.15, 0.45, 0);
  // Pembeli di kasir
  const buyer = visitor(11, { gender: 'f', acc: { phone: 'R', bag: 'tote' } });
  pose(buyer, 'hand');
  place(buyer, -13.0, 1.75, Math.PI);
  // Antre
  place(pose(visitor(12, { gender: 'm' }), 'phone'), -12.6, 2.55, Math.PI + 0.2, 0.004);
  // Crew host game
  place(pose(crewChitato(2, { gender: 'm' }), 'point'), -10.1, -0.6, -0.5);
  // Pemain kiosk
  place(pose(visitor(13, { gender: 'm', top: { type: 'hoodie', color: '#2f4a3a', sleeve: 'long' } }), 'tap'), -9.2, -0.4, Math.PI);
  // Teman memotret pemain
  const ph = visitor(14, { gender: 'f', acc: { phone: 'R' } });
  pose(ph, 'photo');
  place(ph, -8.5, 0.75, Math.PI + 0.45);
  // Duduk di stool product trial
  place(pose(visitor(15, { gender: 'f' }), 'sit', { seat: 0.75, feetBar: true, yaw: 0.4 }), -14.65, 0.25, Math.PI * 0.85);
  place(pose(visitor(16, { gender: 'm' }), 'lean'), -13.75, 0.45, Math.PI * 1.15);
  // Selfie dengan standee Yoshi
  const sf = visitor(17, { gender: 'f', hair: { style: 'long', color: '#3b2a20' }, acc: { phone: 'R', bag: 'sling' } });
  pose(sf, 'selfie');
  place(sf, -4.2, -0.95, 0.15);
  // Pose peace di samping Haruto + teman memotret
  place(pose(visitor(18, { gender: 'f', top: { type: 'crop', color: '#ffe066', sleeve: 'short' } }), 'peace'), -2.4, -1.1, 0.1);
  const ph2 = visitor(19, { gender: 'm', acc: { phone: 'R' } });
  pose(ph2, 'photo');
  place(ph2, -2.0, 1.2, Math.PI - 0.1);
  // Duduk di pouf sambil main HP
  place(pose(visitor(20, { gender: 'f', acc: { phone: 'R' } }), 'sit', { seat: 0.42, look: 0.45 }), -5.0, 0.55, 0.3);
  // Lihat lightbox Team Lite
  place(pose(visitor(21, { gender: 'm' }), 'stand', { look: -0.15 }), -6.4, 0.1, Math.PI + 0.1);
  place(pose(visitor(22, { gender: 'f' }), 'stand', { look: -0.1, yaw: 0.4 }), -6.0, 0.25, Math.PI - 0.2);

  scene.add(g);
  return g;
}
