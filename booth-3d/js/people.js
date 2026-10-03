import * as THREE from 'three';
import { M } from './core/mat.js';
import { mesh, rbox, bake, rng } from './core/util.js';
import * as T from './core/tex.js';

// ======================================================================
// Generator manusia prosedural (rig sendi sederhana, bisa diposekan).
// Dipakai untuk: pengunjung, crew/SPG, DJ/MC, dan standee cutout
// (standee = figur yang sama lalu "dipipihkan" jadi papan cetak).
// ======================================================================

const geoCache = new Map();
function cachedGeo(key, make) {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key);
}

/** limb: tabung meruncing dengan ujung membulat, puncak di y=0 memanjang ke -y */
function limbGeo(rTop, rBot, len, seg = 14) {
  const key = `limb_${rTop.toFixed(3)}_${rBot.toFixed(3)}_${len.toFixed(3)}`;
  return cachedGeo(key, () => {
    const pts = [];
    const N = 5;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI / 2;
      pts.push(new THREE.Vector2(Math.max(rTop * Math.sin(a), 0.0005), rTop * Math.cos(a)));
    }
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      // sedikit menggembung (otot) di 30% atas
      const bulge = Math.sin(t * Math.PI) * 0.12 * (rTop + rBot) * 0.5;
      pts.push(new THREE.Vector2(THREE.MathUtils.lerp(rTop, rBot, t) + bulge, -len * t));
    }
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI / 2;
      pts.push(new THREE.Vector2(Math.max(rBot * Math.cos(a), 0.0005), -len - rBot * Math.sin(a)));
    }
    return new THREE.LatheGeometry(pts, seg);
  });
}

function latheProfile(key, profile, seg = 24) {
  return cachedGeo(key, () => new THREE.LatheGeometry(profile.map(([y, r]) => new THREE.Vector2(r, y)), seg));
}

const sphere = (r, ws = 20, hs = 14) => cachedGeo(`sph_${r}_${ws}`, () => new THREE.SphereGeometry(r, ws, hs));

export const SKIN = ['#f3d2b8', '#eac4a4', '#dfb08c', '#c99470', '#f6dcc6', '#b98260'];
export const HAIR = ['#141110', '#231915', '#3b2a20', '#5a3d2a', '#7a5a3e', '#c9b08a', '#2b2340', '#8a4a3a'];

/**
 * opts:
 *  gender 'f'|'m', height (m), skin, hair:{style,color}, top:{type,color,color2,sleeve:'long'|'short'},
 *  bottom:{type:'pants'|'jeans'|'skirt'|'shorts'|'wideleg', color}, shoes:{color, sole},
 *  acc: {bag:'tote'|'backpack'|'sling'|'paper'|null, bagColor, phone, cap, capColor, glasses, headphones, lanyard, lanyardColor}
 */
