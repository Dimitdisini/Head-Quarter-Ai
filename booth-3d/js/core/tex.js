import * as THREE from 'three';
import { rng } from './util.js';

// ---------------------------------------------------------------
// Semua grafis (logo, kemasan, poster, layar) digambar via Canvas.
// Catatan: foto member & KV resmi masih ilustrasi pengganti.
// Saat final, ganti dengan file KV resmi dari Google Drive brief.
// ---------------------------------------------------------------

const ALL = [];
let ANISO = 8;
export function setAnisotropy(n) { ANISO = n; ALL.forEach(t => { t.anisotropy = n; t.needsUpdate = true; }); }

export function canvasTex(w, h, draw, o = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  if (o.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = ANISO;
  if (o.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(o.repeat[0], o.repeat[1]);
  }
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  ALL.push(t);
  return t;
}

const cache = new Map();
function cached(key, fn) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
}

// ---------- font ----------
const F = {
  black: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
  bold: '"Helvetica Neue", Arial, sans-serif',
  round: '"Arial Rounded MT Bold", "Avenir Next", "Helvetica Neue", sans-serif',
  hand: '"Chalkboard SE", "Marker Felt", "Comic Sans MS", cursive',
  marker: '"Marker Felt", "Chalkboard SE", cursive',
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx, text, maxW, size, font, weight = '900') {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${font}`;
    if (ctx.measureText(text).width <= maxW) break;
    s -= 2;
  } while (s > 8);
  return s;
}

function noise(ctx, w, h, amount = 18, seed = 3, alpha = 0.08) {
  const r = rng(seed);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

// =================================================================
// LOGO
// =================================================================
export function drawChitatoLogo(ctx, cx, cy, h, o = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.transform(1, 0, -0.18, 1, 0, 0);
  const size = h;
  ctx.font = `900 ${size}px ${F.black}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  // bayangan merah tua
  ctx.lineWidth = size * 0.28;
  ctx.strokeStyle = '#7a1408';
  ctx.strokeText('Chitato', size * 0.04, size * 0.06);
  ctx.lineWidth = size * 0.18;
  ctx.strokeStyle = '#d4231a';
  ctx.strokeText('Chitato', 0, 0);
  const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
  g.addColorStop(0, '#fff6a8');
  g.addColorStop(0.45, '#ffd51c');
  g.addColorStop(1, '#f7a600');
  ctx.fillStyle = g;
  ctx.fillText('Chitato', 0, 0);
  ctx.restore();
  if (o.lite) {
    ctx.save();
    ctx.font = `900 ${h * 0.52}px ${F.black}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const tx = cx + h * 1.95;
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = h * 0.12;
    ctx.strokeStyle = '#0f5f2c';
    ctx.strokeText('LITE', tx, cy + h * 0.08);
    ctx.fillText('LITE', tx, cy + h * 0.08);
    ctx.restore();
  }
}

export function drawJetzLogo(ctx, cx, cy, h, o = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.transform(1, 0, -0.22, 1, 0, 0);
  ctx.font = `900 ${h}px ${F.black}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = h * 0.3;
  ctx.strokeStyle = o.shadow || '#ff5fa2';
  ctx.strokeText('JetZ', h * 0.06, h * 0.07);
  ctx.lineWidth = h * 0.2;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeText('JetZ', 0, 0);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#3fa9ff');
  g.addColorStop(1, '#0b4fd6');
  ctx.fillStyle = g;
  ctx.fillText('JetZ', 0, 0);
  ctx.restore();
}

function drawStar(ctx, x, y, r, color, points = 5, inner = 0.45) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 ? r * inner : r;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawHeart(ctx, x, y, s, color, stroke) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 30, s / 30);
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-30, -10, -12, -32, 0, -14);
  ctx.bezierCurveTo(12, -32, 30, -10, 0, 10);
  ctx.closePath();
  if (color) { ctx.fillStyle = color; ctx.fill(); }
  if (stroke) { ctx.lineWidth = 3; ctx.strokeStyle = stroke; ctx.stroke(); }
  ctx.restore();
}

