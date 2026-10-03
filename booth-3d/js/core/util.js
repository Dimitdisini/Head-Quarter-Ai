import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Tinggi platform booth (lantai panggung) dalam meter
export const PH = 0.1;
// Tinggi maksimum booth sesuai brief
export const MAX_H = 2.5;

const _rbCache = new Map();
export function rbox(w, h, d, r = 0.01, seg = 3) {
  const key = [w, h, d, r, seg].map(v => +(+v).toFixed(4)).join('_');
  if (_rbCache.has(key)) return _rbCache.get(key);
  const rr = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const g = new RoundedBoxGeometry(w, h, d, seg, Math.max(rr, 0.0005));
  _rbCache.set(key, g);
  return g;
}

const _boxCache = new Map();
export function box(w, h, d) {
  const key = `${w}_${h}_${d}`;
  if (_boxCache.has(key)) return _boxCache.get(key);
  const g = new THREE.BoxGeometry(w, h, d);
  _boxCache.set(key, g);
  return g;
}

export function cyl(rt, rb, h, seg = 32, open = false) {
  return new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
}

/** Buat mesh + posisi/rotasi ringkas. o = {x,y,z,rx,ry,rz,sx,sy,sz,s,cast,receive,name} */
export function mesh(geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(o.x || 0, o.y || 0, o.z || 0);
  m.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
  if (o.s) m.scale.setScalar(o.s);
  if (o.sx || o.sy || o.sz) m.scale.set(o.sx || 1, o.sy || 1, o.sz || 1);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  if (o.name) m.name = o.name;
  return m;
}

export function grp(o = {}, ...children) {
  const g = new THREE.Group();
  g.position.set(o.x || 0, o.y || 0, o.z || 0);
  g.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
  if (o.s) g.scale.setScalar(o.s);
  if (o.name) g.name = o.name;
  children.forEach(c => c && g.add(c));
  return g;
}

export function add(parent, ...children) {
  children.forEach(c => c && parent.add(c));
  return parent;
}

/** Random deterministik supaya scene selalu sama tiap kali dibuka */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gabungkan semua mesh di dalam group menjadi 1 mesh per material.
 * Hasilnya visual sama, tapi draw call jauh lebih sedikit.
 * Mesh dengan userData.keep = true tidak digabung (mis. layar/emissive yang perlu diakses).
 */
export function bake(root, { cast = true, receive = true } = {}) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map();
  const keep = [];
  const tmp = new THREE.Matrix4();
  root.traverse(o => {
    if (!o.isMesh) return;
    if (o.userData.keep) { keep.push(o); return; }
    const mat = o.material;
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) {
      if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    }
    if (!g.attributes.uv) {
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    }
    if (!g.attributes.normal) g.computeVertexNormals();
    tmp.multiplyMatrices(inv, o.matrixWorld);
    g.applyMatrix4(tmp);
    if (tmp.determinant() < 0) {
      // balik urutan segitiga kalau scale negatif
      const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
      for (let i = 0; i < p.count; i += 3) {
        for (const a of [p, n, u]) {
          const sz = a.itemSize;
          for (let c = 0; c < sz; c++) {
            const t = a.array[(i + 1) * sz + c];
            a.array[(i + 1) * sz + c] = a.array[(i + 2) * sz + c];
            a.array[(i + 2) * sz + c] = t;
          }
        }
      }
    }
    if (!buckets.has(mat)) buckets.set(mat, []);
    buckets.get(mat).push(g);
  });
  const out = new THREE.Group();
  out.name = root.name;
  out.position.copy(root.position);
  out.quaternion.copy(root.quaternion);
  out.scale.copy(root.scale);
  out.userData = { ...root.userData };
  for (const [mat, list] of buckets) {
    const merged = mergeGeometries(list, false);
    list.forEach(g => g.dispose());
    if (!merged) continue;
    const m = new THREE.Mesh(merged, mat);
    m.castShadow = cast && !mat.userData?.noShadow;
    m.receiveShadow = receive;
    out.add(m);
  }
  for (const k of keep) {
    k.updateMatrixWorld(true);
    tmp.multiplyMatrices(inv, k.matrixWorld);
    const c = k.clone();
    c.matrixAutoUpdate = true;
    tmp.decompose(c.position, c.quaternion, c.scale);
    out.add(c);
  }
  return out;
}

/** Registry aset untuk panel breakdown & label */
export const Assets = [];
/**
 * daftar aset: code, name, zone ('A' | 'B' | 'S'), spec (array teks), object (Object3D),
 * focus: {pos:[x,y,z], target:[x,y,z]}
 */
export function registerAsset(info) {
  Assets.push(info);
  if (info.object) {
    info.object.userData.assetCode = info.code;
  }
  return info.object;
}

export function deg(d) { return d * Math.PI / 180; }
