import * as THREE from 'three';
import { M, P } from './core/mat.js';
import { mesh, rbox, box, grp, bake, rng } from './core/util.js';
import * as T from './core/tex.js';

const gc = new Map();
const G = (key, make) => { if (!gc.has(key)) gc.set(key, make()); return gc.get(key); };

// ======================================================================
// KEMASAN SNACK (bentuk bantal + seal bergerigi)
// ======================================================================
export function packGeo(w = 0.17, h = 0.25, d = 0.065) {
  return G(`pack_${w}_${h}_${d}`, () => {
    const g = new THREE.BoxGeometry(w, h, d, 10, 14, 2);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const ny = (2 * v.y) / h, nx = (2 * v.x) / w;
      // pipih di ujung (seal), menggembung di tengah
      const seal = Math.abs(ny) > 0.86 ? 0.06 : 1;
      const puff = Math.max(0.05, (1 - Math.pow(Math.abs(ny), 3)) * (1 - Math.pow(Math.abs(nx), 6)));
      v.z *= seal < 1 ? 0.06 : puff;
      // seal sedikit lebih lebar
      if (Math.abs(ny) > 0.86) v.x *= 1.03;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  });
}

export function snackPack(tex, o = {}) {
  const w = o.w || 0.17, h = o.h || 0.25, d = o.d || 0.065;
  return mesh(packGeo(w, h, d), M.pack(tex), o);
}

/** baris kemasan di rak */
export function packRow(tex, n, o = {}) {
  const g = new THREE.Group();
  const w = o.w || 0.17, gap = o.gap ?? 0.01;
  const r = rng(o.seed || 1);
  for (let i = 0; i < n; i++) {
    const t = Array.isArray(tex) ? tex[i % tex.length] : tex;
    g.add(snackPack(t, { w, h: o.h, d: o.d, x: (i - (n - 1) / 2) * (w + gap), y: (o.h || 0.25) / 2, rx: -0.12 + (r() - 0.5) * 0.05, ry: (r() - 0.5) * 0.12 }));
  }
  return g;
}

// ======================================================================
// FURNITUR
// ======================================================================
export function barStool(seatColor = P.chitatoYellow, h = 0.75) {
  const g = new THREE.Group();
  const ch = M.chrome();
  g.add(mesh(G('stoolbase', () => new THREE.CylinderGeometry(0.2, 0.22, 0.02, 40)), ch, { y: 0.01 }));
  g.add(mesh(G('stoolpole_' + h, () => new THREE.CylinderGeometry(0.025, 0.025, h - 0.08, 20)), ch, { y: (h - 0.08) / 2 + 0.02 }));
  g.add(mesh(G('stoolring', () => new THREE.TorusGeometry(0.16, 0.009, 8, 40)), ch, { y: 0.3, rx: Math.PI / 2 }));
  g.add(mesh(G('stoolseat', () => new THREE.CylinderGeometry(0.19, 0.18, 0.07, 40)), M.velvet(seatColor), { y: h - 0.035 }));
  g.add(mesh(G('stoolseattop', () => new THREE.SphereGeometry(0.19, 32, 8, 0, Math.PI * 2, 0, 0.35)), M.velvet(seatColor), { y: h - 0.05, sy: 0.35 }));
  return g;
}

export function lowStool(color = P.pastelPink, h = 0.46) {
  const g = new THREE.Group();
  const lm = M.chrome();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    g.add(mesh(G('lsleg_' + h, () => new THREE.CylinderGeometry(0.011, 0.011, h, 10)), lm, { x: Math.cos(a) * 0.12, z: Math.sin(a) * 0.12, y: h / 2, rz: Math.cos(a) * 0.06, rx: -Math.sin(a) * 0.06 }));
  }
  g.add(mesh(G('lsring', () => new THREE.TorusGeometry(0.135, 0.007, 6, 30)), lm, { y: 0.18, rx: Math.PI / 2 }));
  g.add(mesh(G('lsseat', () => new THREE.CylinderGeometry(0.17, 0.16, 0.05, 36)), M.plastic(color, 0.45), { y: h }));
  return g;
}