function drawChips(ctx, cx, cy, s, color = '#f2c14e', ridges = true, seed = 5) {
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const x = cx + (r() - 0.5) * s * 1.6;
    const y = cy + (r() - 0.5) * s * 0.7;
    const w = s * (0.45 + r() * 0.25), hh = s * (0.3 + r() * 0.15);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((r() - 0.5) * 1.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, w, hh, 0, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(-w * 0.3, -hh * 0.3, 1, 0, 0, w);
    g.addColorStop(0, '#fff2b8');
    g.addColorStop(0.6, color);
    g.addColorStop(1, '#c98a1c');
    ctx.fillStyle = g;
    ctx.fill();
    if (ridges) {
      ctx.strokeStyle = 'rgba(150,90,10,0.35)';
      ctx.lineWidth = 2;
      for (let k = -3; k <= 3; k++) {
        ctx.beginPath();
        ctx.moveTo(-w * 0.9, k * hh * 0.25);
        ctx.quadraticCurveTo(0, k * hh * 0.25 - hh * 0.15, w * 0.9, k * hh * 0.25);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

// =================================================================
// KEMASAN SNACK
// =================================================================
export const CHITATO_VARIANTS = {
  bbq: { bg1: '#ff8a00', bg2: '#d6370f', label: 'Beef BBQ', sub: 'Rasa Sapi Panggang', lite: false },
  lite: { bg1: '#5cc13a', bg2: '#137a2c', label: 'Seaweed', sub: 'Rumput Laut', lite: true },
  orig: { bg1: '#ffb800', bg2: '#e46a00', label: 'Sapi Panggang', sub: 'Original', lite: false },
};

export function chitatoPack(variant = 'bbq') {
  return cached('cpack_' + variant, () => canvasTex(512, 720, (ctx, w, h) => {
    const v = CHITATO_VARIANTS[variant];
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, v.bg1); g.addColorStop(1, v.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // gelombang khas "Make The Wave"
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 200 + i * 40);
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, 200 + i * 40 + Math.sin(x / 40 + i) * 14);
      ctx.lineTo(w, 200 + i * 40 + 10); ctx.lineTo(0, 210 + i * 40); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // seal atas & bawah
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let x = 0; x < w; x += 10) { ctx.fillRect(x, 0, 5, 26); ctx.fillRect(x, h - 26, 5, 26); }
    drawChitatoLogo(ctx, v.lite ? 205 : 256, 140, 92, { lite: v.lite });
    drawChips(ctx, 256, 430, 120, '#f6c453', true, variant.length * 7);
    // pita varian
    ctx.fillStyle = v.lite ? '#0c5a22' : '#7d1206';
    rr(ctx, 70, 560, 372, 74, 37); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 46px ${F.bold}`;
    ctx.fillText(v.label, 256, 597);
    ctx.font = `700 22px ${F.bold}`;
    ctx.fillText(v.sub + ' · 68g', 256, 662);
    // label TREASURE edition
    ctx.fillStyle = '#7fd3ff';
    rr(ctx, 330, 238, 150, 44, 10); ctx.fill();
    ctx.fillStyle = '#062a44';
    ctx.font = `900 22px ${F.bold}`;
    ctx.fillText('TREASURE', 405, 261);
    noise(ctx, w, h, 10, 7);
  }));
}

export const JETZ_VARIANTS = {
  sweet: { bg1: '#5fc8ff', bg2: '#1460d8', label: 'SWEET STICK', sub: 'Light · Fun · Easy', accent: '#ffe066' },
  tortilla: { bg1: '#ff9a3d', bg2: '#d8261c', label: 'TORTILLA', sub: 'Bold · Savory · Sharing', accent: '#9be15d' },
  croissant: { bg1: '#8f7cff', bg2: '#4128b8', label: 'CROISSANT', sub: 'Indulgent & Satisfying', accent: '#ffcf8a' },
  choco: { bg1: '#a0673d', bg2: '#4b2412', label: 'CHOCO', sub: 'Sweet Stick Choco', accent: '#ffb6d5' },
};

export function jetzPack(variant = 'sweet') {
  return cached('jpack_' + variant, () => canvasTex(512, 720, (ctx, w, h) => {
    const v = JETZ_VARIANTS[variant];
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, v.bg1); g.addColorStop(1, v.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // sinar retro
    ctx.save(); ctx.translate(256, 420); ctx.globalAlpha = 0.12; ctx.fillStyle = '#fff';
    for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.fillRect(0, -10, 420, 20); }
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let x = 0; x < w; x += 10) { ctx.fillRect(x, 0, 5, 26); ctx.fillRect(x, h - 26, 5, 26); }
    drawJetzLogo(ctx, 256, 140, 120);
    // ilustrasi produk
    ctx.save();
    if (variant === 'sweet' || variant === 'choco') {
      for (let i = 0; i < 9; i++) {
        ctx.save(); ctx.translate(130 + i * 30, 430); ctx.rotate(-0.5 + i * 0.12);
        const sg = ctx.createLinearGradient(-12, 0, 12, 0);
        sg.addColorStop(0, variant === 'choco' ? '#5a2e14' : '#e5a646');
        sg.addColorStop(0.5, variant === 'choco' ? '#8a4a24' : '#ffd27a');
        sg.addColorStop(1, variant === 'choco' ? '#4a220e' : '#c8822a');
        ctx.fillStyle = sg; rr(ctx, -12, -110, 24, 220, 12); ctx.fill();
        ctx.restore();
      }
    } else if (variant === 'tortilla') {
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.translate(140 + (i % 4) * 75, 390 + Math.floor(i / 4) * 80); ctx.rotate(i * 0.7);
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(50, 35); ctx.lineTo(-50, 35); ctx.closePath();
        ctx.fillStyle = '#f2b544'; ctx.fill();
        ctx.fillStyle = '#d9771f'; for (let k = 0; k < 6; k++) ctx.fillRect(-25 + k * 9, -5 + (k % 3) * 9, 4, 4);
        ctx.restore();
      }
    } else {
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.translate(150 + i * 105, 430 + (i % 2) * 30);
        for (let k = -3; k <= 3; k++) {
          ctx.beginPath(); ctx.ellipse(k * 16, Math.abs(k) * 6, 18, 34 - Math.abs(k) * 4, k * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = k % 2 ? '#e09a43' : '#f4bd6a'; ctx.fill();
        }
        ctx.restore();
      }
    }
    ctx.restore();
    ctx.fillStyle = v.accent;
    ctx.save(); ctx.translate(256, 590); ctx.rotate(-0.04);
    rr(ctx, -190, -40, 380, 80, 18); ctx.fill();
    ctx.fillStyle = '#16213e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${fitText(ctx, v.label, 350, 52, F.black)}px ${F.black}`;
    ctx.fillText(v.label, 0, 2);
    ctx.restore();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = `700 22px ${F.bold}`; ctx.fillText(v.sub, 256, 668);
    // badge H2H
    ctx.fillStyle = '#ff7eb6'; ctx.beginPath(); ctx.arc(430, 255, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `900 22px ${F.bold}`; ctx.fillText('H2H', 430, 248);
    ctx.font = `700 13px ${F.bold}`; ctx.fillText('EDITION', 430, 270);
    noise(ctx, w, h, 10, 9);
  }));
}

// =================================================================
// MATERIAL PERMUKAAN PROSEDURAL
// =================================================================
export function lobbyMarble() {
  return cached('marble', () => canvasTex(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#d9d6d0'; ctx.fillRect(0, 0, w, h);
    const r = rng(11);
    // lantai granit 120x120 cm: 2x2 ubin per tekstur
    for (let i = 0; i < 9000; i++) {
      const v = 150 + r() * 90;
      ctx.fillStyle = `rgba(${v},${v - 2},${v - 6},${0.25 + r() * 0.4})`;
      const s = r() * 3 + 0.6;
      ctx.fillRect(r() * w, r() * h, s, s);
    }
    ctx.strokeStyle = 'rgba(120,115,108,0.18)';
    for (let i = 0; i < 14; i++) {
      ctx.lineWidth = 0.6 + r() * 1.6;
      ctx.beginPath();
      let x = r() * w, y = r() * h; ctx.moveTo(x, y);
      for (let k = 0; k < 30; k++) { x += (r() - 0.3) * 40; y += (r() - 0.5) * 30; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(90,88,84,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.moveTo(1, 0); ctx.lineTo(1, h); ctx.moveTo(0, 1); ctx.lineTo(w, 1); ctx.stroke();
  }, { repeat: [1, 1] }));
}

export function carpetBlack() {
  return cached('carpet', () => canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#141414'; ctx.fillRect(0, 0, w, h);
    const r = rng(21);
    for (let i = 0; i < 26000; i++) {
      const v = 10 + r() * 34;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(r() * w, r() * h, 1.2, 1.2);
    }
  }, { repeat: [16, 3] }));
}

export function boothFloorChitato() {
  return cached('cfloor', () => canvasTex(1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#d8d4cc'; ctx.fillRect(0, 0, w, h);
    const r = rng(31);
    const chips = ['#f1a33a', '#c9c3b8', '#8e8a83', '#5aa64a', '#f5f1e8', '#b5aea3'];
    for (let i = 0; i < 5200; i++) {
      ctx.fillStyle = chips[Math.floor(r() * chips.length)];
      ctx.globalAlpha = 0.35 + r() * 0.5;
      ctx.beginPath();
      const x = r() * w, y = r() * h, s = 1 + r() * 4.5;
      ctx.moveTo(x, y); ctx.lineTo(x + s, y + s * 0.3); ctx.lineTo(x + s * 0.6, y + s); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, { repeat: [6, 2] }));
}

export function classroomTiles() {
  return cached('ctile', () => canvasTex(512, 512, (ctx, w, h) => {
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#e9eef7' : '#cfdcf2';
      ctx.fillRect(i * s, j * s, s, s);
    }
    ctx.strokeStyle = 'rgba(120,130,150,0.35)'; ctx.lineWidth = 2;
    for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h); ctx.moveTo(0, i * s); ctx.lineTo(w, i * s); ctx.stroke(); }
    noise(ctx, w, h, 8, 4);
  }, { repeat: [12.5, 3.33] }));
}