export function createPerson(opts = {}) {
  const o = Object.assign({
    gender: 'f', height: 1.62, skin: SKIN[0],
    hair: { style: 'long', color: HAIR[1] },
    top: { type: 'tee', color: '#ffffff', sleeve: 'short' },
    bottom: { type: 'jeans', color: '#5b7bb0' },
    shoes: { color: '#f2f2f2', sole: '#ffffff' },
    acc: {},
  }, opts);
  const S = o.height / (o.gender === 'f' ? 1.62 : 1.74);
  const f = o.gender === 'f';
  const k = (v) => v * S;

  const skinM = M.skin(o.skin);
  const topM = M.fabric(o.top.color);
  const top2M = M.fabric(o.top.color2 || o.top.color);
  const botM = o.bottom.type === 'jeans' || o.bottom.type === 'wideleg' ? M.fabric(o.bottom.color) : M.fabric(o.bottom.color);
  const shoeM = M.plastic(o.shoes.color, 0.5);
  const soleM = M.rubber(o.shoes.sole || '#f5f5f5');
  const hairM = M.hair(o.hair.color);
  const dark = M.paint('#1b1412', 0.3);

  // ---- dimensi ----
  const thigh = k(f ? 0.40 : 0.43), shin = k(f ? 0.39 : 0.42), ankle = k(0.065);
  const hipY = thigh + shin + ankle;
  const hipHalf = k(f ? 0.088 : 0.092);
  const torsoLen = k(f ? 0.36 : 0.40);
  const shoulderHalf = k(f ? 0.165 : 0.2);
  const upperArm = k(f ? 0.27 : 0.30), foreArm = k(f ? 0.24 : 0.265);
  const neckLen = k(0.075);

  const root = new THREE.Group();
  root.name = 'person';
  const J = {}; // joints

  // ---- pelvis ----
  const pelvis = new THREE.Group();
  pelvis.position.y = hipY;
  root.add(pelvis);
  J.pelvis = pelvis;
  const pelvisProf = f
    ? [[-0.10, 0.02], [-0.085, 0.10], [-0.04, 0.155], [0.02, 0.172], [0.08, 0.152], [0.13, 0.13]]
    : [[-0.10, 0.02], [-0.085, 0.10], [-0.04, 0.15], [0.02, 0.158], [0.08, 0.15], [0.13, 0.145]];
  const pelvisGeo = latheProfile(`pelvis_${o.gender}_${S.toFixed(3)}`, pelvisProf.map(([y, r]) => [k(y), k(r)]));
  const isSkirt = o.bottom.type === 'skirt';
  pelvis.add(mesh(pelvisGeo, isSkirt ? botM : botM, { sz: 0.68 }));

  // ---- torso ----
  const torso = new THREE.Group();
  torso.position.y = k(0.12);
  pelvis.add(torso);
  J.torso = torso;
  const torsoProf = f
    ? [[0, 0.132], [0.06, 0.128], [0.14, 0.15], [0.2, 0.165], [0.26, 0.158], [0.31, 0.15], [0.35, 0.115], [0.375, 0.055], [0.38, 0.04]]
    : [[0, 0.145], [0.08, 0.15], [0.18, 0.168], [0.27, 0.18], [0.33, 0.17], [0.375, 0.12], [0.4, 0.06], [0.405, 0.045]];
  const torsoGeo = latheProfile(`torso_${o.gender}_${S.toFixed(3)}`, torsoProf.map(([y, r]) => [k(y), k(r)]));
  const torsoMesh = mesh(torsoGeo, topM, { sz: f ? 0.64 : 0.6 });
  torso.add(torsoMesh);

  // detail atasan
  const tt = o.top.type;
  if (tt === 'hoodie') {
    torso.add(mesh(sphere(k(0.1)), topM, { y: torsoLen - k(0.02), z: -k(0.08), sx: 1.4, sy: 0.7, sz: 0.8 }));
    torso.add(mesh(rbox(k(0.2), k(0.09), k(0.03), k(0.01)), topM, { y: k(0.1), z: k(0.085) })); // kantong kanguru
  } else if (tt === 'polo' || tt === 'shirt') {
    torso.add(mesh(limbGeo(k(0.06), k(0.065), k(0.03)), tt === 'polo' ? top2M : topM, { y: torsoLen + k(0.02), sz: 0.9 }));
    if (tt === 'shirt') {
      for (let i = 0; i < 4; i++) torso.add(mesh(sphere(k(0.005), 8, 6), M.plastic('#eeeeee'), { y: k(0.08) + i * k(0.07), z: k(0.098) }));
    }
  } else if (tt === 'blazer' || tt === 'vest' || tt === 'cardigan') {
    // kemeja putih di dalam + lapel
    const shirtM = M.fabric('#f7f7f5');
    torso.add(mesh(rbox(k(0.06), k(0.16), k(0.01), k(0.004)), shirtM, { y: torsoLen - k(0.09), z: k(0.094) }));
    if (o.top.tie) torso.add(mesh(rbox(k(0.03), k(0.14), k(0.008), k(0.003)), M.fabric(o.top.tie), { y: torsoLen - k(0.12), z: k(0.1) }));
    torso.add(mesh(rbox(k(0.035), k(0.18), k(0.01), k(0.004)), top2M, { x: -k(0.04), y: torsoLen - k(0.1), z: k(0.092), rz: -0.25 }));
    torso.add(mesh(rbox(k(0.035), k(0.18), k(0.01), k(0.004)), top2M, { x: k(0.04), y: torsoLen - k(0.1), z: k(0.092), rz: 0.25 }));
  } else if (tt === 'crop') {
    // crop top: perut kulit
    torso.add(mesh(limbGeo(k(0.131), k(0.131), k(0.07)), skinM, { y: k(0.075), sz: 0.64 }));
  }
  if (o.acc.lanyard) {
    const lm = M.fabric(o.acc.lanyardColor || '#1460d8');
    torso.add(mesh(new THREE.TorusGeometry(k(0.08), k(0.006), 6, 24, Math.PI), lm, { y: torsoLen - k(0.02), z: k(0.02), rx: Math.PI / 2 + 0.6, rz: Math.PI }));
    torso.add(mesh(rbox(k(0.055), k(0.08), k(0.004), k(0.004)), M.plastic('#ffffff'), { y: torsoLen - k(0.17), z: k(0.104) }));
  }

  // ---- leher & kepala ----
  const neck = new THREE.Group();
  neck.position.y = torsoLen;
  torso.add(neck);
  neck.add(mesh(limbGeo(k(0.047), k(0.05), neckLen), skinM, { y: neckLen, rx: Math.PI }));
  const head = new THREE.Group();
  head.position.y = neckLen;
  neck.add(head);
  J.head = head;
  const hr = k(f ? 0.098 : 0.104);
  head.add(mesh(sphere(hr, 28, 20), skinM, { y: hr * 1.05, sx: 0.84, sy: 1.1, sz: 0.95 }));
  // rahang
  head.add(mesh(sphere(hr * 0.72, 20, 14), skinM, { y: hr * 0.62, z: hr * 0.12, sx: 0.95, sy: 0.85, sz: 0.95 }));
  // telinga
  head.add(mesh(sphere(hr * 0.2, 10, 8), skinM, { x: hr * 0.84, y: hr * 1.0, sx: 0.5, sz: 0.9 }));
  head.add(mesh(sphere(hr * 0.2, 10, 8), skinM, { x: -hr * 0.84, y: hr * 1.0, sx: 0.5, sz: 0.9 }));
  // wajah: mata, alis, hidung, bibir
  const eyeW = M.paint('#fbfbfb', 0.3);
  [-1, 1].forEach(s => {
    head.add(mesh(sphere(hr * 0.13, 12, 10), eyeW, { x: s * hr * 0.33, y: hr * 1.08, z: hr * 0.8, sx: 1.2, sy: 0.75, sz: 0.5 }));
    head.add(mesh(sphere(hr * 0.085, 12, 10), dark, { x: s * hr * 0.33, y: hr * 1.08, z: hr * 0.86, sz: 0.5 }));
    head.add(mesh(rbox(hr * 0.32, hr * 0.06, hr * 0.06, hr * 0.02), hairM, { x: s * hr * 0.34, y: hr * 1.28, z: hr * 0.84, rz: s * -0.12 }));
  });
  head.add(mesh(sphere(hr * 0.1, 10, 8), skinM, { y: hr * 0.9, z: hr * 0.93, sx: 0.8, sy: 1.3 }));
  head.add(mesh(rbox(hr * 0.32, hr * 0.06, hr * 0.06, hr * 0.025), M.paint(f ? '#c8606a' : '#b4776a', 0.4), { y: hr * 0.62, z: hr * 0.84 }));

  // ---- rambut ----
  const hs = o.hair.style;
  const capGeo = cachedGeo(`hcap_${hr.toFixed(4)}`, () => new THREE.SphereGeometry(hr * 1.07, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.56));
  const cap = mesh(capGeo, hairM, { y: hr * 1.1, z: -hr * 0.03, sx: 0.88, sy: 1.05, sz: 1.0 });
  cap.rotation.x = -0.18;
  head.add(cap);
  // poni
  if (hs !== 'bald') {
    const fringe = cachedGeo(`fringe_${hr.toFixed(4)}`, () => new THREE.SphereGeometry(hr * 1.06, 24, 10, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.18, Math.PI * 0.22));
    head.add(mesh(fringe, hairM, { y: hr * 1.06, z: hr * 0.02, sx: 0.88, sy: 1.0, sz: 1.0, ry: 0 }));
  }
  const sideL = (len, w = 0.2) => {
    [-1, 1].forEach(s => head.add(mesh(rbox(hr * 0.22, len, hr * 0.7, hr * 0.1), hairM, { x: s * hr * 0.78, y: hr * 1.2 - len / 2, z: -hr * 0.05 })));
  };
  if (hs === 'long' || hs === 'longwave') {
    const backGeo = cachedGeo(`hback_${hr.toFixed(4)}`, () => {
      const g = new THREE.CylinderGeometry(hr * 0.86, hr * 1.0, hr * 3.3, 24, 1, true, Math.PI * 0.5, Math.PI);
      g.translate(0, -hr * 1.65, 0);
      return g;
    });
    head.add(mesh(backGeo, hairM, { y: hr * 1.35, z: -hr * 0.02, sz: 0.85 }));
    head.add(mesh(rbox(hr * 1.5, hr * 2.6, hr * 0.25, hr * 0.12), hairM, { y: hr * 0.05, z: -hr * 0.62 }));
    sideL(hr * 2.0);
  } else if (hs === 'bob') {
    head.add(mesh(rbox(hr * 1.75, hr * 1.2, hr * 1.5, hr * 0.5), hairM, { y: hr * 0.95, z: -hr * 0.18 }));
  } else if (hs === 'ponytail') {
    head.add(mesh(limbGeo(hr * 0.24, hr * 0.12, hr * 2.0), hairM, { y: hr * 1.55, z: -hr * 0.95, rx: 0.35 }));
    head.add(mesh(sphere(hr * 0.16, 10, 8), M.fabric('#ff8fbf'), { y: hr * 1.58, z: -hr * 0.92 }));
  } else if (hs === 'bun') {
    head.add(mesh(sphere(hr * 0.36, 16, 12), hairM, { y: hr * 2.0, z: -hr * 0.45 }));
  } else if (hs === 'medium') {
    sideL(hr * 0.9);
    head.add(mesh(rbox(hr * 1.6, hr * 0.9, hr * 0.3, hr * 0.12), hairM, { y: hr * 0.7, z: -hr * 0.75 }));
  } else if (hs === 'short') {
    sideL(hr * 0.5);
  }

  // ---- lengan ----
  const sleeveLong = o.top.sleeve === 'long';
  const armTopM = sleeveLong ? (tt === 'blazer' || tt === 'cardigan' ? topM : topM) : skinM;
  [-1, 1].forEach(s => {
    const side = s > 0 ? 'L' : 'R';
    const sh = new THREE.Group();
    sh.position.set(s * shoulderHalf, torsoLen - k(0.035), 0);
    torso.add(sh);
    J['shoulder' + side] = sh;
    sh.add(mesh(sphere(k(0.052), 16, 12), sleeveLong || tt !== 'crop' ? topM : skinM, {}));
    sh.add(mesh(limbGeo(k(0.045), k(0.036), upperArm), armTopM, {}));
    if (!sleeveLong && tt !== 'crop' && tt !== 'tank') {
      sh.add(mesh(limbGeo(k(0.058), k(0.052), upperArm * 0.42), topM, {}));
    }
    const el = new THREE.Group();
    el.position.y = -upperArm;
    sh.add(el);
    J['elbow' + side] = el;
    el.add(mesh(limbGeo(k(0.035), k(0.026), foreArm), sleeveLong ? topM : skinM, {}));
    if (sleeveLong) el.add(mesh(limbGeo(k(0.03), k(0.028), k(0.02)), skinM, { y: -foreArm + k(0.005) }));
    const wr = new THREE.Group();
    wr.position.y = -foreArm - k(0.01);
    el.add(wr);
    J['wrist' + side] = wr;
    wr.add(mesh(rbox(k(0.07), k(0.085), k(0.028), k(0.012)), skinM, { y: -k(0.045) }));
    wr.add(mesh(limbGeo(k(0.011), k(0.009), k(0.04)), skinM, { x: s * k(0.035), y: -k(0.02), z: k(0.01), rz: s * 0.5 }));
  });

  // ---- kaki ----
  const legTopM = (o.bottom.type === 'shorts' || isSkirt) ? skinM : botM;
  const legLowM = (o.bottom.type === 'shorts' || isSkirt) ? (o.bottom.socks ? M.fabric(o.bottom.socks) : skinM) : botM;
  [-1, 1].forEach(s => {
    const side = s > 0 ? 'L' : 'R';
    const hip = new THREE.Group();
    hip.position.set(s * hipHalf, 0, 0);
    pelvis.add(hip);
    J['hip' + side] = hip;
    const wide = o.bottom.type === 'wideleg' ? 1.25 : 1;
    hip.add(mesh(limbGeo(k(0.078) * wide, k(0.052) * wide, thigh), legTopM, {}));
    if (o.bottom.type === 'shorts') hip.add(mesh(limbGeo(k(0.085), k(0.075), thigh * 0.45), botM, {}));
    const kn = new THREE.Group();
    kn.position.y = -thigh;
    hip.add(kn);
    J['knee' + side] = kn;
    kn.add(mesh(limbGeo(k(0.05) * wide, k(0.034) * (o.bottom.type === 'wideleg' ? 1.6 : 1), shin), legLowM, {}));
    if (o.bottom.socks && (isSkirt || o.bottom.type === 'shorts')) {
      kn.add(mesh(limbGeo(k(0.05), k(0.036), shin * 0.98), M.fabric(o.bottom.socks), { y: -shin * 0.02 }));
    }
    const an = new THREE.Group();
    an.position.y = -shin;
    kn.add(an);
    J['ankle' + side] = an;
    an.add(mesh(rbox(k(0.095), k(0.07), k(0.25), k(0.03)), shoeM, { y: -ankle + k(0.04), z: k(0.045) }));
    an.add(mesh(rbox(k(0.1), k(0.022), k(0.258), k(0.01)), soleM, { y: -ankle + k(0.008), z: k(0.045) }));
  });

  // rok
  if (isSkirt) {
    const skirtLen = k(o.bottom.length || 0.38);
    const sg = cachedGeo(`skirt_${skirtLen.toFixed(3)}_${S.toFixed(3)}_${o.bottom.flare || 1}`, () => {
      const fl = o.bottom.flare || 1;
      return new THREE.LatheGeometry([
        new THREE.Vector2(k(0.14), k(0.12)), new THREE.Vector2(k(0.165), k(0.02)),
        new THREE.Vector2(k(0.2) * fl, -skirtLen * 0.6), new THREE.Vector2(k(0.225) * fl, -skirtLen + k(0.12)),
        new THREE.Vector2(k(0.22) * fl, -skirtLen + k(0.11)),
      ], 28);
    });
    const skirt = mesh(sg, botM, { sz: 0.78 });
    skirt.material = botM;
    pelvis.add(skirt);
    J.skirt = skirt;
    if (o.bottom.pattern === 'plaid') {
      // garis kotak-kotak tipis
      const lineM = M.fabric(o.bottom.lineColor || '#2a3a6a');
      for (let i = 0; i < 2; i++) {
        pelvis.add(mesh(new THREE.TorusGeometry(k(0.19) + i * k(0.018), k(0.004), 4, 40), lineM, { y: -skirtLen * (0.35 + i * 0.3), rx: Math.PI / 2, sy: 0.78 }));
      }
    }
  }

  // ---- aksesoris ----
  const A = o.acc;
  if (A.cap) {
    const cm = M.fabric(A.capColor || '#1a1a1a');
    head.add(mesh(cachedGeo(`capc_${hr.toFixed(4)}`, () => new THREE.SphereGeometry(hr * 1.13, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5)), cm, { y: hr * 1.3, sx: 0.9, sz: 1.0, rx: -0.12 }));
    head.add(mesh(cyl(hr * 0.75, hr * 0.75, hr * 0.04, 24), cm, { y: hr * 1.32, z: hr * 0.75, sx: 0.95, sz: 0.65 }));
    if (A.capLogo) head.add(mesh(rbox(hr * 0.6, hr * 0.28, hr * 0.02, hr * 0.02), M.paint(A.capLogo, 0.5), { y: hr * 1.6, z: hr * 0.98, rx: -0.4 }));
  }
  if (A.glasses) {
    const gm = M.paint('#222222', 0.3);
    [-1, 1].forEach(s => head.add(mesh(new THREE.TorusGeometry(hr * 0.2, hr * 0.025, 6, 20), gm, { x: s * hr * 0.33, y: hr * 1.08, z: hr * 0.9 })));
  }
  if (A.headphones) {
    const hm = M.plastic(A.headphoneColor || '#f5f5f5', 0.35);
    head.add(mesh(new THREE.TorusGeometry(hr * 1.02, hr * 0.08, 8, 28, Math.PI), hm, { y: hr * 1.15, sx: 0.95 }));
    [-1, 1].forEach(s => head.add(mesh(cyl(hr * 0.32, hr * 0.32, hr * 0.22, 20), hm, { x: s * hr * 0.92, y: hr * 1.05, rz: Math.PI / 2 })));
  }
  if (A.bag === 'backpack') {
    const bm = A.bagTex ? M.print(A.bagTex, 0.7) : M.fabric(A.bagColor || '#1a1a1a');
    const bg = new THREE.Group();
    bg.add(mesh(rbox(k(0.27), k(0.36), k(0.13), k(0.05)), M.fabric(A.bagColor || '#151515'), {}));
    if (A.bagTex) bg.add(mesh(new THREE.PlaneGeometry(k(0.15), k(0.15)), bm, { z: -k(0.066), ry: Math.PI, y: -k(0.03) }));
    bg.position.set(0, torsoLen * 0.55, -k(0.17));
    torso.add(bg);
    [-1, 1].forEach(s => torso.add(mesh(rbox(k(0.03), k(0.3), k(0.012), k(0.005)), M.fabric('#111111'), { x: s * k(0.09), y: torsoLen * 0.6, z: k(0.095), rx: 0.1 })));
  } else if (A.bag === 'tote') {
    const tm = A.bagTex ? M.print(A.bagTex, 0.85) : M.fabric(A.bagColor || '#efe6d2');
    const tg = new THREE.Group();
    tg.add(mesh(rbox(k(0.32), k(0.36), k(0.05), k(0.01)), M.fabric(A.bagColor || '#efe6d2'), {}));
    if (A.bagTex) tg.add(mesh(new THREE.PlaneGeometry(k(0.28), k(0.28)), tm, { x: k(0.026), ry: Math.PI / 2 }));
    tg.add(mesh(new THREE.TorusGeometry(k(0.16), k(0.008), 6, 20, Math.PI), M.fabric(A.bagColor || '#efe6d2'), { y: k(0.18), ry: Math.PI / 2 }));
    tg.position.set(shoulderHalf + k(0.05), -k(0.05), 0);
    tg.rotation.z = 0.08;
    torso.add(tg);
  } else if (A.bag === 'sling') {
    const sm = M.fabric(A.bagColor || '#2a2a2a');
    torso.add(mesh(rbox(k(0.2), k(0.12), k(0.06), k(0.03)), sm, { x: -k(0.05), y: k(0.08), z: k(0.12), rz: 0.4 }));
    torso.add(mesh(rbox(k(0.03), k(0.55), k(0.01), k(0.004)), sm, { y: torsoLen * 0.55, z: k(0.1), rz: -0.75 }));
  }

  const person = { root, J, o, S, dims: { hipY, thigh, shin, upperArm, foreArm, torsoLen, hr } };

  // tangan memegang barang
  if (A.phone) attachPhone(person, A.phone === true ? 'R' : A.phone);
  if (A.bag === 'paper') attachInHand(person, 'L', paperBag(S, A.bagTex));
  if (A.holding) attachInHand(person, A.holdingSide || 'L', A.holding);
  return person;
}