export function drumPouf(color, r = 0.24, h = 0.42) {
  const g = new THREE.Group();
  g.add(mesh(G(`pouf_${r}_${h}`, () => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const y = t * h;
      const bulge = Math.sin(t * Math.PI) * 0.025;
      const edge = t < 0.08 ? Math.sin((t / 0.08) * Math.PI / 2) : t > 0.92 ? Math.sin(((1 - t) / 0.08) * Math.PI / 2) : 1;
      pts.push(new THREE.Vector2((r + bulge) * (0.9 + 0.1 * edge), y));
    }
    pts.unshift(new THREE.Vector2(0.001, 0));
    pts.push(new THREE.Vector2(0.001, h));
    return new THREE.LatheGeometry(pts, 48);
  }), M.velvet(color), {}));
  // jahitan pipa
  g.add(mesh(G(`poufpipe_${r}`, () => new THREE.TorusGeometry(r * 0.99, 0.008, 6, 48)), M.velvet(new THREE.Color(color).multiplyScalar(0.85).getStyle()), { y: h - 0.02, rx: Math.PI / 2 }));
  return g;
}

// ======================================================================
// POSM STANDAR BRIEF
// ======================================================================
/** Roll up banner 80 x 200 cm */
export function rollUpBanner(tex) {
  const g = new THREE.Group();
  const al = M.aluminium();
  g.add(mesh(rbox(0.85, 0.09, 0.2, 0.03), al, { y: 0.045 }));
  g.add(mesh(rbox(0.04, 0.02, 0.3, 0.005), al, { x: -0.3, y: 0.01, z: 0.02 }));
  g.add(mesh(rbox(0.04, 0.02, 0.3, 0.005), al, { x: 0.3, y: 0.01, z: 0.02 }));
  g.add(mesh(box(0.015, 2.0, 0.015), al, { y: 1.05, z: -0.04 }));
  g.add(mesh(new THREE.PlaneGeometry(0.8, 2.0), M.print(tex, 0.55), { y: 1.09, z: 0.005 }));
  g.add(mesh(new THREE.PlaneGeometry(0.8, 2.0), M.paint('#e9e9e9', 0.7), { y: 1.09, z: 0.0, ry: Math.PI }));
  g.add(mesh(rbox(0.82, 0.025, 0.02, 0.006), al, { y: 2.09 }));
  return g;
}

/** Flexy rack 130 x 61 x 50 cm (T x L x D), sisi bergrafis + 3 ambalan */
export function flexyRack(tex, packTexs, o = {}) {
  const g = new THREE.Group();
  const H = 1.3, W = 0.61, D = 0.5;
  const pm = M.print(tex, 0.5);
  const white = M.paint('#f4f4f4', 0.5);
  [-1, 1].forEach(s => {
    g.add(mesh(box(0.018, H, D), white, { x: s * (W / 2 - 0.009), y: H / 2 }));
    g.add(mesh(new THREE.PlaneGeometry(D, H), pm, { x: s * (W / 2 + 0.0005), y: H / 2, ry: s * Math.PI / 2 }));
  });
  g.add(mesh(box(W, H, 0.018), white, { y: H / 2, z: -D / 2 + 0.009 }));
  g.add(mesh(new THREE.PlaneGeometry(W - 0.04, H - 0.4), pm, { y: H / 2 + 0.15, z: -D / 2 + 0.0185 }));
  g.add(mesh(box(W, 0.02, D), white, { y: H - 0.01 }));
  // header
  g.add(mesh(box(W + 0.02, 0.22, 0.02), white, { y: H + 0.11, z: -D / 2 + 0.06 }));
  g.add(mesh(new THREE.PlaneGeometry(W, 0.2), pm, { y: H + 0.11, z: -D / 2 + 0.071 }));
  const shelvesY = [0.12, 0.5, 0.88];
  shelvesY.forEach((y, i) => {
    g.add(mesh(box(W - 0.04, 0.018, D - 0.05), white, { y, z: 0.0 }));
    g.add(mesh(box(W - 0.04, 0.05, 0.012), white, { y: y + 0.025, z: (D - 0.05) / 2 }));
    const row = packRow(packTexs, 3, { w: 0.16, h: 0.24, d: 0.06, seed: i + (o.seed || 0) });
    row.position.set(0, y + 0.01, -0.05);
    g.add(row);
    const row2 = packRow(packTexs.slice().reverse(), 3, { w: 0.16, h: 0.24, d: 0.06, seed: i + 7 });
    row2.position.set(0, y + 0.01, 0.08);
    g.add(row2);
  });
  return g;
}