export function woodTex(kind = 'birch') {
  return cached('wood_' + kind, () => canvasTex(512, 512, (ctx, w, h) => {
    const base = kind === 'birch' ? [226, 200, 160] : kind === 'oak' ? [196, 150, 98] : [150, 100, 60];
    ctx.fillStyle = `rgb(${base})`; ctx.fillRect(0, 0, w, h);
    const r = rng(kind.length * 13);
    for (let y = 0; y < h; y += 1) {
      const n = Math.sin(y * 0.09 + Math.sin(y * 0.013) * 6) * 10 + (r() - 0.5) * 6;
      ctx.fillStyle = `rgba(${base[0] - 40},${base[1] - 40},${base[2] - 40},${Math.max(0, n) / 60})`;
      ctx.fillRect(0, y, w, 1);
    }
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(${base[0] - 70},${base[1] - 70},${base[2] - 60},0.25)`;
      ctx.beginPath(); ctx.ellipse(r() * w, r() * h, 6 + r() * 10, 2 + r() * 3, 0, 0, Math.PI * 2); ctx.fill();
    }
  }, { repeat: [1, 1] }));
}

export function pegboardTex(color = '#f6c9d8') {
  return cached('peg_' + color, () => canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(60,30,40,0.55)';
    const s = w / 10;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      ctx.beginPath(); ctx.arc(i * s + s / 2, j * s + s / 2, 5, 0, Math.PI * 2); ctx.fill();
    }
  }, { repeat: [2, 4] }));
}

// =================================================================
// GRAFIS CHITATO
// =================================================================
export function headerChitato() {
  return cached('hdr_c', () => canvasTex(2048, 256, (ctx, w, h) => {
    ctx.fillStyle = '#ffd21f'; ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,160,0,0.15)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3b1b00'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${fitText(ctx, 'CHITATO x CHITATO LITE x TREASURE', 1880, 132, F.black)}px ${F.black}`;
    ctx.fillText('CHITATO x CHITATO LITE x TREASURE', w / 2, h / 2 + 6);
  }));
}

