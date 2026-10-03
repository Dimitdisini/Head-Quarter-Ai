#!/usr/bin/env python3
"""
generate_cad_gamtek.py
Menghasilkan Gambar Kerja Teknik Arsitektur Standar ISO / DIN (Monokrom CAD Style)
Untuk Produksi Booth Pameran Chitato x JetZ (30.000 x 4.000 mm).

Kaidah Gamtek yang Diterapkan:
1. Format Kertas Baku A3 Landscape (420 x 297 mm, border 10 mm, margin kiri 20 mm untuk jilid).
2. Monokromatik (Hitam-Putih dengan arsir arsitektural).
3. Hierarki Garis (Lineweight): Kontur objek (0.5), detail (0.25), dimensi/grid (0.15).
4. Garis As Grid (Centerlines) strip-titik (A-H & 1-3) dengan balon grid.
5. Rantai Dimensi Bertingkat (Tingkat 1: Detail antar modul, Tingkat 2: Per Zona 15.000, Tingkat 3: Total 30.000).
6. Tanda Dimensi: Architectural Tick (kemiringan 45 derajat) + Angka posisi di atas garis sejajar. Satuan mm.
7. Simbol Ketinggian Elevasi Arsitektur (FL ±0.000, +2.450, dsb).
8. Kop Gambar Resmi (Title Block ISO 180 x 50 mm) di pojok kanan bawah dengan kolom persetujuan.
9. Notasi Tag Komponen & Tabel Spesifikasi Teknis Material Produksi.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC_FILE = ROOT / "spec" / "booth.spec.json"
OUT_SVG = ROOT / "concepts" / "gamtek-booth-detail.svg"
OUT_HTML = ROOT / "concepts" / "gamtek-booth-detail.html"

with open(SPEC_FILE, "r", encoding="utf-8") as f:
    spec = json.load(f)

# Standar Kanvas A3 (Skala Gambar Kerja)
# 1680 x 1188 px (Rasio tepat 420 x 297 mm ISO A3)
CANVAS_W = 1680
CANVAS_H = 1188

# Area Gambar Denah (Top View)
PLAN_X0 = 120
PLAN_Y0 = 140
SCALE = 47.0   # 1 meter = 47 px (30 meter = 1410 px)

# Area Tampak Depan (Front Elevation)
ELEV_X0 = 120
ELEV_Y0 = 490
ELEV_H_SCALE = 60.0  # 1 meter tinggi = 60 px (2.5 meter = 150 px)

def px(m_x): return PLAN_X0 + m_x * SCALE
def py(m_y): return PLAN_Y0 + (4.0 - m_y) * SCALE  # 4m utara (depan) di bawah, 0m selatan (belakang) di atas
def ex(m_x): return ELEV_X0 + m_x * SCALE
def ey(m_z): return ELEV_Y0 + (2.5 - m_z) * ELEV_H_SCALE # z=0 di bawah, z=2.5 di atas

elements = spec["elements"]
standees = spec["standee_rows"]

svg = []
svg.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}" width="100%" height="100%" style="background:#ffffff; font-family:'Courier New', 'Consolas', monospace;">
<defs>
  <!-- Architectural Tick 45 Derajat untuk Dimensi -->
  <marker id="cad-tick" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="7" markerHeight="7" orient="auto">
    <line x1="2" y1="10" x2="10" y2="2" stroke="#000000" stroke-width="1.8"/>
  </marker>

  <!-- Arrow Kepala Elevasi & Arah Potongan -->
  <marker id="cad-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 1 2 L 8 5 L 1 8 z" fill="#000000"/>
  </marker>

  <!-- Arsir Dinding Multiplek / Bata Ringan (Hatching ANSI31) -->
  <pattern id="hatch-wall" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="0" y2="10" stroke="#000000" stroke-width="0.8"/>
  </pattern>

  <!-- Arsir Panggung Kayu (Wood Grain / Decking) -->
  <pattern id="hatch-wood" width="8" height="8" patternUnits="userSpaceOnUse">
    <line x1="0" y1="4" x2="8" y2="4" stroke="#666666" stroke-width="0.6"/>
  </pattern>
</defs>

<!-- ========================================================================= -->
<!-- BORDER KERTAS STANDAR ARSITEKTUR A3 (Margin Kiri 20mm untuk Jilid)        -->
<!-- ========================================================================= -->
<rect width="{CANVAS_W}" height="{CANVAS_H}" fill="#ffffff"/>
<!-- Garis Luar Kertas -->
<rect x="15" y="15" width="{CANVAS_W-30}" height="{CANVAS_H-30}" fill="none" stroke="#000000" stroke-width="1.5"/>
<!-- Garis Margin Gambar (Kiri 40px ~20mm jilid, atas/kanan/bawah 20px) -->
<rect x="40" y="25" width="{CANVAS_W-65}" height="{CANVAS_H-50}" fill="none" stroke="#000000" stroke-width="0.8"/>
''')

# =========================================================================
# GARIS AS GRID ARSITEKTUR (Centerlines: A s/d G & 1 s/d 2)
# =========================================================================
svg.append('<!-- GARIS AS & GRIDLINES -->\n<g id="gridlines">')
grid_x_list = [
    ("A", 0.0), ("B", 4.5), ("C", 9.8), ("D", 15.0),
    ("E", 18.2), ("F", 22.0), ("G", 26.0), ("H", 30.0)
]
for label, xm in grid_x_list:
    gx = px(xm)
    # Garis As strip-titik (centerline CAD style)
    svg.append(f'''
    <line x1="{gx}" y1="{py(4.6)}" x2="{gx}" y2="{ey(0)+25}" stroke="#000000" stroke-width="0.6" stroke-dasharray="14,3,3,3"/>
    <!-- Balon As Atas -->
    <circle cx="{gx}" cy="{py(4.8)}" r="11" fill="#ffffff" stroke="#000000" stroke-width="1"/>
    <text x="{gx}" y="{py(4.8)+4}" font-size="10" font-weight="bold" text-anchor="middle">{label}</text>
    ''')

grid_y_list = [("1", 0.0), ("2", 2.0), ("3", 4.0)]
for label, ym in grid_y_list:
    gy = py(ym)
    svg.append(f'''
    <line x1="{px(-0.6)}" y1="{gy}" x2="{px(30.6)}" y2="{gy}" stroke="#000000" stroke-width="0.6" stroke-dasharray="14,3,3,3"/>
    <!-- Balon As Samping -->
    <circle cx="{px(-0.8)}" cy="{gy}" r="11" fill="#ffffff" stroke="#000000" stroke-width="1"/>
    <text x="{px(-0.8)}" y="{gy+4}" font-size="10" font-weight="bold" text-anchor="middle">{label}</text>
    ''')
svg.append('</g>')

# =========================================================================
# GAMBAR 1: DENAH TATA LETAK BOOTH (TOP VIEW) - SKALA 1:50
# =========================================================================
svg.append(f'''
<g id="drawing-plan">
  <!-- Judul Gambar & Skala Bar -->
  <text x="{PLAN_X0}" y="75" font-size="13" font-weight="bold" fill="#000000">01. DENAH TATA LETAK BOOTH (FLOOR PLAN)</text>
  <text x="{PLAN_X0}" y="92" font-size="9" fill="#000000">SKALA 1 : 50 | SATUAN UKURAN: MILIMETER (mm)</text>
  <line x1="{PLAN_X0}" y1="98" x2="{PLAN_X0+280}" y2="98" stroke="#000000" stroke-width="1"/>

  <!-- Batas Outline Lantai Booth 30.000 x 4.000 mm -->
  <rect x="{px(0)}" y="{py(4)}" width="{30*SCALE}" height="{4*SCALE}" fill="#ffffff" stroke="#000000" stroke-width="1.8"/>

  <!-- As Pembagi Zona di x = 15.000 mm -->
  <line x1="{px(15)}" y1="{py(4.3)}" x2="{px(15)}" y2="{py(-0.3)}" stroke="#000000" stroke-width="1.2" stroke-dasharray="10,3,3,3"/>
  <text x="{px(15)}" y="{py(4.15)}" font-size="8.5" font-weight="bold" text-anchor="middle">AS PEMISAH ZONA (x = 15.000)</text>

  <!-- Notasi Zona -->
  <text x="{px(7.5)}" y="{py(2.0)}" font-size="11" font-weight="bold" fill="#888888" text-anchor="middle" letter-spacing="2">ZONA A: CHITATO × TREASURE</text>
  <text x="{px(22.5)}" y="{py(2.0)}" font-size="11" font-weight="bold" fill="#888888" text-anchor="middle" letter-spacing="2">ZONA B: JETZ × HEARTS2HEARTS</text>
''')

# Render Elemen di Denah dengan Kaidah CAD Teknis
for el in elements:
    x, y, z = el["pos"]
    sx, sy, sz = el["size"]
    tag = el["tag"]
    eid = el["id"]
    shape = el.get("shape", "box")
    el_type = el.get("type", "")
    dim_st = el.get("dim", "proposed")

    bx = px(x - sx/2.0)
    by = py(y + sy/2.0)
    bw = sx * SCALE
    bh = sy * SCALE

    # Dinding partisi / backdrop diarsir sesuai kaidah arsitektur
    if "wall" in el_type or "WALL" in eid:
        svg.append(f'''
    <rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="url(#hatch-wall)" stroke="#000000" stroke-width="1.5"/>
    <rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="none" stroke="#000000" stroke-width="1.5"/>
        ''')
    elif shape == "cylinder":
        cx = px(x)
        cy = py(y)
        rx = (sx/2.0) * SCALE
        ry = (sy/2.0) * SCALE
        svg.append(f'''
    <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#ffffff" stroke="#000000" stroke-width="1.2"/>
    <!-- Cross Center Mark silinder -->
    <line x1="{cx-4}" y1="{cy}" x2="{cx+4}" y2="{cy}" stroke="#000000" stroke-width="0.6"/>
    <line x1="{cx}" y1="{cy-4}" x2="{cx}" y2="{cy+4}" stroke="#000000" stroke-width="0.6"/>
        ''')
    else:
        # Garis putus jika assumed, garis tegas jika given/proposed
        dash = 'stroke-dasharray="4,2"' if dim_st == "assumed" else ""
        fill_pat = "url(#hatch-wood)" if "stage" in el_type or "school" in el_type else "#ffffff"
        svg.append(f'''
    <rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="{fill_pat}" stroke="#000000" stroke-width="1.2" {dash}/>
        ''')

    # Balon Notasi Tag Arsitektur (Keynote Circle)
    cx_box = bx + bw/2.0
    cy_box = by + bh/2.0
    # Beri label teks teknis
    svg.append(f'''
    <circle cx="{cx_box}" cy="{cy_box}" r="8" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
    <text x="{cx_box}" y="{cy_box+3}" font-size="7.5" font-weight="bold" fill="#000000" text-anchor="middle">{tag}</text>
    ''')

# Render Standee (Simbol Teknis Orang / Standee Silhouette)
for row in standees:
    x0, ry, pitch = row["x0"], row["y"], row["pitch"]
    bw, bd = row["base"]
    for i, it in enumerate(row["items"]):
        cx = x0 + i * pitch
        bx = px(cx - bw/2.0)
        by = py(ry + bd/2.0)
        bw_px = bw * SCALE
        bh_px = bd * SCALE
        svg.append(f'''
    <!-- Standee Base & Centreline -->
    <rect x="{bx}" y="{by}" width="{bw_px}" height="{bh_px}" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
    <line x1="{bx}" y1="{by+bh_px/2}" x2="{bx+bw_px}" y2="{by+bh_px/2}" stroke="#000000" stroke-width="0.6"/>
    <circle cx="{bx+bw_px/2}" cy="{by+bh_px/2}" r="1.5" fill="#000000"/>
        ''')

# =========================================================================
# SISTEM RANTAI DIMENSI BERTINGKAT (DIMENSION CHAINS) - STANDAR ISO
# =========================================================================
def cad_dim_h(x1, x2, y_m, val_str, offset_y=-18):
    sx1 = px(x1)
    sx2 = px(x2)
    sy = py(y_m) + offset_y
    svg.append(f'''
    <g class="dim">
      <!-- Garis Dimensi Utama -->
      <line x1="{sx1}" y1="{sy}" x2="{sx2}" y2="{sy}" stroke="#000000" stroke-width="0.8" marker-start="url(#cad-tick)" marker-end="url(#cad-tick)"/>
      <!-- Garis Ekstensi / Proyeksi -->
      <line x1="{sx1}" y1="{py(y_m)}" x2="{sx1}" y2="{sy-4}" stroke="#000000" stroke-width="0.5"/>
      <line x1="{sx2}" y1="{py(y_m)}" x2="{sx2}" y2="{sy-4}" stroke="#000000" stroke-width="0.5"/>
      <!-- Angka Ukuran di Atas Garis Sejajar -->
      <text x="{(sx1+sx2)/2}" y="{sy-3}" font-size="8" font-weight="bold" fill="#000000" text-anchor="middle">{val_str}</text>
    </g>''')

def cad_dim_v(y1, y2, x_m, val_str, offset_x=-25):
    sy1 = py(y1)
    sy2 = py(y2)
    sx = px(x_m) + offset_x
    svg.append(f'''
    <g class="dim">
      <line x1="{sx}" y1="{sy1}" x2="{sx}" y2="{sy2}" stroke="#000000" stroke-width="0.8" marker-start="url(#cad-tick)" marker-end="url(#cad-tick)"/>
      <line x1="{px(x_m)}" y1="{sy1}" x2="{sx-4}" y2="{sy1}" stroke="#000000" stroke-width="0.5"/>
      <line x1="{px(x_m)}" y1="{sy2}" x2="{sx-4}" y2="{sy2}" stroke="#000000" stroke-width="0.5"/>
      <text x="{sx-4}" y="{(sy1+sy2)/2+3}" font-size="8" font-weight="bold" fill="#000000" text-anchor="end">{val_str}</text>
    </g>''')

# Rantai Dimensi Tingkat 3: Total Panjang Booth
cad_dim_h(0, 30, 4.0, "30000", offset_y=-48)

# Rantai Dimensi Tingkat 2: Per Zona Modul
cad_dim_h(0, 15, 4.0, "15000", offset_y=-30)
cad_dim_h(15, 30, 4.0, "15000", offset_y=-30)

# Rantai Dimensi Tingkat 1: Modul Kunci
cad_dim_h(0, 4.5, 4.0, "4500", offset_y=-14)
cad_dim_h(4.5, 8.0, 4.0, "3500", offset_y=-14)
cad_dim_h(8.0, 15.0, 4.0, "7000", offset_y=-14)
cad_dim_h(15.0, 19.8, 4.0, "4800", offset_y=-14)
cad_dim_h(19.8, 30.0, 4.0, "10200", offset_y=-14)

# Dimensi Kedalaman Booth (Sumbu Y)
cad_dim_v(0, 4.0, 0.0, "4000", offset_x=-30)
cad_dim_v(0, 0.2, 0.0, "200", offset_x=-15)
cad_dim_v(0.2, 4.0, 0.0, "3800", offset_x=-15)

# Dimensi Lorong Kasir
cad_dim_h(12.605, 13.995, 3.25, "1390 (LORONG A)", offset_y=-12)
cad_dim_h(26.705, 28.195, 3.25, "1490 (LORONG B)", offset_y=-12)

svg.append('</g>')

# =========================================================================
# GAMBAR 2: TAMPAK DEPAN BOOTH (FRONT ELEVATION) - SKALA 1:50
# =========================================================================
svg.append(f'''
<g id="drawing-elevation">
  <!-- Judul Gambar & Skala Bar -->
  <text x="{ELEV_X0}" y="425" font-size="13" font-weight="bold" fill="#000000">02. TAMPAK DEPAN BOOTH (FRONT ELEVATION)</text>
  <text x="{ELEV_X0}" y="442" font-size="9" fill="#000000">SKALA 1 : 50 | ARAH PANDANG: UTARA MENGHADAP SELATAN</text>
  <line x1="{ELEV_X0}" y1="448" x2="{ELEV_X0+280}" y2="448" stroke="#000000" stroke-width="1"/>

  <!-- Garis Dasar Lantai Kerja (FL ±0.000) Tebal 2.0 -->
  <line x1="{ex(0)-25}" y1="{ey(0)}" x2="{ex(30)+25}" y2="{ey(0)}" stroke="#000000" stroke-width="2"/>
  
  <!-- Notasi Elevasi Segitiga Terbalik Arsitektur FL ±0.000 -->
  <path d="M {ex(0)-15} {ey(0)} L {ex(0)-25} {ey(0)-10} L {ex(0)-5} {ey(0)-10} Z" fill="#000000"/>
  <text x="{ex(0)-28}" y="{ey(0)-3}" font-size="8.5" font-weight="bold" fill="#000000" text-anchor="end">FL ±0.000</text>

  <!-- Garis Batas Ketinggian Maksimum Gedung +2.500 -->
  <line x1="{ex(0)-25}" y1="{ey(2.5)}" x2="{ex(30)+25}" y2="{ey(2.5)}" stroke="#000000" stroke-width="1" stroke-dasharray="8,3"/>
  <path d="M {ex(30)+15} {ey(2.5)} L {ex(30)+25} {ey(2.5)-10} L {ex(30)+5} {ey(2.5)-10} Z" fill="none" stroke="#000000" stroke-width="1"/>
  <text x="{ex(30)+28}" y="{ey(2.5)-3}" font-size="8.5" font-weight="bold" fill="#000000">BATAS MAKS GEDUNG +2.500</text>

  <!-- Garis As Pemisah x=15m -->
  <line x1="{ex(15)}" y1="{ey(0)+15}" x2="{ex(15)}" y2="{ey(2.5)-15}" stroke="#000000" stroke-width="1" stroke-dasharray="10,3,3,3"/>
''')

# Render Elemen Tampak Depan
sorted_elev = sorted(elements, key=lambda e: e["pos"][1])

for el in sorted_elev:
    x, y, z = el["pos"]
    sx, sy, sz = el["size"]
    tag = el["tag"]
    eid = el["id"]
    dim_st = el.get("dim", "proposed")

    ex_l = ex(x - sx/2.0)
    ey_t = ey(z + sz)
    ew_px = sx * SCALE
    eh_px = sz * ELEV_H_SCALE
    dash = 'stroke-dasharray="4,2"' if dim_st == "assumed" else ""

    if "ARCH" in eid:
        # Lengkung Arch A07
        svg.append(f'''
    <!-- Arch A07 -->
    <path d="M {ex_l} {ey(0)} L {ex_l} {ey(1.5)} A {ew_px/2} {ew_px/2} 0 0 1 {ex_l+ew_px} {ey(1.5)} L {ex_l+ew_px} {ey(0)} Z" 
          fill="#ffffff" stroke="#000000" stroke-width="1.8"/>
    <!-- Layar LED di dalam Arch -->
    <rect x="{ex(9.8)-0.405*SCALE}" y="{ey(0.75+1.44)}" width="{0.81*SCALE}" height="{1.44*ELEV_H_SCALE}" fill="#f1f5f9" stroke="#000000" stroke-width="1.2"/>
    <text x="{ex(9.8)}" y="{ey(0.75+0.72)}" font-size="7.5" font-weight="bold" text-anchor="middle">LED 65"</text>
        ''')
    elif "DESK" in eid:
        # Event Desk (Meja Kasir)
        ch_px = 1.0 * ELEV_H_SCALE
        svg.append(f'''
    <rect x="{ex_l}" y="{ey(1.0)}" width="{ew_px}" height="{ch_px}" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <line x1="{ex_l+4}" y1="{ey(1.0)}" x2="{ex_l+4}" y2="{ey_t+16}" stroke="#000000" stroke-width="1.5"/>
    <line x1="{ex_l+ew_px-4}" y1="{ey(1.0)}" x2="{ex_l+ew_px-4}" y2="{ey_t+16}" stroke="#000000" stroke-width="1.5"/>
    <rect x="{ex_l}" y="{ey_t}" width="{ew_px}" height="{16}" fill="#ffffff" stroke="#000000" stroke-width="1.2"/>
    <text x="{ex_l+ew_px/2}" y="{ey(0.5)+3}" font-size="7.5" font-weight="bold" text-anchor="middle">{tag}</text>
        ''')
    else:
        svg.append(f'''
    <rect x="{ex_l}" y="{ey_t}" width="{ew_px}" height="{eh_px}" fill="#ffffff" stroke="#000000" stroke-width="1.2" {dash}/>
    <circle cx="{ex_l+ew_px/2}" cy="{ey_t+eh_px/2}" r="7" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
    <text x="{ex_l+ew_px/2}" y="{ey_t+eh_px/2+2.5}" font-size="6.5" font-weight="bold" text-anchor="middle">{tag}</text>
        ''')

# Render Standee Tampak Depan
for row in standees:
    x0, pitch = row["x0"], row["pitch"]
    bw, h = row["base"][0], row["height"]
    h_px = h * ELEV_H_SCALE
    for i, it in enumerate(row["items"]):
        cx = x0 + i * pitch
        bx = ex(cx - bw/2.0)
        bw_px = bw * SCALE
        by = ey(h)
        svg.append(f'''
    <!-- Standee {it["name"]} -->
    <rect x="{bx}" y="{by}" width="{bw_px}" height="{h_px}" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
    <circle cx="{bx+bw_px/2}" cy="{by+10}" r="6" fill="#ffffff" stroke="#000000" stroke-width="0.6"/>
    <line x1="{bx+bw_px/2}" y1="{by+16}" x2="{bx+bw_px/2}" y2="{by+h_px-15}" stroke="#000000" stroke-width="0.6"/>
        ''')

# Garis Elevasi Bertingkat Tampak Samping Kanan
def elev_mark(z_m, label_str):
    sz = ey(z_m)
    sx = ex(30) + 10
    svg.append(f'''
    <line x1="{ex(30)}" y1="{sz}" x2="{sx+60}" y2="{sz}" stroke="#000000" stroke-width="0.6" stroke-dasharray="3,2"/>
    <path d="M {sx+15} {sz} L {sx+25} {sz-8} L {sx+5} {sz-8} Z" fill="#000000"/>
    <text x="{sx+30}" y="{sz-2}" font-size="8" font-weight="bold" fill="#000000">+{int(z_m*1000)} ({label_str})</text>
    ''')

elev_mark(2.45, "TOP ARCH A07")
elev_mark(2.40, "BACKDROP WALL")
elev_mark(2.00, "HEADER DESK")
elev_mark(1.80, "STANDEE TREASURE")
elev_mark(1.65, "STANDEE H2H")
elev_mark(0.78, "TOP MEJA CHARM")

svg.append('</g>')

# =========================================================================
# TABEL SPESIFIKASI TEKNIS & BILL OF QUANTITIES (KIRI & TENGAH BAWAH)
# =========================================================================
TAB_Y = 680
svg.append(f'''
<g id="spec-table">
  <text x="50" y="{TAB_Y-10}" font-size="11" font-weight="bold" fill="#000000">03. TABEL SPESIFIKASI TEKNIS ELEMEN PRODUKSI &amp; MATERIAL</text>
  
  <!-- Header Tabel -->
  <rect x="50" y="{TAB_Y}" width="1120" height="20" fill="#000000"/>
  <text x="65" y="{TAB_Y+14}" font-size="8.5" font-weight="bold" fill="#ffffff">TAG</text>
  <text x="110" y="{TAB_Y+14}" font-size="8.5" font-weight="bold" fill="#ffffff">ID ELEMEN</text>
  <text x="210" y="{TAB_Y+14}" font-size="8.5" font-weight="bold" fill="#ffffff">NAMA MODUL / ELEMEN BOOTH</text>
  <text x="460" y="{TAB_Y+14}" font-size="8.5" font-weight="bold" fill="#ffffff">UKURAN PxLxT (mm)</text>
  <text x="620" y="{TAB_Y+14}" font-size="8.5" font-weight="bold" fill="#ffffff">SPESIFIKASI BAHAN &amp; FINISHING</text>
  <text x="980" y="{TAB_Y+14}" font-size="8.5" font-weight="bold" fill="#ffffff">SUMBER / STATUS</text>
''')

# Baris Spesifikasi Gabungan
specs_data = [
    ("A01", "A-WALL-1..3", "Backdrop Dinding Belakang (3 Segmen)", "15000 × 200 × 2400", "Rangka Hollow 40x40, Multiplek 12mm, Finish Duco Matte Oranye/Hijau", "PRODUKSI BARU"),
    ("A02", "A-STD (9x)", "Standee Member TREASURE (Resmi)", "Base 700×400, T=1800", "Impraboard 5mm cetak UV Flatbed, Plat besi pemberat 4mm", "POSM RESMI (GIVEN)"),
    ("A03", "A-HEADER", "Sign Header 'CHITATO × TREASURE'", "4000 × 100 × 500", "Akrilik Susu 3mm + Cutting Sticker Sandblast + LED Module", "PRODUKSI BARU"),
    ("A04", "A-CHIP (2x)", "Chip Chair (Kursi Keripik Kentang)", "900 × 900 × 1300", "Fiberglass Moulding / Multiplek Bending + Rangka Pipa Besi", "PRODUKSI BARU"),
    ("A05", "A-POUF (4x)", "Pouffe Bulat Pengunjung", "Ø 550 × T 400", "Busa Rebounded Densiti 30, Rangka Kayu Solid, Kulit Sintetis", "SEWA / PRODUKSI"),
    ("A06", "A-TOTEM (2x)", "Totem Pack Chitato & Lite", "730 × 300 × 950", "Multiplek 9mm, Sticker Vinyl Matte Laminasi Doff", "POSM RESMI (GIVEN)"),
    ("A07", "A-ARCH+LED", "Arch 'Find Your Wave' Lengkung", "2400 × 500 × 2450", "Hollow 40x40, Multiplek Bending, Braket LED Portrait 65\", Neon Flex", "PRODUKSI KHUSUS"),
    ("A08", "A-PLINTH", "Plinth Display Tas Eksklusif", "Ø 600 × T 900", "Silinder Pipa Sonotube / Plywood finish Cat White Satin + Akrilik Cover", "PRODUKSI BARU"),
    ("A09", "A-DESK", "Event Desk Kasir Chitato", "2000 × 1000 × 2000", "Meja Multiplek 18mm finish HPL Woodgrain, Tiang Besi Header 2.0m", "POSM RESMI (GIVEN)"),
    ("A11", "A-FLEXY (2x)", "Flexy Rack Chitato (Antrean)", "610 × 500 × 1300", "Wiremesh Besi Coating Hitam, Rak Display Snack 4 Susun", "POSM RESMI (GIVEN)"),
    ("B01", "B-DIV", "Divider Locker Pembatas Zona (x=15)", "400 × 4000 × 2400", "5 Modul Locker Multiplek 15mm, Sisi B Pintu Locker, Sisi A Cover Dinding", "PRODUKSI (ASSUMED)"),
    ("B02", "B-WALL", "Dinding Kelas JetZ (Backdrop)", "14600 × 200 × 2400", "Rangka Hollow Besi, Multiplek finish Cat Biru Pastel + Grafis Blackboard", "PRODUKSI BARU"),
    ("B03", "B-LOCKER", "Locker Set B Backdrop Foto", "4800 × 400 × 2400", "Mockup Pintu Locker Sekolah finish Duco Pink Pastel & Biru Muda", "POSM RESMI (GIVEN)"),
    ("B04", "B-STD (8x)", "Standee Hearts2Hearts (8 Member)", "Base 500×400, T=1650", "Impraboard 5mm cetak High-Res, Kaki Penyangga Plat Besi", "POSM RESMI (GIVEN)"),
    ("B05", "B-SIGN (3x)", "Signage Varian (Sweet, Tort, Crois)", "1400/1100 × 50 × 500", "Neon Box Slim Akrilik 2mm, Huruf Timbul LED Backlit", "PRODUKSI (ASSUMED)"),
    ("B07", "B-STAGE", "Main Stage 'Gesrek Challenge'", "2000 × 1500 × 2000", "Platform Level Panggung T=500 Kayu Multiplek 18mm Karpet + Arch Headphone", "PRODUKSI (ASSUMED)"),
    ("B08", "B-CHARM", "Meja Kerja Charm Making (DIY)", "2400 × 900 × 780", "Top Table Solid Wood / Plywood finish HPL Putih Glossy, Kaki Hollow Besi", "PRODUKSI BARU"),
    ("B09", "B-STOOL (4x)", "Stool Bangku Kerja Workshop", "Ø 350 × T 450", "Dudukan Busa Lapis Vinyl Pink/Biru, Kaki Kayu Solid Tapered", "SEWA / PRODUKSI"),
    ("B10", "B-DESK", "Event Desk Kasir JetZ", "2000 × 1000 × 2000", "Meja Kasir POSM Brand 2.0m + Header + Area Repack Tas Belakang", "POSM RESMI (GIVEN)"),
]

ty = TAB_Y + 20
for tag, eid, name, dim, mat, src in specs_data:
    # Garis Pembatas Baris
    svg.append(f'''
    <rect x="50" y="{ty}" width="1120" height="21" fill="#ffffff" stroke="#cccccc" stroke-width="0.5"/>
    <text x="65" y="{ty+14}" font-size="8" font-weight="bold">{tag}</text>
    <text x="110" y="{ty+14}" font-size="7.5">{eid}</text>
    <text x="210" y="{ty+14}" font-size="8" font-weight="bold">{name}</text>
    <text x="460" y="{ty+14}" font-size="7.5">{dim}</text>
    <text x="620" y="{ty+14}" font-size="7.5">{mat}</text>
    <text x="980" y="{ty+14}" font-size="7.5" font-weight="bold">{src}</text>
    ''')
    ty += 21

svg.append('</g>')

# =========================================================================
# KOP GAMBAR RESMI (TITLE BLOCK / ETIKET ISO 180 x 50 mm) POJOK KANAN BAWAH
# =========================================================================
TB_W = 440
TB_H = 430
TB_X = CANVAS_W - TB_W - 25
TB_Y = CANVAS_H - TB_H - 25

svg.append(f'''
<!-- KOP GAMBAR KERJA (TITLE BLOCK ARSITEKTUR) -->
<g id="title-block">
  <!-- Frame Luar Kop -->
  <rect x="{TB_X}" y="{TB_Y}" width="{TB_W}" height="{TB_H}" fill="#ffffff" stroke="#000000" stroke-width="1.8"/>
  
  <!-- Baris Klien -->
  <rect x="{TB_X}" y="{TB_Y}" width="{TB_W}" height="45" fill="#f8fafc" stroke="#000000" stroke-width="0.8"/>
  <text x="{TB_X+15}" y="{TB_Y+18}" font-size="8" font-weight="bold" fill="#666666">PEMBERI TUGAS / KLIEN:</text>
  <text x="{TB_X+15}" y="{TB_Y+34}" font-size="11" font-weight="bold" fill="#000000">PT INDOFOOD FORTUNA MAKMUR</text>

  <!-- Baris Proyek -->
  <rect x="{TB_X}" y="{TB_Y+45}" width="{TB_W}" height="55" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
  <text x="{TB_X+15}" y="{TB_Y+62}" font-size="8" font-weight="bold" fill="#666666">NAMA PROYEK:</text>
  <text x="{TB_X+15}" y="{TB_Y+78}" font-size="11" font-weight="bold" fill="#000000">BOOTH ACTIVATION CHITATO × JETZ 2026</text>
  <text x="{TB_X+15}" y="{TB_Y+92}" font-size="8.5" fill="#333333">Lobby Indofood Tower, Jl. Jend. Sudirman Kav. 76-78, Jakarta</text>

  <!-- Baris Judul Lembar Gambar -->
  <rect x="{TB_X}" y="{TB_Y+100}" width="{TB_W}" height="55" fill="#f8fafc" stroke="#000000" stroke-width="0.8"/>
  <text x="{TB_X+15}" y="{TB_Y+118}" font-size="8" font-weight="bold" fill="#666666">JUDUL GAMBAR KERJA:</text>
  <text x="{TB_X+15}" y="{TB_Y+136}" font-size="13" font-weight="bold" fill="#000000">DENAH TATA LETAK &amp; TAMPAK DEPAN BOOTH</text>
  <text x="{TB_X+15}" y="{TB_Y+148}" font-size="8.5" fill="#000000">(LAYOUT PLAN, ELEVATION &amp; SPECIFICATION)</text>

  <!-- Grid Kolom Pengesahan & Paraf -->
  <rect x="{TB_X}" y="{TB_Y+155}" width="{TB_W}" height="145" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
  
  <!-- Header Kolom Paraf -->
  <line x1="{TB_X+146}" y1="{TB_Y+155}" x2="{TB_X+146}" y2="{TB_Y+300}" stroke="#000000" stroke-width="0.8"/>
  <line x1="{TB_X+292}" y1="{TB_Y+155}" x2="{TB_X+292}" y2="{TB_Y+300}" stroke="#000000" stroke-width="0.8"/>
  <line x1="{TB_X}" y1="{TB_Y+180}" x2="{TB_X+TB_W}" y2="{TB_Y+180}" stroke="#000000" stroke-width="0.8"/>

  <text x="{TB_X+73}" y="{TB_Y+172}" font-size="8.5" font-weight="bold" text-anchor="middle">DIGAMBAR (DRAFTER)</text>
  <text x="{TB_X+219}" y="{TB_Y+172}" font-size="8.5" font-weight="bold" text-anchor="middle">DIPERIKSA (CHECKED)</text>
  <text x="{TB_X+365}" y="{TB_Y+172}" font-size="8.5" font-weight="bold" text-anchor="middle">DISETUJUI (APPROVED)</text>

  <!-- Kolom Paraf Isi -->
  <text x="{TB_X+73}" y="{TB_Y+245}" font-size="9" font-weight="bold" text-anchor="middle">ANTIGRAVITY CAD</text>
  <text x="{TB_X+73}" y="{TB_Y+260}" font-size="7.5" text-anchor="middle">Tgl: 02/10/2026</text>

  <text x="{TB_X+219}" y="{TB_Y+245}" font-size="9" font-weight="bold" text-anchor="middle">LEAD PRODUCTION</text>
  <text x="{TB_X+219}" y="{TB_Y+260}" font-size="7.5" text-anchor="middle">Tgl: --/10/2026</text>

  <text x="{TB_X+365}" y="{TB_Y+245}" font-size="10" font-weight="bold" text-anchor="middle">DIMITRI AHMAD</text>
  <text x="{TB_X+365}" y="{TB_Y+260}" font-size="7.5" text-anchor="middle">Brand Coordinator</text>

  <!-- Metadata Bawah Kop -->
  <rect x="{TB_X}" y="{TB_Y+300}" width="{TB_W}" height="130" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
  
  <line x1="{TB_X}" y1="{TB_Y+332}" x2="{TB_X+TB_W}" y2="{TB_Y+332}" stroke="#000000" stroke-width="0.6"/>
  <line x1="{TB_X}" y1="{TB_Y+365}" x2="{TB_X+TB_W}" y2="{TB_Y+365}" stroke="#000000" stroke-width="0.6"/>
  <line x1="{TB_X}" y1="{TB_Y+397}" x2="{TB_X+TB_W}" y2="{TB_Y+397}" stroke="#000000" stroke-width="0.6"/>
  <line x1="{TB_X+220}" y1="{TB_Y+300}" x2="{TB_X+220}" y2="{TB_Y+430}" stroke="#000000" stroke-width="0.6"/>

  <text x="{TB_X+15}" y="{TB_Y+320}" font-size="8" font-weight="bold">SKALA: 1 : 50 (A3)</text>
  <text x="{TB_X+235}" y="{TB_Y+320}" font-size="8" font-weight="bold">SATUAN: MILIMETER (mm)</text>

  <text x="{TB_X+15}" y="{TB_Y+352}" font-size="8" font-weight="bold">TANGGAL: 02 OKTOBER 2026</text>
  <text x="{TB_X+235}" y="{TB_Y+352}" font-size="8" font-weight="bold">STATUS: DRAFT PRODUKSI</text>

  <text x="{TB_X+15}" y="{TB_Y+384}" font-size="8" font-weight="bold">KODE SUMBER: booth.spec.json</text>
  <text x="{TB_X+235}" y="{TB_Y+384}" font-size="8" font-weight="bold">REVISI: REV-0 (GATE 0)</text>

  <!-- Nomor Lembar Gambar Besar -->
  <text x="{TB_X+15}" y="{TB_Y+418}" font-size="9" font-weight="bold">LEMBAR GAMBAR KE:</text>
  <text x="{TB_X+320}" y="{TB_Y+422}" font-size="20" font-weight="bold" fill="#000000">T - 01 / 02</text>
</g>
''')

svg.append('</svg>')

svg_content = "\n".join(svg)

# Simpan File SVG
with open(OUT_SVG, "w", encoding="utf-8") as f:
    f.write(svg_content)

# Simpan HTML Viewer
html_content = f'''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Gamtek Arsitektur ISO: Booth Chitato x JetZ</title>
  <style>
    body {{
      margin: 0;
      padding: 20px;
      background: #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .sheet-container {{
      background: #ffffff;
      box-shadow: 0 10px 40px rgba(0,0,0,0.6);
      border-radius: 4px;
      max-width: 1680px;
      width: 100%;
      overflow-x: auto;
    }}
    .info-bar {{
      max-width: 1680px;
      width: 100%;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      color: #cbd5e1;
      font-size: 13px;
    }}
    .badge {{
      background: #0284c7;
      color: #fff;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: bold;
    }}
  </style>
</head>
<body>
  <div class="info-bar">
    <div><b>GAMBAR KERJA TEKNIK PRODUKSI (ISO STANDAR A3)</b> — Chitato × JetZ (30.000 × 4.000 mm)</div>
    <div class="badge">LEMBAR T-01 &amp; T-02 (CAD STYLE)</div>
  </div>
  <div class="sheet-container">
    {svg_content}
  </div>
</body>
</html>
'''

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"✅ Gambar Kerja Standar ISO (SVG) berhasil dibuat: {OUT_SVG}")
print(f"✅ Gambar Kerja Standar ISO (HTML) berhasil dibuat: {OUT_HTML}")