/** Totem pack (kemasan raksasa) 95 x 73 x 30 cm */
export function totemPack(tex) {
  const g = new THREE.Group();
  g.add(snackPack(tex, { w: 0.73, h: 0.95, d: 0.3, y: 0.475 + 0.06 }));
  g.add(mesh(rbox(0.8, 0.06, 0.4, 0.015), M.paint('#f2f2f2', 0.4), { y: 0.03 }));
  return g;
}

/** Event desk (counter + tiang header), tinggi total 2 m */
export function eventDesk(theme) {
  const g = new THREE.Group();
  const W = 1.0, D = 0.5, Hc = 1.0;
  const c = theme === 'jetz' ? P.babyBlue : P.orange;
  const body = M.gloss(c, 0.35);
  g.add(mesh(rbox(W, Hc - 0.04, D, 0.02), body, { y: (Hc - 0.04) / 2 }));
  g.add(mesh(rbox(W + 0.06, 0.04, D + 0.06, 0.01), M.paint('#f7f7f5', 0.25), { y: Hc - 0.02 }));
  const front = theme === 'jetz' ? T.flexyJetz() : T.flexyChitato();
  g.add(mesh(new THREE.PlaneGeometry(W - 0.08, Hc - 0.16), M.print(front, 0.5), { y: Hc / 2, z: D / 2 + 0.001 }));
  g.add(mesh(rbox(W + 0.02, 0.06, D + 0.02, 0.01), M.paint('#222', 0.6), { y: 0.03 }));
  // tiang & header
  const al = M.aluminium();
  [-1, 1].forEach(s => g.add(mesh(G('edpole', () => new THREE.CylinderGeometry(0.012, 0.012, 1.0, 12)), al, { x: s * (W / 2 - 0.05), y: Hc + 0.5, z: -D / 2 + 0.05 })));
  g.add(mesh(rbox(W, 0.26, 0.03, 0.01), M.paint('#ffffff', 0.4), { y: 1.87, z: -D / 2 + 0.05 }));
  const hdr = theme === 'jetz' ? T.smallSign(['JetZ', 'Paket Rp35.000'], { w: 1024, h: 256, bg: '#1460d8', color: '#ffffff', bigIndex: 0 })
    : T.smallSign(['Chitato', 'Paket TREASURE Rp35.000'], { w: 1024, h: 256, bg: '#f2711c', color: '#ffffff', bigIndex: 0 });
  g.add(mesh(new THREE.PlaneGeometry(W - 0.02, 0.24), M.print(hdr, 0.45), { y: 1.87, z: -D / 2 + 0.066 }));
  return g;
}