export function wallLogoChitato(lite) {
  return cached('wlc_' + lite, () => canvasTex(1024, 384, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    drawChitatoLogo(ctx, lite ? 400 : 512, 140, 150, { lite });
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `800 96px ${F.bold}`;
    ctx.lineWidth = 10; ctx.strokeStyle = lite ? '#0c5a22' : '#7d3a00';
    const t = lite ? 'Seaweed' : 'Beef BBQ';
    ctx.strokeText(t, w / 2, 300); ctx.fillText(t, w / 2, 300);
  }));
}

const TEAM = {
  lite: { bg1: '#7ad957', bg2: '#178a35', tag: 'TEAM LITE', words: 'Calm · Steady · Grounded' },
  wavy: { bg1: '#ffb52e', bg2: '#e2560c', tag: 'TEAM WAVY', words: 'Bold · Electric · Unfiltered' },
};

/** Poster member (ilustrasi pengganti foto KV resmi) */
export function memberPoster(name, team, seed = 1) {
  return cached('mp_' + name, () => canvasTex(512, 1536, (ctx, w, h) => {
    const t = TEAM[team];
    const r = rng(seed * 97);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, t.bg1); g.addColorStop(1, t.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // gelombang
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 10;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      for (let y = 0; y <= h; y += 10) ctx.lineTo(60 + i * 80 + Math.sin(y / 70 + i) * 26, y);
      ctx.stroke();
    }
    drawChitatoLogo(ctx, team === 'lite' ? 200 : 256, 120, 74, { lite: team === 'lite' });
    // figur ilustrasi (setengah badan)
    const skin = ['#f2cfb3', '#eac3a2', '#f5d6bd'][Math.floor(r() * 3)];
    const hair = ['#1b1512', '#2a1d16', '#5a3a26', '#d8c7a6', '#3a2b4a'][Math.floor(r() * 5)];
    const jacket = team === 'lite' ? ['#e9f7e1', '#1e5d33', '#f4f1e8'][Math.floor(r() * 3)] : ['#1a1a1a', '#ffd21f', '#3b2a1a'][Math.floor(r() * 3)];
    const cx = 256, top = 330;
    // bahu & badan
    ctx.fillStyle = jacket;
    ctx.beginPath();
    ctx.moveTo(cx - 200, 1250); ctx.quadraticCurveTo(cx - 210, top + 330, cx - 120, top + 290);
    ctx.lineTo(cx + 120, top + 290); ctx.quadraticCurveTo(cx + 210, top + 330, cx + 200, 1250); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(cx - 4, top + 300, 8, 900);
    // leher
    ctx.fillStyle = skin; ctx.fillRect(cx - 40, top + 200, 80, 110);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(cx - 60, top + 290); ctx.lineTo(cx, top + 380); ctx.lineTo(cx + 60, top + 290); ctx.fill();
    // kepala
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(cx, top + 120, 96, 122, 0, 0, Math.PI * 2); ctx.fill();
    // rambut
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.ellipse(cx, top + 60, 108, 92, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 108, top + 60);
    for (let i = 0; i <= 8; i++) ctx.lineTo(cx - 108 + i * 27, top + 70 + (i % 2) * 36 + r() * 10);
    ctx.lineTo(cx + 108, top + 60); ctx.fill();
    // wajah sederhana
    ctx.fillStyle = '#2a1d16';
    ctx.beginPath(); ctx.ellipse(cx - 36, top + 135, 9, 6, 0, 0, Math.PI * 2); ctx.ellipse(cx + 36, top + 135, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b5675a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, top + 175, 22, 0.2, Math.PI - 0.2); ctx.stroke();
    // tangan pegang kemasan
    ctx.save(); ctx.translate(cx + 40, 980); ctx.rotate(0.12);
    ctx.fillStyle = team === 'lite' ? '#1d8a35' : '#e0480f';
    rr(ctx, -95, -150, 190, 260, 16); ctx.fill();
    drawChitatoLogo(ctx, 0, -95, 34, {});
    drawChips(ctx, 0, 0, 40, '#f6c453', false, seed);
    ctx.restore();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(cx - 40, 1060, 40, 30, 0.4, 0, Math.PI * 2); ctx.fill();
    // nama
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 1300, w, 236);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${fitText(ctx, name.toUpperCase(), 460, 64, F.black)}px ${F.black}`;
    ctx.fillText(name.toUpperCase(), cx, 1370);
    ctx.font = `800 34px ${F.bold}`; ctx.fillText(t.tag, cx, 1435);
    ctx.font = `600 24px ${F.bold}`; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(t.words, cx, 1485);
    noise(ctx, w, h, 8, seed);
  }));
}

export function kioskScreen() {
  return cached('kiosk', () => canvasTex(540, 960, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b2a12'); g.addColorStop(0.5, '#1f6b2c'); g.addColorStop(1, '#f28b00');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    ctx.font = `900 46px ${F.black}`; ctx.fillText('TREASURE', w / 2, 90);
    ctx.font = `700 22px ${F.bold}`; ctx.fillText('Make The Wave You Lite', w / 2, 128);
    drawChitatoLogo(ctx, w / 2 - 50, 200, 52, { lite: true });
    // bar ritme
    for (let i = 0; i < 9; i++) {
      const bh = 60 + Math.abs(Math.sin(i * 1.3)) * 190;
      ctx.fillStyle = i % 2 ? '#ffd21f' : '#7ad957';
      rr(ctx, 50 + i * 50, 520 - bh, 36, bh, 10); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; rr(ctx, 40, 560, w - 80, 220, 20); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `900 40px ${F.black}`; ctx.fillText('WAVE CHALLENGE', w / 2, 620);
    ctx.font = `600 22px ${F.bold}`;
    ['1. Pilih Team WAVY / LITE', '2. Ikuti gerakan TREASURE', '3. Skor tertinggi dapat merch'].forEach((s, i) => ctx.fillText(s, w / 2, 665 + i * 34));
    ctx.fillStyle = '#ffd21f'; rr(ctx, 110, 820, w - 220, 84, 42); ctx.fill();
    ctx.fillStyle = '#3b1b00'; ctx.font = `900 36px ${F.black}`; ctx.fillText('TAP UNTUK MULAI', w / 2, 875);
  }));
}

export function rollupChitato() {
  return cached('ru_c', () => canvasTex(512, 1280, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#ff9d00'); g.addColorStop(0.55, '#ffcc1a'); g.addColorStop(1, '#3fa83a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    drawChitatoLogo(ctx, 256, 130, 96);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    ctx.font = `900 58px ${F.black}`;
    ['MAKE', 'THE WAVE', 'YOU LITE'].forEach((t, i) => { ctx.lineWidth = 10; ctx.strokeStyle = '#7d1206'; ctx.strokeText(t, 256, 290 + i * 70); ctx.fillText(t, 256, 290 + i * 70); });
    for (let i = 0; i < 5; i++) {
      const x = 70 + i * 93;
      ctx.fillStyle = i % 2 ? '#1a1a1a' : '#ffd21f';
      rr(ctx, x - 40, 560, 80, 400, 40); ctx.fill();
      ctx.fillStyle = '#f2cfb3'; ctx.beginPath(); ctx.arc(x, 530, 36, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1b1512'; ctx.beginPath(); ctx.arc(x, 515, 38, Math.PI, 0); ctx.fill();
    }
    ctx.fillStyle = '#7d1206'; rr(ctx, 40, 1010, 432, 140, 24); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `900 40px ${F.black}`; ctx.fillText('PAKET TREASURE', 256, 1068);
    ctx.font = `900 54px ${F.black}`; ctx.fillStyle = '#ffd21f'; ctx.fillText('Rp 35.000', 256, 1128);
    ctx.fillStyle = '#fff'; ctx.font = `700 22px ${F.bold}`; ctx.fillText('Selama persediaan masih ada', 256, 1200);
  }));
}

export function flexyChitato() {
  return cached('fx_c', () => canvasTex(512, 1024, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#ffb000'); g.addColorStop(1, '#2e9b3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    drawChitatoLogo(ctx, 256, 100, 80);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `900 40px ${F.black}`;
    ctx.fillText('x TREASURE', 256, 190);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(ctx, 50 + i * 145, 260, 125, 520, 20); ctx.fill();
      ctx.fillStyle = '#f2cfb3'; ctx.beginPath(); ctx.arc(112 + i * 145, 340, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1b1512'; ctx.beginPath(); ctx.arc(112 + i * 145, 322, 45, Math.PI, 0); ctx.fill();
      ctx.fillStyle = i === 1 ? '#ffd21f' : '#1a1a1a'; rr(ctx, 62 + i * 145, 395, 100, 370, 30); ctx.fill();
    }
    ctx.fillStyle = '#fff'; ctx.font = `800 34px ${F.bold}`; ctx.fillText('Make The Wave You Lite', 256, 880);
  }));
}

export function waveDecal() {
  return cached('wdecal', () => canvasTex(2048, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = ['#ff8a00', '#ffd21f', '#3fae3a'][i];
      ctx.lineWidth = 26;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) ctx.lineTo(x, 70 + i * 52 + Math.sin(x / 110) * 30);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(60,30,0,0.75)'; ctx.font = `900 54px ${F.black}`; ctx.textAlign = 'left';
    ctx.fillText('MAKE THE WAVE YOU LITE', 40, 245);
  }));
}

export function floorTarget() {
  return cached('ftarget', () => canvasTex(512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 4; i > 0; i--) {
      ctx.fillStyle = i % 2 ? 'rgba(255,210,31,0.95)' : 'rgba(30,110,45,0.95)';
      ctx.beginPath(); ctx.arc(256, 256, i * 60, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#3b1b00'; ctx.font = `900 40px ${F.black}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('BERDIRI', 256, 236); ctx.fillText('DI SINI', 256, 282);
  }));
}

