import * as THREE from 'three';
import * as T from './tex.js';

// Library material PBR. Semua di-cache supaya bisa di-bake (merge) per material.
const C = new Map();
function get(key, make) {
  if (!C.has(key)) C.set(key, make());
  return C.get(key);
}

export const M = {
  paint: (color, rough = 0.55, metal = 0) => get(`paint_${color}_${rough}_${metal}`, () =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })),

  // cat duco / HPL semi-gloss
  gloss: (color, rough = 0.28) => get(`gloss_${color}_${rough}`, () =>
    new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.25 })),

  matte: (color) => M.paint(color, 0.85),

  metal: (color = '#c8c8c8', rough = 0.3) => get(`metal_${color}_${rough}`, () =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 1 })),

  chrome: () => M.metal('#e8e8ea', 0.12),
  steelBlack: () => M.paint('#1b1b1d', 0.45, 0.6),
  aluminium: () => M.metal('#b9bcc0', 0.35),

  plastic: (color, rough = 0.4) => get(`plastic_${color}_${rough}`, () =>
    new THREE.MeshStandardMaterial({ color, roughness: rough })),

  rubber: (color = '#1a1a1a') => M.paint(color, 0.9),

  fabric: (color) => get(`fabric_${color}`, () =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.92, sheen: 0.6, sheenRoughness: 0.6, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.3) })),

  velvet: (color) => get(`velvet_${color}`, () =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.9, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35) })),

  skin: (color) => get(`skin_${color}`, () =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, sheen: 0.3, sheenColor: new THREE.Color('#ffd9c7') })),

  hair: (color) => get(`hair_${color}`, () =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.45, sheen: 1, sheenRoughness: 0.3, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.25) })),

  emissive: (color, intensity = 2, base = '#000000') => get(`emis_${color}_${intensity}_${base}`, () => {
    const m = new THREE.MeshStandardMaterial({ color: base, emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
    m.userData.noShadow = true;
    return m;
  }),

  // tabung LED neon flex (silikon susu, menyala)
  neon: (color, intensity = 3.2) => get(`neon_${color}_${intensity}`, () => {
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: color, emissiveIntensity: intensity, roughness: 0.3 });
    m.userData.noShadow = true;
    return m;
  }),

  acrylic: (tint = '#ffffff', rough = 0.04) => get(`acr_${tint}_${rough}`, () =>
    new THREE.MeshPhysicalMaterial({ color: tint, roughness: rough, metalness: 0, transmission: 1, thickness: 0.006, ior: 1.49, transparent: true, opacity: 1 })),

  glass: () => get('glass', () =>
    new THREE.MeshPhysicalMaterial({ color: '#dfe9ee', roughness: 0.03, transmission: 1, thickness: 0.01, ior: 1.5, transparent: true })),

  mirror: () => M.metal('#f2f2f2', 0.02),

  screen: (tex, intensity = 1.25) => {
    const key = `screen_${tex.uuid}_${intensity}`;
    return get(key, () => {
      const m = new THREE.MeshStandardMaterial({ color: '#000000', emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: intensity, roughness: 0.18, map: null });
      m.userData.noShadow = true;
      return m;
    });
  },

  // print/graphic (kertas, stiker, grafis cetak)
  print: (tex, rough = 0.6, o = {}) => {
    const key = `print_${tex.uuid}_${rough}_${o.transparent ? 1 : 0}_${o.side || 0}`;
    return get(key, () => new THREE.MeshStandardMaterial({
      map: tex, roughness: rough, transparent: !!o.transparent, alphaTest: o.transparent ? 0.02 : 0,
      side: o.side || THREE.FrontSide,
    }));
  },

  // lightbox: grafis menyala dari belakang
  lightbox: (tex, intensity = 1.6) => {
    const key = `lb_${tex.uuid}_${intensity}`;
    return get(key, () => {
      const m = new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: intensity, roughness: 0.35 });
      m.userData.noShadow = true;
      return m;
    });
  },

  // kemasan snack foil metalik
  pack: (tex) => {
    const key = `pack_${tex.uuid}`;
    return get(key, () => new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.32, metalness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.2 }));
  },

  wood: (kind = 'birch', repeat = [1, 1], rough = 0.6) => get(`wood_${kind}_${repeat}_${rough}`, () => {
    const t = T.woodTex(kind).clone();
    t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    return new THREE.MeshStandardMaterial({ map: t, roughness: rough });
  }),

  shadowCatcher: () => get('shadowc', () => new THREE.ShadowMaterial({ opacity: 0.25 })),
};

// Palet warna proyek (diambil dari golden master + brief)
export const P = {
  // Chitato
  orange: '#f2711c',
  orangeDeep: '#e2560c',
  chitatoYellow: '#ffc61a',
  wallYellow: '#f6c21c',
  amber: '#f2a516',
  liteGreen: '#2f9e44',
  liteGreenDeep: '#1f7a35',
  forest: '#1e5d33',
  white: '#f6f5f2',
  offwhite: '#eceae5',
  // JetZ
  babyBlue: '#a9c8f2',
  periwinkle: '#b9c3f0',
  lavender: '#cdbff0',
  pastelPink: '#f6b6cc',
  pink: '#ff7eb6',
  hotPink: '#ff4f98',
  butter: '#f8dc8a',
  cream: '#fbefd6',
  jetzBlue: '#1460d8',
  skyBlue: '#7fd3ff',
};