/** Perlengkapan kasir: tablet POS, EDC, QRIS, laci uang */
export function cashierSet(theme) {
  const g = new THREE.Group();
  // tablet POS di stand
  const t = new THREE.Group();
  t.add(mesh(G('posbase', () => new THREE.CylinderGeometry(0.06, 0.07, 0.015, 24)), M.paint('#e5e5e5', 0.3, 0.5), {}));
  t.add(mesh(box(0.025, 0.16, 0.025), M.paint('#e5e5e5', 0.3, 0.5), { y: 0.08, rx: -0.2 }));
  const tab = new THREE.Group();
  tab.add(mesh(rbox(0.26, 0.18, 0.012, 0.012), M.paint('#1a1a1a', 0.3), {}));
  const sc = mesh(new THREE.PlaneGeometry(0.24, 0.16), M.screen(T.posScreen(theme), 1.0), { z: 0.0065, cast: false });
  tab.add(sc);
  tab.position.set(0, 0.2, 0.02);
  tab.rotation.x = -0.35;
  t.add(tab);
  t.rotation.y = Math.PI;
  g.add(t);
  // EDC
  const edc = mesh(rbox(0.08, 0.035, 0.18, 0.012), M.paint('#2a2a2e', 0.4), { x: 0.25, y: 0.018, z: 0.05, ry: 0.3 });
  g.add(edc);
  g.add(mesh(new THREE.PlaneGeometry(0.06, 0.05), M.emissive('#6cc4ff', 0.5, '#111'), { x: 0.25, y: 0.037, z: 0.02, rx: -Math.PI / 2, rz: 0.3, cast: false }));
  // QRIS akrilik
  const q = new THREE.Group();
  q.add(mesh(new THREE.PlaneGeometry(0.12, 0.15), M.print(T.qrisSign(), 0.4), { y: 0.085 }));
  q.add(mesh(rbox(0.13, 0.17, 0.004, 0.002), M.acrylic(), { y: 0.085, z: -0.003 }));
  q.add(mesh(rbox(0.13, 0.01, 0.06, 0.002), M.acrylic(), { y: 0.005 }));
  q.position.set(-0.3, 0, 0.12);
  q.rotation.y = 0.2;
  g.add(q);
  return g;
}

/** Layar kiosk/LED portrait di dalam rangka */
export function screen(tex, w, h, o = {}) {
  const g = new THREE.Group();
  g.add(mesh(rbox(w + 0.03, h + 0.03, o.depth || 0.05, 0.01), M.paint('#141414', 0.35), {}));
  const s = mesh(new THREE.PlaneGeometry(w, h), M.screen(tex, o.intensity || 1.2), { z: (o.depth || 0.05) / 2 + 0.001, cast: false });
  s.userData.keep = true;
  g.add(s);
  return g;
}

/** Panel lightbox: rangka aluminium + grafis menyala */
export function lightbox(tex, w, h, frameColor = '#1a1a1a', depth = 0.08, intensity = 1.5) {
  const g = new THREE.Group();
  const fm = M.paint(frameColor, 0.4, 0.3);
  const t = 0.025;
  g.add(mesh(box(w, t, depth), fm, { y: h / 2 - t / 2 }));
  g.add(mesh(box(w, t, depth), fm, { y: -h / 2 + t / 2 }));
  g.add(mesh(box(t, h, depth), fm, { x: w / 2 - t / 2 }));
  g.add(mesh(box(t, h, depth), fm, { x: -w / 2 + t / 2 }));
  g.add(mesh(box(w - 0.01, h - 0.01, 0.01), M.paint('#ffffff', 0.9), { z: -depth / 2 + 0.005 }));
  const face = mesh(new THREE.PlaneGeometry(w - 2 * t, h - 2 * t), M.lightbox(tex, intensity), { z: depth / 2 - 0.004, cast: false });
  g.add(face);
  return g;
}

/** Stand akrilik kecil (A5) di meja */
export function acrylicSign(tex, w = 0.15, h = 0.21) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.PlaneGeometry(w, h), M.print(tex, 0.5), { y: h / 2 + 0.01, rx: -0.08 }));
  g.add(mesh(rbox(w + 0.01, h + 0.01, 0.004, 0.002), M.acrylic(), { y: h / 2 + 0.01, z: -0.004, rx: -0.08 }));
  g.add(mesh(rbox(w + 0.02, 0.012, 0.08, 0.002), M.acrylic(), { y: 0.006, z: -0.02 }));
  return g;
}

// ======================================================================
// GANTUNGAN KUNCI / CHARM (detail: ring, rantai, badan charm)
// ======================================================================
const heartShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.15, -0.3, -0.6, -0.05, -0.55, 0.25);
  s.bezierCurveTo(-0.5, 0.55, -0.1, 0.6, 0, 0.32);
  s.bezierCurveTo(0.1, 0.6, 0.5, 0.55, 0.55, 0.25);
  s.bezierCurveTo(0.6, -0.05, 0.15, -0.3, 0, -0.5);
  return s;
};
const starShape = (pts = 5) => {
  const s = new THREE.Shape();
  for (let i = 0; i < pts * 2; i++) {
    const a = (i / (pts * 2)) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 ? 0.22 : 0.5;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  return s;
};
const extr = (key, shape, depth, size) => G(`ex_${key}_${size}`, () => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.4, bevelSize: 0.06, bevelSegments: 3, curveSegments: 16 });
  g.center();
  g.scale(size, size, size);
  return g;
});