export function smallSign(lines, o = {}) {
  const key = 'ss_' + lines.join('|') + JSON.stringify(o);
  return cached(key, () => canvasTex(o.w || 512, o.h || 360, (ctx, w, h) => {
    ctx.fillStyle = o.bg || '#ffffff'; ctx.fillRect(0, 0, w, h);
    if (o.border) { ctx.strokeStyle = o.border; ctx.lineWidth = 16; ctx.strokeRect(8, 8, w - 16, h - 16); }
    ctx.fillStyle = o.color || '#222'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lh = h / (lines.length + 0.6);
    lines.forEach((t, i) => {
      const big = i === (o.bigIndex ?? -1);
      ctx.font = `${big ? 900 : 700} ${fitText(ctx, t, w - 50, big ? lh * 0.95 : lh * 0.6, big ? F.black : F.bold, big ? '900' : '700')}px ${big ? F.black : F.bold}`;
      ctx.fillText(t, w / 2, lh * (i + 0.8));
    });
  }));
}

export function photocardTex(name, team, seed) {
  return cached('pc_' + name, () => canvasTex(128, 192, (ctx, w, h) => {
    const t = TEAM[team] || TEAM.wavy;
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, t.bg1); g.addColorStop(1, t.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f2cfb3'; ctx.beginPath(); ctx.arc(64, 70, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b1512'; ctx.beginPath(); ctx.arc(64, 58, 32, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fff'; rr(ctx, 24, 104, 80, 70, 16); ctx.fill();
    ctx.fillStyle = '#222'; ctx.font = `800 13px ${F.bold}`; ctx.textAlign = 'center'; ctx.fillText(name, 64, 186);
  }));
}

// =================================================================
// GRAFIS JETZ
// =================================================================
export function headerJetz() {
  return cached('hdr_j', () => canvasTex(2048, 360, (ctx, w, h) => {
    ctx.fillStyle = '#fff8f2'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e08a5a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${fitText(ctx, 'JETZ × HEARTS2HEARTS', 1850, 160, F.round, '900')}px ${F.round}`;
    ctx.fillText('JETZ × HEARTS2HEARTS', w / 2, 150);
    ctx.fillStyle = '#4a5a8a'; ctx.font = `800 64px ${F.bold}`;
    ctx.fillText('JETZREK-IN AJA!', w / 2, 290);
  }));
}

export function doodleWall(base = '#c9d6f6', seed = 4) {
  return cached('dw_' + base + seed, () => canvasTex(1024, 512, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    const r = rng(seed);
    for (let i = 0; i < 26; i++) {
      const x = r() * w, y = r() * h;
      const k = Math.floor(r() * 4);
      ctx.globalAlpha = 0.35;
      if (k === 0) drawStar(ctx, x, y, 12 + r() * 14, '#ffffff');
      else if (k === 1) drawHeart(ctx, x, y, 16 + r() * 14, null, '#ff8fbf');
      else if (k === 2) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); for (let s = 0; s < 6; s++) ctx.lineTo(x + s * 10, y + (s % 2) * 10); ctx.stroke(); }
      else { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 4 + r() * 6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }, { repeat: [1, 1] }));
}

export function lockerDoor(color, seed = 1) {
  return cached('ld_' + color + seed, () => canvasTex(256, 1024, (ctx, w, h) => {
    ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
    const sh = ctx.createLinearGradient(0, 0, w, 0);
    sh.addColorStop(0, 'rgba(0,0,0,0.10)'); sh.addColorStop(0.15, 'rgba(255,255,255,0.10)'); sh.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h);
    // ventilasi
    ctx.fillStyle = 'rgba(40,40,60,0.45)';
    for (let i = 0; i < 6; i++) { rr(ctx, 60, 60 + i * 26, 136, 9, 4); ctx.fill(); }
    for (let i = 0; i < 6; i++) { rr(ctx, 60, 820 + i * 26, 136, 9, 4); ctx.fill(); }
    // garis panel
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 4; ctx.strokeRect(14, 14, w - 28, h - 28);
    // pelat nomor
    ctx.fillStyle = '#f4f4f4'; rr(ctx, 88, 250, 80, 40, 6); ctx.fill();
    ctx.fillStyle = '#333'; ctx.font = `800 26px ${F.bold}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(100 + seed), 128, 271);
    // stiker gesrek acak
    const r = rng(seed * 31);
    const n = Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const x = 40 + r() * 170, y = 380 + r() * 380;
      const k = Math.floor(r() * 4);
      ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 0.6);
      if (k === 0) { drawStar(ctx, 0, 0, 30, '#ffe066'); }
      else if (k === 1) { drawHeart(ctx, 0, 0, 40, '#ff6fa8'); }
      else if (k === 2) { ctx.fillStyle = '#ffffff'; rr(ctx, -50, -22, 100, 44, 22); ctx.fill(); ctx.fillStyle = '#1460d8'; ctx.font = `900 24px ${F.black}`; ctx.fillText('JetZ', 0, 2); }
      else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#222'; ctx.font = `900 16px ${F.bold}`; ctx.fillText('S2U', 0, 1); }
      ctx.restore();
    }
  }));
}