function cyl(rt, rb, h, seg = 24) {
  return cachedGeo(`cyl_${rt.toFixed(4)}_${rb.toFixed(4)}_${h.toFixed(4)}_${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));
}

export function attachInHand(person, side, obj) {
  const wr = person.J['wrist' + side];
  obj.position.y += -0.09 * person.S;
  wr.add(obj);
  return obj;
}

function attachPhone(person, side) {
  const g = new THREE.Group();
  const S = person.S;
  g.add(mesh(rbox(0.074 * S, 0.155 * S, 0.008, 0.008), M.paint('#1d1d22', 0.25, 0.4), {}));
  const scr = mesh(new THREE.PlaneGeometry(0.066 * S, 0.145 * S), M.emissive('#cfe6ff', 0.6, '#0a0a0a'), { z: 0.0045, cast: false });
  g.add(scr);
  // kamera belakang
  g.add(mesh(rbox(0.026, 0.026, 0.004, 0.006), M.paint('#0e0e10', 0.2), { x: -0.018 * S, y: 0.055 * S, z: -0.006 }));
  g.position.set(0, -0.05 * S, 0.02 * S);
  g.rotation.x = Math.PI;
  person.J['wrist' + side].add(g);
  person.phone = g;
}

function paperBag(S, tex) {
  const g = new THREE.Group();
  const bm = M.paint('#c9a675', 0.85);
  g.add(mesh(rbox(0.26 * S, 0.3 * S, 0.12 * S, 0.004), bm, { y: -0.2 * S }));
  if (tex) g.add(mesh(new THREE.PlaneGeometry(0.2 * S, 0.2 * S), M.print(tex, 0.8), { y: -0.2 * S, z: 0.061 * S }));
  g.add(mesh(new THREE.TorusGeometry(0.05 * S, 0.004, 6, 16, Math.PI), M.paint('#8a6a40', 0.7), { y: -0.05 * S }));
  return g;
}

// ======================================================================
// POSE
// ======================================================================
const R = (o, x = 0, y = 0, z = 0) => o && o.rotation.set(x, y, z);

export function pose(p, name, a = {}) {
  const J = p.J;
  // reset
  ['torso', 'head', 'shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL', 'wristR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR'].forEach(n => R(J[n]));
  J.pelvis.rotation.set(0, 0, 0);
  J.pelvis.position.y = p.dims.hipY;
  const t = a.phase ?? 0;
  switch (name) {
    case 'stand':
      R(J.shoulderL, 0.05, 0, 0.1); R(J.shoulderR, 0.02, 0, -0.1);
      R(J.elbowL, -0.18); R(J.elbowR, -0.12);
      R(J.hipL, 0, 0, 0.03); R(J.hipR, -0.04, 0, -0.05); R(J.kneeR, 0.08);
      J.pelvis.rotation.z = 0.025;
      R(J.head, a.look ?? 0.05, a.yaw ?? 0, 0);
      break;
    case 'walk': {
      const s = Math.sin(t), c = Math.cos(t);
      R(J.hipL, -0.42 * s, 0, 0.02); R(J.hipR, 0.42 * s, 0, -0.02);
      R(J.kneeL, Math.max(0, 0.55 * c) + 0.08); R(J.kneeR, Math.max(0, -0.55 * c) + 0.08);
      R(J.ankleL, 0.2 * s); R(J.ankleR, -0.2 * s);
      R(J.shoulderL, 0.38 * s, 0, 0.08); R(J.shoulderR, -0.38 * s, 0, -0.08);
      R(J.elbowL, -0.35); R(J.elbowR, -0.35);
      R(J.torso, 0.04, 0.06 * s, 0);
      R(J.head, a.look ?? 0.02, a.yaw ?? 0, 0);
      J.pelvis.position.y = p.dims.hipY - 0.015 * Math.abs(c);
      break;
    }
    case 'selfie':
      R(J.shoulderR, -2.0, 0, -0.35); R(J.elbowR, -0.55);
      R(J.wristR, 0.2, 0, 0);
      R(J.shoulderL, -0.25, 0, 0.55); R(J.elbowL, -2.3); // peace dekat wajah
      R(J.head, -0.12, 0.25, 0.12);
      R(J.hipR, -0.05, 0, -0.04); R(J.kneeR, 0.15);
      break;
    case 'photo':
      R(J.shoulderR, -1.25, 0, 0.18); R(J.elbowR, -0.85);
      R(J.shoulderL, -1.25, 0, -0.18); R(J.elbowL, -0.85);
      R(J.wristR, -0.4); R(J.head, 0.15);
      R(J.hipL, -0.15); R(J.kneeL, 0.12);
      break;
    case 'phone':
      R(J.shoulderR, -0.35, 0, -0.08); R(J.elbowR, -1.55); R(J.wristR, -0.5);
      R(J.shoulderL, 0.05, 0, 0.1); R(J.elbowL, -0.2);
      R(J.head, 0.42); R(J.hipR, -0.04); R(J.kneeR, 0.1);
      break;
    case 'peace':
      R(J.shoulderR, -0.3, 0, -0.55); R(J.elbowR, -2.45);
      R(J.shoulderL, 0.05, 0, 0.12); R(J.elbowL, -0.2);
      R(J.head, -0.05, 0, a.tilt ?? 0.12);
      R(J.hipL, 0, 0, 0.06); R(J.kneeL, 0.12);
      break;
    case 'heart': // finger heart di atas kepala
      R(J.shoulderR, -2.6, 0, -0.5); R(J.elbowR, -1.2);
      R(J.shoulderL, -2.6, 0, 0.5); R(J.elbowL, -1.2);
      R(J.head, -0.05);
      break;
    case 'wave':
      R(J.shoulderR, -0.3, 0, -2.3); R(J.elbowR, -0.6);
      R(J.shoulderL, 0.05, 0, 0.1); R(J.elbowL, -0.2);
      R(J.head, 0, a.yaw ?? 0, 0);
      break;
    case 'point':
      R(J.shoulderR, -1.1, 0, -0.7); R(J.elbowR, -0.15);
      R(J.shoulderL, 0, 0, 0.1); R(J.elbowL, -0.3);
      R(J.head, 0, -0.4, 0);
      break;
    case 'cashier':
      R(J.shoulderR, -0.55, 0, 0.05); R(J.elbowR, -1.0);
      R(J.shoulderL, -0.55, 0, -0.05); R(J.elbowL, -1.0);
      R(J.torso, 0.06); R(J.head, 0.15);
      break;
    case 'hand': // menyerahkan barang
      R(J.shoulderR, -0.9, 0, 0.05); R(J.elbowR, -0.55);
      R(J.shoulderL, 0, 0, 0.1); R(J.elbowL, -0.25);
      R(J.head, 0.1); R(J.torso, 0.05);
      break;
    case 'tap':
      R(J.shoulderR, -1.25, 0, 0.1); R(J.elbowR, -0.35);
      R(J.shoulderL, 0.05, 0, 0.12); R(J.elbowL, -0.25);
      R(J.head, -0.05);
      break;
    case 'dance':
      R(J.shoulderR, -0.4, 0, -1.9 - 0.3 * Math.sin(t)); R(J.elbowR, -1.0);
      R(J.shoulderL, -0.4, 0, 1.6 + 0.3 * Math.cos(t)); R(J.elbowL, -1.4);
      R(J.hipL, -0.3); R(J.kneeL, 0.45); R(J.hipR, 0.05, 0, -0.08); R(J.kneeR, 0.15);
      R(J.torso, 0.08, 0.2, 0.08); R(J.head, -0.1, -0.2, -0.15);
      J.pelvis.position.y = p.dims.hipY - 0.05;
      break;
    case 'dj':
      R(J.shoulderR, -2.85, 0, -0.25); R(J.elbowR, -0.35); // tangan ke atas
      R(J.shoulderL, -0.75, 0, 0.12); R(J.elbowL, -0.75); // tangan di deck
      R(J.torso, 0.05, -0.1, 0); R(J.head, -0.15, 0.1, 0);
      R(J.hipL, -0.08, 0, 0.08); R(J.kneeL, 0.15);
      break;
    case 'sit': {
      const seat = a.seat ?? 0.46;
      J.pelvis.position.y = seat + 0.075 * p.S;
      R(J.hipL, -1.5, 0, 0.06); R(J.hipR, -1.5, 0, -0.06);
      R(J.kneeL, 1.35); R(J.kneeR, 1.45);
      R(J.ankleL, 0.15); R(J.ankleR, 0.05);
      if (a.feetBar) { R(J.kneeL, 1.9); R(J.kneeR, 1.9); }
      R(J.shoulderL, -0.35, 0, 0.1); R(J.elbowL, -1.1);
      R(J.shoulderR, -0.35, 0, -0.1); R(J.elbowR, -1.1);
      R(J.torso, 0.08); R(J.head, a.look ?? 0.1, a.yaw ?? 0, 0);
      break;
    }
    case 'craft': {
      const seat = a.seat ?? 0.46;
      J.pelvis.position.y = seat + 0.075 * p.S;
      R(J.hipL, -1.5, 0, 0.08); R(J.hipR, -1.5, 0, -0.08);
      R(J.kneeL, 1.45); R(J.kneeR, 1.45);
      R(J.torso, 0.3);
      R(J.shoulderL, -0.85, 0, -0.18); R(J.elbowL, -1.2, 0, 0);
      R(J.shoulderR, -0.85, 0, 0.18); R(J.elbowR, -1.2, 0, 0);
      R(J.head, 0.45, a.yaw ?? 0, 0);
      break;
    }
    case 'lean':
      R(J.torso, 0.18); R(J.shoulderL, -0.9, 0, 0.1); R(J.elbowL, -1.3);
      R(J.shoulderR, -0.8, 0, -0.1); R(J.elbowR, -1.4);
      R(J.hipR, 0.15); R(J.kneeR, 0.2); R(J.head, 0.1);
      break;
    case 'hold': // memegang barang di depan dada (kemasan / charm)
      R(J.shoulderL, -0.55, 0, -0.05); R(J.elbowL, -1.55);
      R(J.shoulderR, -0.5, 0, 0.08); R(J.elbowR, -1.5);
      R(J.head, 0.35);
      break;
  }
  return p;
}

// ======================================================================
// Preset karakter
// ======================================================================
const r0 = rng(2026);
const pick = (arr, r = r0) => arr[Math.floor(r() * arr.length)];

export function visitor(seed, overrides = {}) {
  const r = rng(seed * 7919);
  const f = overrides.gender ? overrides.gender === 'f' : r() > 0.4;
  const tops = f
    ? [['tee', '#ffffff', 'short'], ['crop', '#f6c6d8', 'short'], ['cardigan', '#cfe0ff', 'long'], ['tee', '#1c1c1c', 'short'], ['hoodie', '#e8dccb', 'long'], ['shirt', '#bcd6f5', 'long'], ['tee', '#ffd8a8', 'short']]
    : [['tee', '#1c1c1c', 'short'], ['hoodie', '#5b6b7b', 'long'], ['shirt', '#f2f2f2', 'long'], ['tee', '#ffffff', 'short'], ['hoodie', '#2f4a3a', 'long'], ['polo', '#3a4f7a', 'short'], ['tee', '#8fb3d9', 'short']];
  const [tt, tc, sl] = pick(tops, r);
  const bottoms = f
    ? [['jeans', '#6d8fc4'], ['skirt', '#2a2a2a'], ['wideleg', '#d9cfbf'], ['jeans', '#2f3f5f'], ['skirt', '#c7b7e8'], ['shorts', '#c9d9ee']]
    : [['jeans', '#3a4a6a'], ['pants', '#1f1f1f'], ['wideleg', '#cfc4b0'], ['shorts', '#2f2f2f'], ['pants', '#5a5248']];
  const [bt, bc] = pick(bottoms, r);
  const p = {
    gender: f ? 'f' : 'm',
    height: f ? 1.54 + r() * 0.12 : 1.66 + r() * 0.12,
    skin: pick(SKIN, r),
    hair: { style: f ? pick(['long', 'longwave', 'bob', 'ponytail', 'bun', 'long'], r) : pick(['short', 'medium', 'short'], r), color: pick(HAIR, r) },
    top: { type: tt, color: tc, sleeve: sl },
    bottom: { type: bt, color: bc, length: 0.42 + r() * 0.1, flare: 1.05 },
    shoes: { color: pick(['#f4f4f4', '#1a1a1a', '#e8e0d0', '#f4f4f4'], r), sole: '#f7f7f7' },
    acc: {
      bag: pick(['tote', 'sling', null, 'backpack', null], r),
      bagColor: pick(['#efe6d2', '#1a1a1a', '#8a6a4a', '#cfd8e6'], r),
      glasses: r() > 0.8,
      cap: !f && r() > 0.75, capColor: '#1a1a1a',
    },
  };
  return createPerson(deepMerge(p, overrides));
}

function deepMerge(a, b) {
  const out = { ...a };
  for (const k of Object.keys(b || {})) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && !(b[k] instanceof THREE.Object3D) && !(b[k] instanceof THREE.Texture)) out[k] = deepMerge(a[k] || {}, b[k]);
    else out[k] = b[k];
  }
  return out;
}

export function crewChitato(seed, overrides = {}) {
  const r = rng(seed * 131);
  const f = overrides.gender ? overrides.gender === 'f' : r() > 0.5;
  return createPerson(deepMerge({
    gender: f ? 'f' : 'm', height: f ? 1.6 : 1.72, skin: pick(SKIN, r),
    hair: { style: f ? 'ponytail' : 'short', color: '#1b1512' },
    top: { type: 'polo', color: '#f2711c', color2: '#ffc61a', sleeve: 'short' },
    bottom: { type: 'pants', color: '#1c1c1c' },
    shoes: { color: '#1a1a1a', sole: '#ffffff' },
    acc: { cap: true, capColor: '#1c1c1c', capLogo: '#ffc61a', lanyard: true, lanyardColor: '#f2711c' },
  }, overrides));
}

export function crewJetz(seed, overrides = {}) {
  const r = rng(seed * 173);
  const f = overrides.gender ? overrides.gender === 'f' : r() > 0.35;
  return createPerson(deepMerge({
    gender: f ? 'f' : 'm', height: f ? 1.6 : 1.72, skin: pick(SKIN, r),
    hair: { style: f ? 'long' : 'medium', color: '#231915' },
    top: { type: 'vest', color: '#2c4f9e', color2: '#2c4f9e', sleeve: 'long', tie: '#ff7eb6' },
    bottom: f ? { type: 'skirt', color: '#8aa6d8', pattern: 'plaid', lineColor: '#ff9cc6', length: 0.46, socks: '#ffffff' } : { type: 'pants', color: '#3a4a6a' },
    shoes: { color: '#2a2020', sole: '#2a2020' },
    acc: { lanyard: true, lanyardColor: '#1460d8' },
  }, overrides));
}

// ======================================================================
// STANDEE CUTOUT (figur dipipihkan jadi papan foamboard cetak)
// ======================================================================
export function makeStandee(person, { name, theme = 'jetz', boardColor = '#f7f7f7' } = {}) {
  const baked = bake(person.root);
  const g = new THREE.Group();
  const flat = new THREE.Group();
  flat.add(baked);
  flat.scale.z = 0.045;
  g.add(flat);
  // papan putih di belakang figur (tepi potongan)
  const back = baked.clone();
  back.traverse(m => { if (m.isMesh) m.material = M.paint(boardColor, 0.8); });
  const backWrap = new THREE.Group();
  backWrap.add(back);
  const H = person.o.height;
  backWrap.scale.set(1.035, 1.012, 0.03);
  backWrap.position.set(0, -H * 0.006, -0.01);
  g.add(backWrap);
  // kaki penyangga
  const footM = M.paint('#efefef', 0.6);
  g.add(mesh(rbox(0.4, 0.012, 0.28, 0.004), footM, { y: 0.006, z: -0.04 }));
  g.add(mesh(rbox(0.05, 0.55, 0.012, 0.003), footM, { y: 0.3, z: -0.16, rx: -0.25 }));
  if (name) {
    g.add(mesh(new THREE.PlaneGeometry(0.26, 0.065), M.print(T.nameplate(name, theme), 0.5), { y: 0.016, z: 0.07, rx: -Math.PI / 2, cast: false }));
  }
  g.userData.standee = name;
  return g;
}

export function finalize(person) {
  return bake(person.root);
}