const CHARM_COLORS = ['#ff7eb6', '#7fd3ff', '#ffe066', '#b9a6ff', '#9be15d', '#ffffff', '#ff9a3d'];

/**
 * type: 'heart' | 'star' | 'pack' | 'letters' | 'tortilla' | 'croissant' | 'logo' | 'cloud'
 * Origin di titik gantung (ujung atas ring). Menggantung ke -Y.
 */
export function keychain(type, seed = 1, o = {}) {
  const r = rng(seed * 53 + 7);
  const g = new THREE.Group();
  const ch = M.chrome();
  const col = o.color || CHARM_COLORS[Math.floor(r() * CHARM_COLORS.length)];
  // split ring
  g.add(mesh(G('kring', () => new THREE.TorusGeometry(0.012, 0.0018, 8, 24)), ch, { y: -0.012 }));
  // rantai: mata rantai berselang 90 derajat
  let y = -0.026;
  const links = o.links ?? 3;
  for (let i = 0; i < links; i++) {
    g.add(mesh(G('klink', () => new THREE.TorusGeometry(0.0045, 0.0011, 6, 14)), ch, { y, ry: i % 2 ? Math.PI / 2 : 0, sy: 1.5 }));
    y -= 0.0095;
  }
  // jump ring
  g.add(mesh(G('kjump', () => new THREE.TorusGeometry(0.004, 0.0012, 6, 14)), ch, { y: y - 0.001, ry: Math.PI / 2 }));
  y -= 0.006;
  const body = new THREE.Group();
  switch (type) {
    case 'heart': {
      body.add(mesh(extr('heart', heartShape(), 0.25, 0.05), M.gloss(col, 0.18), {}));
      body.add(mesh(extr('heartIn', heartShape(), 0.25, 0.03), M.gloss('#ffffff', 0.2), { z: 0.006 }));
      body.position.y = -0.024;
      break;
    }
    case 'star':
      body.add(mesh(extr('star', starShape(), 0.3, 0.055), M.gloss(col, 0.2), {}));
      body.position.y = -0.026;
      break;
    case 'pack': {
      const v = ['sweet', 'tortilla', 'croissant', 'choco'][Math.floor(r() * 4)];
      body.add(mesh(packGeo(0.034, 0.05, 0.012), M.pack(T.jetzPack(v)), {}));
      body.position.y = -0.027;
      break;
    }
    case 'letters': {
      // manik huruf kubus + manik bulat warna
      const word = o.word || ['S2U', 'H2H', 'JETZ', 'GESREK', 'RECEH'][Math.floor(r() * 5)];
      let yy = 0;
      for (let i = 0; i < word.length + 2; i++) {
        const isLetter = i > 0 && i <= word.length;
        if (isLetter) body.add(mesh(rbox(0.009, 0.009, 0.009, 0.0015), M.plastic('#ffffff', 0.3), { y: yy }));
        else body.add(mesh(G('kbead', () => new THREE.SphereGeometry(0.0055, 12, 10)), M.gloss(CHARM_COLORS[(i + seed) % CHARM_COLORS.length], 0.15), { y: yy }));
        if (isLetter) body.add(mesh(box(0.005, 0.005, 0.0004), M.paint('#222', 0.5), { y: yy, z: 0.0047, cast: false }));
        yy -= 0.0105;
      }
      body.add(mesh(G('kheart_s', () => extr('heartS', heartShape(), 0.3, 0.022)), M.gloss('#ff4f98', 0.2), { y: yy - 0.008 }));
      body.position.y = -0.006;
      break;
    }
    case 'tortilla': {
      const s = new THREE.Shape(); s.moveTo(0, 0.5); s.lineTo(0.45, -0.35); s.quadraticCurveTo(0, -0.45, -0.45, -0.35); s.closePath();
      body.add(mesh(extr('tort', s, 0.15, 0.05), M.paint('#f0b545', 0.6), { rz: 0.1 }));
      body.position.y = -0.026;
      break;
    }
    case 'croissant': {
      for (let k = -2; k <= 2; k++) {
        body.add(mesh(G('crs', () => new THREE.SphereGeometry(0.01, 12, 10)), M.paint(k % 2 ? '#d8913c' : '#efb35d', 0.55), { x: k * 0.008, y: -Math.abs(k) * 0.004, sx: 0.9, sy: 1.6 - Math.abs(k) * 0.25, rz: k * 0.35 }));
      }
      body.position.y = -0.02;
      break;
    }
    case 'logo': {
      body.add(mesh(G('klogo', () => new THREE.CylinderGeometry(0.022, 0.022, 0.004, 32)), M.acrylic('#dff3ff', 0.08), { rx: Math.PI / 2 }));
      const t = G('klogoTex', () => T.canvasTex(128, 128, (ctx, w, h) => { ctx.clearRect(0, 0, w, h); T.drawJetzLogo(ctx, 64, 64, 40); }));
      body.add(mesh(G('klogoP', () => new THREE.CircleGeometry(0.02, 32)), M.print(t, 0.3, { transparent: true }), { z: 0.0025, cast: false }));
      body.position.y = -0.024;
      break;
    }
    case 'cloud': {
      [[-0.01, 0], [0.01, 0], [0, 0.008], [-0.018, -0.006], [0.018, -0.006]].forEach(([x, yy]) => body.add(mesh(G('kcl', () => new THREE.SphereGeometry(0.011, 14, 10)), M.gloss(col, 0.25), { x, y: yy, sz: 0.5 })));
      body.position.y = -0.02;
      break;
    }
  }
  body.position.y += y;
  body.rotation.y = (r() - 0.5) * 0.6;
  g.add(body);
  return g;
}