export function tvJetz() {
  return cached('tvj', () => canvasTex(1280, 720, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#7fd3ff'); g.addColorStop(1, '#ff8fc7');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(w / 2, h / 2); ctx.globalAlpha = 0.18; ctx.fillStyle = '#fff';
    for (let i = 0; i < 24; i++) { ctx.rotate(Math.PI / 12); ctx.fillRect(0, -18, 900, 36); }
    ctx.restore();
    drawJetzLogo(ctx, w / 2, 250, 230);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.font = `900 92px ${F.black}`;
    ctx.lineWidth = 16; ctx.strokeStyle = '#ff4f98';
    ctx.strokeText('REK-IN AJA!', w / 2, 480); ctx.fillText('REK-IN AJA!', w / 2, 480);
    ctx.font = `800 40px ${F.bold}`; ctx.fillStyle = '#16213e';
    ctx.fillText('Hearts2Hearts · Paket Rp35.000', w / 2, 600);
  }));
}

export function chalkMenu() {
  return cached('chalk', () => canvasTex(1024, 768, (ctx, w, h) => {
    ctx.fillStyle = '#2f4a3a'; ctx.fillRect(0, 0, w, h);
    const r = rng(77);
    for (let i = 0; i < 4000; i++) { ctx.fillStyle = `rgba(255,255,255,${r() * 0.05})`; ctx.fillRect(r() * w, r() * h, 2, 2); }
    ctx.fillStyle = '#f5f1e6'; ctx.textAlign = 'center'; ctx.font = `700 64px ${F.hand}`;
    ctx.fillText('Paket JetZrek-in', w / 2, 100);
    ctx.font = `700 34px ${F.hand}`; ctx.fillStyle = '#ffd7e8';
    ctx.fillText('6 snack JetZ + Backpack eksklusif', w / 2, 160);
    ctx.textAlign = 'left'; ctx.fillStyle = '#f5f1e6'; ctx.font = `600 34px ${F.hand}`;
    ['1x  Choco Stick', '2x  Sweet Stick', '2x  Croissant', '1x  Tortilla', '+   Backpack JetZ x H2H'].forEach((s, i) => ctx.fillText(s, 120, 250 + i * 56));
    ctx.textAlign = 'center';
    ctx.font = `600 44px ${F.hand}`; ctx.fillStyle = '#c9c9c9'; ctx.fillText('Rp 50.000', 770, 300);
    ctx.strokeStyle = '#ff8fbf'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(660, 310); ctx.lineTo(880, 275); ctx.stroke();
    ctx.font = `700 92px ${F.hand}`; ctx.fillStyle = '#ffe066'; ctx.fillText('Rp35rb', 770, 420);
    ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(770, 395, 170, 80, -0.05, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `600 30px ${F.hand}`; ctx.fillStyle = '#bfe3ff'; ctx.fillText('+ GRATIS bikin charm sendiri!', w / 2, 660);
    drawHeart(ctx, 900, 640, 40, null, '#ff8fbf'); drawStar(ctx, 110, 650, 26, '#ffe066');
  }));
}

export function classSign() {
  return cached('csign', () => canvasTex(512, 160, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'; rr(ctx, 4, 4, w - 8, h - 8, 18); ctx.fill();
    ctx.strokeStyle = '#1460d8'; ctx.lineWidth = 8; rr(ctx, 4, 4, w - 8, h - 8, 18); ctx.stroke();
    ctx.fillStyle = '#1460d8'; ctx.font = `900 56px ${F.round}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('KELAS 2-H', w / 2, 62);
    ctx.fillStyle = '#ff5fa2'; ctx.font = `800 30px ${F.bold}`; ctx.fillText('JetZrek-in Aja!', w / 2, 118);
  }));
}

export function rollupJetz() {
  return cached('ru_j', () => canvasTex(512, 1280, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#62c3ff'); g.addColorStop(0.6, '#a9d8ff'); g.addColorStop(1, '#ff8fc7');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    drawJetzLogo(ctx, 256, 150, 130);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `900 74px ${F.black}`;
    ctx.lineWidth = 12; ctx.strokeStyle = '#ff4f98';
    ctx.strokeText('REK-IN', 256, 300); ctx.fillText('REK-IN', 256, 300);
    ctx.strokeText('AJA!', 256, 380); ctx.fillText('AJA!', 256, 380);
    for (let i = 0; i < 4; i++) {
      const x = 80 + i * 118;
      ctx.fillStyle = '#5a6577'; rr(ctx, x - 44, 560, 88, 330, 36); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - 20, 560); ctx.lineTo(x, 610); ctx.lineTo(x + 20, 560); ctx.fill();
      ctx.fillStyle = '#f5d6bd'; ctx.beginPath(); ctx.arc(x, 520, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ['#2a1d16', '#5a3a26', '#1b1512', '#3a2b2a'][i]; ctx.beginPath(); ctx.arc(x, 508, 37, Math.PI, 0); ctx.fill();
      ctx.fillRect(x - 37, 508, 12, 60); ctx.fillRect(x + 25, 508, 12, 60);
    }
    ['sweet', 'tortilla', 'croissant'].forEach((v, i) => {
      ctx.fillStyle = JETZ_VARIANTS[v].bg2; rr(ctx, 50 + i * 145, 940, 120, 170, 14); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `900 18px ${F.bold}`; ctx.fillText(JETZ_VARIANTS[v].label, 110 + i * 145, 1030);
    });
    ctx.fillStyle = '#16213e'; ctx.font = `800 30px ${F.bold}`; ctx.fillText('x Hearts2Hearts', 256, 1200);
  }));
}

export function flexyJetz() {
  return cached('fx_j', () => canvasTex(512, 1024, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#ff6fb1'); g.addColorStop(0.5, '#5fc8ff'); g.addColorStop(1, '#1460d8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    drawJetzLogo(ctx, 256, 120, 110);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `900 46px ${F.black}`;
    ctx.fillText('REK-IN AJA!', 256, 230);
    for (let i = 0; i < 8; i++) { drawStar(ctx, 60 + (i * 61) % 400, 300 + (i * 97) % 600, 18, '#ffe066'); drawHeart(ctx, 100 + (i * 83) % 330, 350 + (i * 71) % 560, 26, '#ffffff'); }
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; rr(ctx, 60, 820, 392, 120, 24); ctx.fill();
    ctx.fillStyle = '#1460d8'; ctx.font = `900 46px ${F.black}`; ctx.fillText('Rp 35.000', 256, 898);
  }));
}

export function mainStageJetz() {
  return cached('ms_j', () => canvasTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#ff8fc7'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#7fd3ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    drawJetzLogo(ctx, w / 2, 190, 170);
    ctx.fillStyle = '#ff4f98'; ctx.textAlign = 'center'; ctx.font = `900 80px ${F.black}`;
    ctx.fillText('REK-IN AJA!', w / 2, 380);
    for (let i = 0; i < 2; i++) {
      const x = i ? w - 110 : 110;
      ctx.fillStyle = '#ffe066'; rr(ctx, x - 80, 120, 160, 280, 20); ctx.fill();
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x, 200, 52, 0, Math.PI * 2); ctx.arc(x, 330, 36, 0, Math.PI * 2); ctx.fill();
    }
  }));
}

export function nameplate(name, theme = 'jetz') {
  return cached('np_' + name + theme, () => canvasTex(256, 64, (ctx, w, h) => {
    ctx.fillStyle = theme === 'jetz' ? '#1460d8' : '#1a1a1a'; rr(ctx, 0, 0, w, h, 14); ctx.fill();
    ctx.fillStyle = theme === 'jetz' ? '#ffffff' : '#ffd21f';
    ctx.font = `900 ${fitText(ctx, name.toUpperCase(), 230, 34, F.bold)}px ${F.bold}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name.toUpperCase(), w / 2, h / 2 + 2);
  }));
}