/** Hook pegboard krom (kawat) */
export function pegHook(len = 0.12) {
  const g = new THREE.Group();
  const ch = M.chrome();
  g.add(mesh(G('hookrod_' + len, () => new THREE.CylinderGeometry(0.0025, 0.0025, len, 8)), ch, { z: len / 2, rx: Math.PI / 2 }));
  g.add(mesh(G('hooktip', () => new THREE.CylinderGeometry(0.0025, 0.0025, 0.018, 8)), ch, { z: len, y: 0.008 }));
  g.add(mesh(rbox(0.012, 0.025, 0.004, 0.002), ch, { y: -0.004 }));
  return g;
}

// ======================================================================
// MERCHANDISE
// ======================================================================
export function backpack(o = {}) {
  const g = new THREE.Group();
  const bm = M.fabric('#151515');
  g.add(mesh(rbox(0.28, 0.36, 0.14, 0.06), bm, { y: 0.18 }));
  g.add(mesh(rbox(0.22, 0.16, 0.05, 0.03), bm, { y: 0.11, z: 0.08 }));
  g.add(mesh(new THREE.PlaneGeometry(0.1, 0.1), M.print(T.backpackPrint(), 0.7), { y: 0.13, z: 0.106 }));
  g.add(mesh(G('bphandle', () => new THREE.TorusGeometry(0.035, 0.008, 6, 16, Math.PI)), bm, { y: 0.36 }));
  g.add(mesh(new THREE.TorusGeometry(0.11, 0.01, 6, 20, Math.PI * 0.9), M.fabric('#0e0e0e'), { y: 0.2, z: -0.08, rz: Math.PI / 2 + 0.1, sx: 1.4 }));
  // ritsleting
  g.add(mesh(G('bpzip', () => new THREE.TorusGeometry(0.13, 0.003, 4, 30, Math.PI)), M.metal('#888', 0.4), { y: 0.19, z: 0.0, sx: 1.05, sy: 1.25 }));
  return g;
}

export function toteBag(tex, color = '#f3ead8') {
  const g = new THREE.Group();
  const fm = M.fabric(color);
  g.add(mesh(rbox(0.34, 0.38, 0.03, 0.006), fm, { y: 0.19 }));
  g.add(mesh(new THREE.PlaneGeometry(0.28, 0.28), M.print(tex, 0.85), { y: 0.19, z: 0.016 }));
  g.add(mesh(G('totehandle', () => new THREE.TorusGeometry(0.08, 0.008, 6, 20, Math.PI)), fm, { x: -0.07, y: 0.38 }));
  g.add(mesh(G('totehandle', () => new THREE.TorusGeometry(0.08, 0.008, 6, 20, Math.PI)), fm, { x: 0.07, y: 0.38, z: 0.003 }));
  return g;
}

/** Tumpukan photocard di display akrilik */
export function photocardStand(names, team) {
  const g = new THREE.Group();
  names.forEach((n, i) => {
    g.add(mesh(new THREE.PlaneGeometry(0.055, 0.085), M.print(T.photocardTex(n, team, i), 0.3), { x: (i - (names.length - 1) / 2) * 0.065, y: 0.055, rx: -0.15 }));
  });
  g.add(mesh(rbox(names.length * 0.065 + 0.02, 0.012, 0.06, 0.003), M.acrylic(), { y: 0.006 }));
  g.add(mesh(rbox(names.length * 0.065 + 0.02, 0.09, 0.004, 0.002), M.acrylic(), { y: 0.05, z: -0.012, rx: -0.15 }));
  return g;
}

/** Baki akrilik dengan isi manik (di-bake) */
export function beadTray(seed = 1, kind = 'beads', w = 0.26, d = 0.17) {
  const g = new THREE.Group();
  const am = M.acrylic('#ffffff', 0.06);
  const t = 0.004, h = 0.035;
  g.add(mesh(box(w, t, d), am, { y: t / 2 }));
  g.add(mesh(box(w, h, t), am, { y: h / 2, z: d / 2 }));
  g.add(mesh(box(w, h, t), am, { y: h / 2, z: -d / 2 }));
  g.add(mesh(box(t, h, d), am, { x: w / 2, y: h / 2 }));
  g.add(mesh(box(t, h, d), am, { x: -w / 2, y: h / 2 }));
  // sekat 3 kompartemen
  g.add(mesh(box(t, h * 0.8, d), am, { x: -w / 6, y: h * 0.4 }));
  g.add(mesh(box(t, h * 0.8, d), am, { x: w / 6, y: h * 0.4 }));
  const r = rng(seed * 11);
  const fill = new THREE.Group();
  for (let c = 0; c < 3; c++) {
    const cx = (c - 1) * (w / 3);
    const n = 70;
    for (let i = 0; i < n; i++) {
      const x = cx + (r() - 0.5) * (w / 3 - 0.014);
      const z = (r() - 0.5) * (d - 0.014);
      const y = t + 0.004 + r() * 0.012;
      const kindHere = kind === 'mixed' ? ['beads', 'letters', 'charms'][c] : kind;
      if (kindHere === 'letters') {
        fill.add(mesh(box(0.008, 0.008, 0.008), M.plastic('#fafafa', 0.35), { x, y, z, rx: r() * 3, ry: r() * 3 }));
      } else if (kindHere === 'charms') {
        const col = CHARM_COLORS[Math.floor(r() * CHARM_COLORS.length)];
        if (i % 3 === 0) fill.add(mesh(extr('heartT', heartShape(), 0.3, 0.018), M.gloss(col, 0.2), { x, y, z, rx: -Math.PI / 2 + (r() - 0.5), rz: r() * 6 }));
        else if (i % 3 === 1) fill.add(mesh(extr('starT', starShape(), 0.3, 0.02), M.gloss(col, 0.2), { x, y, z, rx: -Math.PI / 2 + (r() - 0.5), rz: r() * 6 }));
        else fill.add(mesh(G('trring', () => new THREE.TorusGeometry(0.01, 0.0016, 6, 16)), M.chrome(), { x, y, z, rx: Math.PI / 2 + (r() - 0.5) }));
      } else {
        const col = CHARM_COLORS[Math.floor(r() * CHARM_COLORS.length)];
        fill.add(mesh(G('tbead', () => new THREE.SphereGeometry(0.004, 8, 6)), M.gloss(col, 0.15), { x, y, z }));
      }
    }
  }
  g.add(bake(fill));
  return g;
}