export function posScreen(theme) {
  return cached('pos_' + theme, () => canvasTex(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#f7f7f9'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = theme === 'jetz' ? '#1460d8' : '#e2560c'; ctx.fillRect(0, 0, w, 54);
    ctx.fillStyle = '#fff'; ctx.font = `800 26px ${F.bold}`; ctx.fillText(theme === 'jetz' ? 'JetZ POS' : 'Chitato POS', 18, 36);
    ctx.fillStyle = '#333'; ctx.font = `600 20px ${F.bold}`;
    ['Paket Rp35.000   x1', 'QRIS / Debit', 'Total  Rp35.000'].forEach((s, i) => ctx.fillText(s, 24, 100 + i * 50));
    ctx.fillStyle = '#22a35a'; rr(ctx, 300, 240, 190, 56, 12); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `800 24px ${F.bold}`; ctx.fillText('BAYAR', 352, 276);
  }));
}

export function qrisSign() {
  return cached('qris', () => canvasTex(256, 320, (ctx, w, h) => {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d31f2a'; ctx.font = `900 40px ${F.bold}`; ctx.textAlign = 'center'; ctx.fillText('QRIS', w / 2, 48);
    const r = rng(5);
    for (let i = 0; i < 21; i++) for (let j = 0; j < 21; j++) if (r() > 0.5) { ctx.fillStyle = '#111'; ctx.fillRect(34 + i * 9, 70 + j * 9, 9, 9); }
    ctx.fillStyle = '#111'; [[34, 70], [160, 70], [34, 196]].forEach(([x, y]) => { ctx.fillRect(x, y, 54, 54); ctx.fillStyle = '#fff'; ctx.fillRect(x + 9, y + 9, 36, 36); ctx.fillStyle = '#111'; ctx.fillRect(x + 18, y + 18, 18, 18); });
  }));
}