/** Tang & gunting kecil untuk workshop */
export function pliers() {
  const g = new THREE.Group();
  const hm = M.plastic('#ff7eb6', 0.4), mm = M.metal('#9aa0a6', 0.3);
  g.add(mesh(rbox(0.012, 0.004, 0.05, 0.002), mm, { z: 0.03 }));
  g.add(mesh(rbox(0.012, 0.006, 0.07, 0.003), hm, { x: -0.01, z: -0.03, ry: 0.15 }));
  g.add(mesh(rbox(0.012, 0.006, 0.07, 0.003), hm, { x: 0.01, z: -0.03, ry: -0.15 }));
  return g;
}

export function spool(color) {
  const g = new THREE.Group();
  g.add(mesh(G('spool', () => new THREE.CylinderGeometry(0.018, 0.018, 0.02, 20)), M.fabric(color), { y: 0.01 }));
  g.add(mesh(G('spoolE', () => new THREE.CylinderGeometry(0.024, 0.024, 0.003, 20)), M.plastic('#ffffff'), { y: 0.0015 }));
  g.add(mesh(G('spoolE', () => new THREE.CylinderGeometry(0.024, 0.024, 0.003, 20)), M.plastic('#ffffff'), { y: 0.0185 }));
  return g;
}

/** Rak headphone silent disco */
export function headphoneRack(n = 8) {
  const g = new THREE.Group();
  const al = M.paint('#f4f4f4', 0.4);
  g.add(mesh(rbox(0.5, 0.04, 0.35, 0.01), al, { y: 0.02 }));
  g.add(mesh(G('hrpole', () => new THREE.CylinderGeometry(0.02, 0.02, 1.4, 16)), al, { y: 0.72 }));
  const cols = ['#ff7eb6', '#7fd3ff', '#ffffff', '#b9a6ff'];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const yy = 0.9 + Math.floor(i / 4) * 0.35;
    const arm = new THREE.Group();
    arm.add(mesh(box(0.18, 0.012, 0.012), al, { x: 0.09 }));
    const hp = new THREE.Group();
    const hm = M.plastic(cols[i % cols.length], 0.35);
    hp.add(mesh(G('hpband', () => new THREE.TorusGeometry(0.07, 0.008, 8, 20, Math.PI)), hm, {}));
    [-1, 1].forEach(s => hp.add(mesh(G('hpcup', () => new THREE.CylinderGeometry(0.038, 0.038, 0.03, 18)), hm, { x: s * 0.07, y: -0.01, rz: Math.PI / 2 })));
    hp.position.set(0.17, -0.005, 0);
    hp.rotation.y = Math.PI / 2;
    arm.add(hp);
    arm.position.y = yy;
    arm.rotation.y = a;
    g.add(arm);
  }
  g.add(mesh(new THREE.PlaneGeometry(0.3, 0.2), M.print(T.smallSign(['SILENT DISCO', 'Ambil headphone,', 'JetZrek-in aja!'], { w: 512, h: 340, bg: '#ff7eb6', color: '#ffffff', bigIndex: 0 }), 0.5), { y: 0.55, z: 0.021 }));
  return g;
}

/** Track light kepala lampu (visual) */
export function trackHead() {
  const g = new THREE.Group();
  const bm = M.paint('#141414', 0.35, 0.4);
  g.add(mesh(box(0.05, 0.03, 0.05), bm, {}));
  g.add(mesh(G('thyoke', () => new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8)), bm, { y: -0.04 }));
  const head = new THREE.Group();
  head.add(mesh(G('thbody', () => new THREE.CylinderGeometry(0.038, 0.034, 0.14, 20)), bm, { rx: Math.PI / 2 }));
  head.add(mesh(G('thlens', () => new THREE.CircleGeometry(0.03, 20)), M.emissive('#fff3dd', 6), { z: 0.0705, cast: false }));
  head.position.y = -0.09;
  g.add(head);
  g.userData.head = head;
  return g;
}