export function tenantSign(text, bg, fg) {
  return cached('ts_' + text, () => canvasTex(1024, 192, (ctx, w, h) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `800 ${fitText(ctx, text, 940, 110, F.bold, '800')}px ${F.bold}`;
    ctx.fillText(text, w / 2, h / 2 + 4);
  }));
}

export function skyGradient() {
  return cached('sky', () => canvasTex(16, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#9cc4e8'); g.addColorStop(0.6, '#d6e6f2'); g.addColorStop(1, '#eef2f2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }));
}

export function cityFacade() {
  return cached('city', () => canvasTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#bcd5ea'); g.addColorStop(1, '#e9eef0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const r = rng(8);
    for (let i = 0; i < 18; i++) {
      const bw = 40 + r() * 90, bh = 120 + r() * 330, x = r() * w;
      ctx.fillStyle = `rgba(${120 + r() * 60},${140 + r() * 50},${160 + r() * 40},0.55)`;
      ctx.fillRect(x, h - bh, bw, bh);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      for (let y = h - bh + 8; y < h; y += 14) ctx.fillRect(x + 4, y, bw - 8, 4);
    }
    ctx.fillStyle = 'rgba(60,110,60,0.55)';
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(r() * w, h - 20 - r() * 30, 20 + r() * 25, 0, Math.PI * 2); ctx.fill(); }
  }));
}

export function stickerSheet() {
  return cached('stk', () => canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    drawHeart(ctx, 70, 80, 60, '#ff6fa8'); drawStar(ctx, 180, 80, 40, '#ffd21f');
    drawJetzLogo(ctx, 128, 180, 60);
  }));
}

export function instructionCard() {
  return cached('icard', () => canvasTex(256, 360, (ctx, w, h) => {
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1460d8'; ctx.font = `900 30px ${F.round}`; ctx.textAlign = 'center';
    ctx.fillText('CHARM', w / 2, 46); ctx.fillText('MAKING', w / 2, 80);
    ctx.fillStyle = '#333'; ctx.font = `600 18px ${F.bold}`; ctx.textAlign = 'left';
    ['1. Pilih tali & ring', '2. Susun manik huruf', '3. Tambah charm JetZ', '4. Kunci & pamerkan!'].forEach((s, i) => ctx.fillText(s, 20, 130 + i * 44));
    drawHeart(ctx, 200, 320, 40, '#ff6fa8');
  }));
}

export function backpackPrint() {
  return cached('bpp', () => canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#151515'; ctx.fillRect(0, 0, w, h);
    drawJetzLogo(ctx, w / 2, h / 2, 70);
  }));
}

export function toteChitato() {
  return cached('totec', () => canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f3ead8'; ctx.fillRect(0, 0, w, h);
    drawChitatoLogo(ctx, w / 2, 100, 46);
    ctx.fillStyle = '#1a1a1a'; ctx.font = `900 30px ${F.black}`; ctx.textAlign = 'center'; ctx.fillText('TREASURE', w / 2, 180);
  }));
}
