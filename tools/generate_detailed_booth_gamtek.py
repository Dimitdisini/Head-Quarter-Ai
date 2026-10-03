#!/usr/bin/env python3
"""
generate_detailed_booth_gamtek.py
Menghasilkan Gambar Teknik (Gamtek) Presisi & Detail KHUSUS FISIK BOOTH (30 x 4 m)
Format: Lembar Kerja Arsitektur / Interior Booth Pameran
- Denah Tata Letak Booth (Top View)
- Tampak Depan Booth (Front Elevation)
- Detail Komponen & Legenda Lengkap tiap zona (A01-A12 & B01-B13)
- Satuan Milimeter (mm)
- Skala & Dimensi Lengkap
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC_FILE = ROOT / "spec" / "booth.spec.json"
OUT_SVG = ROOT / "concepts" / "gamtek-booth-detail.svg"
OUT_HTML = ROOT / "concepts" / "gamtek-booth-detail.html"

with open(SPEC_FILE, "r", encoding="utf-8") as f:
    spec = json.load(f)

# Kanvas Gambar Teknik Format Lebar (A2/A3 Ultra-Clear)
CANVAS_W = 1600
CANVAS_H = 1100

# Area Denah (Top View)
PLAN_X0 = 60
PLAN_Y0 = 100
SCALE_X = 48.0   # 1 meter = 48 px (30 meter = 1440 px)
SCALE_Y = 48.0   # 4 meter = 192 px

# Area Tampak Depan (Front Elevation)
ELEV_X0 = 60
ELEV_Y0 = 420
ELEV_H_SCALE = 55.0  # 1 meter tinggi = 55 px (2.5 meter = 137.5 px)

def px(m_x): return PLAN_X0 + m_x * SCALE_X
def py(m_y): return PLAN_Y0 + (4.0 - m_y) * SCALE_Y  # y=4 (depan) di bawah, y=0 (belakang) di atas
def ex(m_x): return ELEV_X0 + m_x * SCALE_X
def ey(m_z): return ELEV_Y0 + (2.5 - m_z) * ELEV_H_SCALE # z=0 di bawah, z=2.5 di atas

elements = spec["elements"]
standees = spec["standee_rows"]

svg = []
svg.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}" width="100%" height="100%" style="background:#ffffff; font-family:'Segoe UI', -apple-system, Arial, sans-serif;">
<defs>
  <!-- Grid halus -->
  <pattern id="grid-fine" width="24" height="24" patternUnits="userSpaceOnUse">
    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#f1f5f9" stroke-width="0.7"/>
  </pattern>
  <!-- Simbol Ukuran Tick 45 deg -->
  <marker id="tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <line x1="2" y1="8" x2="8" y2="2" stroke="#0f172a" stroke-width="1.8"/>
  </marker>
  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 1 2 L 8 5 L 1 8 z" fill="#0f172a"/>
  </marker>
</defs>

<!-- Background Frame Lembar Gambar -->
<rect width="{CANVAS_W}" height="{CANVAS_H}" fill="#ffffff"/>
<rect x="25" y="25" width="{CANVAS_W-50}" height="{CANVAS_H-50}" fill="none" stroke="#0f172a" stroke-width="2"/>
<rect x="29" y="29" width="{CANVAS_W-58}" height="{CANVAS_H-58}" fill="none" stroke="#cbd5e1" stroke-width="0.8"/>

<!-- ========================================================================= -->
<!-- HEADER GAMBAR TEKNIK                                                      -->
<!-- ========================================================================= -->
<g id="header-sheet">
  <text x="60" y="62" font-size="20" font-weight="800" fill="#0f172a" letter-spacing="0.5">GAMBAR KERJA TEKNIK PRODUKSI: BOOTH CHITATO × JETZ</text>
  <text x="60" y="82" font-size="12" font-weight="600" fill="#64748b">SKALA DENAH 1:50 | ELEVASI 1:50 | SATUAN: MILIMETER (mm) | TOTAL MODUL: 30.000 × 4.000 × 2.450 mm</text>
  <rect x="{CANVAS_W-380}" y="42" width="320" height="42" fill="#f8fafc" stroke="#e2e8f0" rx="4"/>
  <text x="{CANVAS_W-365}" y="60" font-size="11" font-weight="700" fill="#0f172a">STATUS DOKUMEN : GAMTEK PRODUKSI v0.1</text>
  <text x="{CANVAS_W-365}" y="76" font-size="10" font-weight="600" fill="#ea580c">SUMBER: spec/booth.spec.json (TERKUNCI)</text>
</g>

<!-- ========================================================================= -->
<!-- BAGIAN 1: DENAH TATA LETAK BOOTH (TOP VIEW)                              -->
<!-- ========================================================================= -->
<g id="section-plan">
  <!-- Judul Section -->
  <rect x="60" y="102" width="220" height="24" fill="#0f172a" rx="2"/>
  <text x="70" y="118" font-size="11" font-weight="700" fill="#ffffff">01. DENAH TATA LETAK BOOTH (TOP VIEW)</text>
  
  <!-- Base Lantai Booth 30 x 4 meter -->
  <rect x="{px(0)}" y="{py(4)}" width="{30*SCALE_X}" height="{4*SCALE_Y}" fill="#fafaf9" stroke="#94a3b8" stroke-width="1.5"/>
  
  <!-- Lantai Zona A (Chitato) & Zona B (JetZ) -->
  <rect x="{px(0)}" y="{py(4)}" width="{15*SCALE_X}" height="{4*SCALE_Y}" fill="#fff7ed" stroke="none" opacity="0.6"/>
  <rect x="{px(15)}" y="{py(4)}" width="{15*SCALE_X}" height="{4*SCALE_Y}" fill="#f0f9ff" stroke="none" opacity="0.6"/>
  
  <!-- Pembatas Tengah x=15m (Locker Divider) -->
  <line x1="{px(15)}" y1="{py(4)+15}" x2="{px(15)}" y2="{py(0)-15}" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="{px(15)}" y="{py(4)+28}" font-size="10" font-weight="800" fill="#dc2626" text-anchor="middle">AS PEMISAH ZONA (x = 15.000 mm)</text>

  <!-- Label Zona A & B -->
  <text x="{px(7.5)}" y="{py(3.8)}" font-size="13" font-weight="800" fill="#c2410c" text-anchor="middle">ZONA A: CHITATO × TREASURE (15.000 × 4.000 mm)</text>
  <text x="{px(22.5)}" y="{py(3.8)}" font-size="13" font-weight="800" fill="#0284c7" text-anchor="middle">ZONA B: JETZ × HEARTS2HEARTS (15.000 × 4.000 mm)</text>

  <!-- Penanda Sisi Muka & Belakang -->
  <text x="{px(15)}" y="{py(4.15)}" font-size="10" font-weight="700" fill="#475569" text-anchor="middle">▲ DINDING BELAKANG BOOTH (SISI SELATAN / BACKDROP FULL BRANDING) ▲</text>
  <text x="{px(15)}" y="{py(-0.15)}" font-size="10" font-weight="700" fill="#0f172a" text-anchor="middle">▼ MUKA DEPAN PENGUNJUNG / AKSES MASUK UTAMA (SISI UTARA) ▼</text>
''')

# Render Elemen-elemen di Denah Top View
for el in elements:
    x, y, z = el["pos"]
    sx, sy, sz = el["size"]
    tag = el["tag"]
    eid = el["id"]
    shape = el.get("shape", "box")
    dim_st = el.get("dim", "proposed")
    mat = el.get("mat", "")

    # Koordinat Denah
    bx = px(x - sx/2.0)
    by = py(y + sy/2.0)
    bw = sx * SCALE_X
    bh = sy * SCALE_Y

    # Warna & Gaya Garis
    stroke_w = "2.2" if dim_st == "given" else ("1.8" if dim_st == "assumed" else "1.5")
    stroke_c = "#0f172a" if dim_st == "given" else ("#ea580c" if dim_st == "assumed" else "#2563eb")
    dash = 'stroke-dasharray="5,3"' if dim_st == "assumed" else ""

    fill_c = "#ffffff"
    if "chitato_orange" in mat: fill_c = "#fed7aa"
    elif "lite_green" in mat: fill_c = "#bbf7d0"
    elif "chitato_yellow" in mat: fill_c = "#fef08a"
    elif "jetz_blue" in mat: fill_c = "#bae6fd"
    elif "jetz_pink" in mat: fill_c = "#fbcfe8"
    elif "locker" in mat: fill_c = "#e2e8f0"
    elif "wood" in mat: fill_c = "#fde68a"

    if shape == "cylinder":
        cx = px(x)
        cy = py(y)
        rx = (sx/2.0) * SCALE_X
        ry = (sy/2.0) * SCALE_Y
        svg.append(f'''
    <g id="plan-{eid}">
      <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill_c}" stroke="{stroke_c}" stroke-width="{stroke_w}" {dash}/>
      <text x="{cx}" y="{cy+3.5}" font-size="8.5" font-weight="800" fill="#0f172a" text-anchor="middle">{tag}</text>
    </g>''')
    else:
        svg.append(f'''
    <g id="plan-{eid}">
      <rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="{fill_c}" stroke="{stroke_c}" stroke-width="{stroke_w}" {dash} rx="1.5"/>
      <text x="{bx + bw/2}" y="{by + bh/2 + 3.5}" font-size="8.5" font-weight="800" fill="#0f172a" text-anchor="middle">{tag}</text>
    </g>''')

# Render Standee di Denah
for row in standees:
    rid = row["id"]
    tag = row["tag"]
    x0, ry, pitch = row["x0"], row["y"], row["pitch"]
    bw, bd = row["base"]
    for i, it in enumerate(row["items"]):
        cx = x0 + i * pitch
        bx = px(cx - bw/2.0)
        by = py(ry + bd/2.0)
        bw_px = bw * SCALE_X
        bh_px = bd * SCALE_Y
        svg.append(f'''
    <g id="plan-std-{rid}-{i}">
      <rect x="{bx}" y="{by}" width="{bw_px}" height="{bh_px}" fill="#ffffff" stroke="#0f172a" stroke-width="1.2" rx="1"/>
      <line x1="{bx}" y1="{by+bh_px/2}" x2="{bx+bw_px}" y2="{by+bh_px/2}" stroke="#0f172a" stroke-width="1"/>
      <text x="{bx+bw_px/2}" y="{by-3}" font-size="7" font-weight="700" fill="#334155" text-anchor="middle">{it["name"].split()[0]}</text>
    </g>''')

# Garis Dimensi Utama Denah
def dim_h(x1, x2, y_m, txt, offset_y=-18):
    sx1 = px(x1)
    sx2 = px(x2)
    sy = py(y_m) + offset_y
    svg.append(f'''
    <line x1="{sx1}" y1="{sy}" x2="{sx2}" y2="{sy}" stroke="#0f172a" stroke-width="1.2" marker-start="url(#tick)" marker-end="url(#tick)"/>
    <line x1="{sx1}" y1="{py(y_m)}" x2="{sx1}" y2="{sy-3}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2"/>
    <line x1="{sx2}" y1="{py(y_m)}" x2="{sx2}" y2="{sy-3}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2"/>
    <text x="{(sx1+sx2)/2}" y="{sy-4}" font-size="9" font-weight="700" fill="#0f172a" text-anchor="middle">{txt}</text>''')

def dim_v(y1, y2, x_m, txt, offset_x=-25):
    sy1 = py(y1)
    sy2 = py(y2)
    sx = px(x_m) + offset_x
    svg.append(f'''
    <line x1="{sx}" y1="{sy1}" x2="{sx}" y2="{sy2}" stroke="#0f172a" stroke-width="1.2" marker-start="url(#tick)" marker-end="url(#tick)"/>
    <line x1="{px(x_m)}" y1="{sy1}" x2="{sx-3}" y2="{sy1}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2"/>
    <line x1="{px(x_m)}" y1="{sy2}" x2="{sx-3}" y2="{sy2}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2"/>
    <text x="{sx-5}" y="{(sy1+sy2)/2+3}" font-size="9" font-weight="700" fill="#0f172a" text-anchor="end">{txt}</text>''')

dim_h(0, 30, 4.0, "PANJANG TOTAL BOOTH: 30.000 mm", offset_y=-38)
dim_h(0, 15, 4.0, "MODUL CHITATO: 15.000 mm", offset_y=-20)
dim_h(15, 30, 4.0, "MODUL JETZ: 15.000 mm", offset_y=-20)
dim_v(0, 4, 0.0, "LEBAR: 4.000 mm", offset_x=-30)
dim_h(12.605, 13.995, 3.25, "LORONG A: 1.390 mm", offset_y=-12)
dim_h(26.705, 28.195, 3.25, "LORONG B: 1.490 mm", offset_y=-12)

svg.append('</g>')

# =========================================================================
# BAGIAN 2: TAMPAK DEPAN BOOTH (FRONT ELEVATION / T-04)
# =========================================================================
svg.append(f'''
<g id="section-elevation">
  <!-- Judul Section -->
  <rect x="60" y="380" width="260" height="24" fill="#0f172a" rx="2"/>
  <text x="70" y="396" font-size="11" font-weight="700" fill="#ffffff">02. TAMPAK DEPAN BOOTH (FRONT ELEVATION)</text>
  <text x="330" y="396" font-size="11" font-weight="600" fill="#64748b">Dilihat dari muka depan pengunjung (Utara menghadap Selatan)</text>

  <!-- Garis Dasar Lantai (Level ±0.000) -->
  <line x1="{ex(0)-20}" y1="{ey(0)}" x2="{ex(30)+20}" y2="{ey(0)}" stroke="#0f172a" stroke-width="2.5"/>
  <text x="{ex(0)-25}" y="{ey(0)+4}" font-size="9" font-weight="700" fill="#0f172a" text-anchor="end">FL ±0.000</text>

  <!-- Garis Batas Ketinggian Maksimum Gedung (2.500 mm) -->
  <line x1="{ex(0)-20}" y1="{ey(2.5)}" x2="{ex(30)+20}" y2="{ey(2.5)}" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="{ex(30)+25}" y="{ey(2.5)+4}" font-size="9" font-weight="800" fill="#dc2626">BATAS TINGGI MAKS: +2.500 mm</text>

  <!-- Garis As Pemisah x=15m -->
  <line x1="{ex(15)}" y1="{ey(0)+10}" x2="{ex(15)}" y2="{ey(2.5)-10}" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="6,3"/>
''')

# Render Elemen di Tampak Depan (Front Elevation)
# Urutkan berdasarkan posisi y (terjauh dulu / y kecil ke y besar) agar tidak salah tumpuk
sorted_elev = sorted(elements, key=lambda e: e["pos"][1])

for el in sorted_elev:
    x, y, z = el["pos"]
    sx, sy, sz = el["size"]
    tag = el["tag"]
    eid = el["id"]
    mat = el.get("mat", "")
    dim_st = el.get("dim", "proposed")

    ex_left = ex(x - sx/2.0)
    ey_top = ey(z + sz)
    ew_px = sx * SCALE_X
    eh_px = sz * ELEV_H_SCALE

    fill_c = "#ffffff"
    if "chitato_orange" in mat: fill_c = "#f97316"
    elif "lite_green" in mat: fill_c = "#22c55e"
    elif "chitato_yellow" in mat: fill_c = "#eab308"
    elif "jetz_blue" in mat: fill_c = "#0284c7"
    elif "jetz_pink" in mat: fill_c = "#ec4899"
    elif "locker" in mat: fill_c = "#cbd5e1"
    elif "led_screen" in mat: fill_c = "#1e293b"
    elif "wave_mix" in mat: fill_c = "#fdba74"
    elif "wood" in mat: fill_c = "#fde047"

    stroke_c = "#0f172a"
    dash = 'stroke-dasharray="4,2"' if dim_st == "assumed" else ""

    # Spesial render untuk Arch "Find Your Wave" (A07)
    if "ARCH" in eid:
        svg.append(f'''
    <!-- Arch A07 -->
    <path d="M {ex_left} {ey(0)} L {ex_left} {ey(1.5)} A {ew_px/2} {ew_px/2} 0 0 1 {ex_left+ew_px} {ey(1.5)} L {ex_left+ew_px} {ey(0)} Z" 
          fill="#f97316" stroke="#0f172a" stroke-width="1.8"/>
        ''')
    elif "DESK" in eid:
        # Event Desk dengan Header
        ch_h = 1.0 * ELEV_H_SCALE
        svg.append(f'''
    <!-- Counter Kasir -->
    <rect x="{ex_left}" y="{ey(1.0)}" width="{ew_px}" height="{ch_h}" fill="{fill_c}" stroke="#0f172a" stroke-width="1.8"/>
    <!-- Tiang & Header Desk -->
    <line x1="{ex_left+5}" y1="{ey(1.0)}" x2="{ex_left+5}" y2="{ey_top+18}" stroke="#475569" stroke-width="2"/>
    <line x1="{ex_left+ew_px-5}" y1="{ey(1.0)}" x2="{ex_left+ew_px-5}" y2="{ey_top+18}" stroke="#475569" stroke-width="2"/>
    <rect x="{ex_left}" y="{ey_top}" width="{ew_px}" height="{18}" fill="{fill_c}" stroke="#0f172a" stroke-width="1.5"/>
    <text x="{ex_left+ew_px/2}" y="{ey(0.5)+3}" font-size="8" font-weight="700" fill="#ffffff" text-anchor="middle">KASIR {tag}</text>
        ''')
    else:
        svg.append(f'''
    <rect x="{ex_left}" y="{ey_top}" width="{ew_px}" height="{eh_px}" fill="{fill_c}" stroke="{stroke_c}" stroke-width="1.2" {dash} opacity="0.95"/>
    <text x="{ex_left+ew_px/2}" y="{ey_top+eh_px/2+3}" font-size="8" font-weight="800" fill="#ffffff" text-anchor="middle">{tag}</text>
        ''')

# Render Standee di Tampak Depan
for row in standees:
    x0, ry, pitch = row["x0"], row["y"], row["pitch"]
    bw, bd = row["base"]
    h = row["height"]
    h_px = h * ELEV_H_SCALE
    for i, it in enumerate(row["items"]):
        cx = x0 + i * pitch
        bx = ex(cx - bw/2.0)
        bw_px = bw * SCALE_X
        by = ey(h)
        svg.append(f'''
    <!-- Standee {it["name"]} -->
    <rect x="{bx}" y="{by}" width="{bw_px}" height="{h_px}" fill="#ffffff" stroke="#0f172a" stroke-width="1.2" rx="4"/>
    <circle cx="{bx+bw_px/2}" cy="{by+12}" r="7" fill="#e2e8f0" stroke="#0f172a" stroke-width="1"/>
    <text x="{bx+bw_px/2}" y="{by+h_px/2}" font-size="6.5" font-weight="700" fill="#0f172a" text-anchor="middle">{it["name"].split()[0]}</text>
    <rect x="{bx}" y="{ey(0.04)}" width="{bw_px}" height="{0.04*ELEV_H_SCALE}" fill="#0f172a"/>
        ''')

# Garis Dimensi Ketinggian Tampak
def dim_elev(z_val, label, x_offset=15):
    sz = ey(z_val)
    sx = ex(30) + x_offset
    svg.append(f'''
    <line x1="{ex(30)}" y1="{sz}" x2="{sx+40}" y2="{sz}" stroke="#64748b" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="{sx+45}" y="{sz+3}" font-size="9" font-weight="700" fill="#0f172a">+{int(z_val*1000)} mm ({label})</text>
    ''')

dim_elev(2.45, "A-ARCH (PUNCAK)")
dim_elev(2.40, "DINDING BACKDROP & LOCKER")
dim_elev(2.00, "HEADER KASIR & ROLLUP")
dim_elev(1.80, "STANDEE TREASURE")
dim_elev(1.65, "STANDEE H2H")
dim_elev(0.78, "MEJA CHARM DIY")

svg.append('</g>')

# =========================================================================
# BAGIAN 3: LEGENDA & DAFTAR KOMPONEN LENGKAP (BILL OF ITEMS)
# =========================================================================
LEG_Y = 620

svg.append(f'''
<g id="section-legend">
  <!-- Judul Section -->
  <rect x="60" y="{LEG_Y}" width="420" height="24" fill="#0f172a" rx="2"/>
  <text x="70" y="{LEG_Y+16}" font-size="11" font-weight="700" fill="#ffffff">03. LEGENDA &amp; DAFTAR RINCIAN MODUL BOOTH (ZONA A &amp; ZONA B)</text>
  
  <!-- KOTAK ZONA A (CHITATO) -->
  <rect x="60" y="{LEG_Y+35}" width="700" height="390" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.5" rx="4"/>
  <rect x="60" y="{LEG_Y+35}" width="700" height="24" fill="#ea580c" rx="4 4 0 0"/>
  <text x="75" y="{LEG_Y+52}" font-size="11" font-weight="800" fill="#ffffff">ZONA A: CHITATO × TREASURE (KOMPONEN &amp; ELEMEN)</text>

  <!-- KOTAK ZONA B (JETZ) -->
  <rect x="780" y="{LEG_Y+35}" width="760" height="390" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.5" rx="4"/>
  <rect x="780" y="{LEG_Y+35}" width="760" height="24" fill="#0284c7" rx="4 4 0 0"/>
  <text x="795" y="{LEG_Y+52}" font-size="11" font-weight="800" fill="#ffffff">ZONA B: JETZ × HEARTS2HEARTS (KOMPONEN &amp; ELEMEN)</text>
''')

# Isi Tabel Rincian Zona A
items_a = [
    ("A01", "Dinding Belakang 3 Bagian", "15.000 × 200 × 2.400 mm", "Oranye Wavy (4.5m) + Hijau Lite (3.5m) + Ombak Graphic (7m)"),
    ("A02", "Standee TREASURE (9 Member)", "Base 700×400 mm, Tinggi 1.800 mm", "Urutan resmi: Hyunsuk, Junkyu, Junghwan, Yoshi, Jaehyun, Haruto, Doyoung, Jeongwoo, Jihoon"),
    ("A03", "Sign Header Gantung", "4.000 × 100 × 500 mm", "Tulisan akrilik: 'CHITATO × CHITATO LITE × TREASURE' di atas standee"),
    ("A04", "Kursi Keripik (Chip Chair ×2)", "900 × 900 × 1.300 mm", "Properti foto ikonik bentuk keripik kentang bergelombang (Wavy & Lite)"),
    ("A05", "Pouffe Bulat Duduk (×4)", "Ø 550 × Tinggi 400 mm", "Dudukan santai pengunjung (2 di area foto, 2 di area nonton game)"),
    ("A06", "Totem Snack Pack (×2)", "730 × 300 × 950 mm", "Totem replika pack Chitato Rasa Sapi Panggang & Chitato Lite"),
    ("A07", "Arch 'Find Your Wave' + LED", "2.400 × 500 × 2.450 mm", "Gate lengkung interaktif + Layar LED Portrait 65 inci (0.81×1.44m) + Kamera"),
    ("A08", "Plinth Display Tas Eksklusif", "Ø 600 × Tinggi 900 mm", "Meja silinder display merchandise tas (3 varian warna: hitam, kuning, biru)"),
    ("A09", "Event Desk Kasir (POSM)", "2.000 × 1.000 × 2.000 mm", "Meja kasir 2 staf + integrasi mesin EDC / QRIS mandiri + papan header"),
    ("A10", "Rak Stok Harian Belakang", "900 × 500 × 1.800 mm", "Tempat transit 360 paket harian sebelum diisi ulang dari B1"),
    ("A11", "Flexy Rack Chitato (×2)", "610 × 500 × 1.300 mm", "Rak display produk snack sekaligus pembatas jalur antrean kasir (1.390 mm)"),
    ("A12", "Roll-Up Banner Berdiri", "800 × 100 × 2.000 mm", "Informasi paket bundling Rp35.000 (isi 5 pack + free tas eksklusif)"),
]

row_y = LEG_Y + 70
for tag, name, dim, desc in items_a:
    svg.append(f'''
  <g class="item-row">
    <rect x="75" y="{row_y-10}" width="34" height="16" fill="#ea580c" rx="2"/>
    <text x="92" y="{row_y+2}" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">{tag}</text>
    <text x="118" y="{row_y+2}" font-size="9.5" font-weight="700" fill="#0f172a">{name}</text>
    <text x="320" y="{row_y+2}" font-size="9" font-weight="600" fill="#475569">{dim}</text>
    <text x="118" y="{row_y+14}" font-size="8" fill="#64748b">{desc}</text>
  </g>''')
    row_y += 26

# Isi Tabel Rincian Zona B
items_b = [
    ("B01", "Divider Locker Pembatas", "400 × 4.000 × 2.400 mm", "5 modul locker pembatas zona (Sisi JetZ = pintu locker, sisi Chitato = panel rata)"),
    ("B02", "Dinding Belakang Kelas", "14.600 × 200 × 2.400 mm", "Backdrop tema ruang sekolah (cat biru muda + aksen pink + grafis papan tulis)"),
    ("B03", "Locker Set B (Photo Backdrop)", "4.800 × 400 × 2.400 mm", "Backdrop foto utama deretan locker sekolah warna biru-pink pastel"),
    ("B04", "Standee Hearts2Hearts (8 Member)", "Base 500×400 mm, Tinggi 1.650 mm", "Ian, Jiwoo, Carmen, Ye-on, Juun, Yuha, A-na, Stella (dikelompokkan per rasa)"),
    ("B05", "Signage Varian Snack (×3)", "1.400 / 1.100 × 50 × 500 mm", "Papan nama rasa: Sweet Stick, Tortilla, dan Croissant di atas standee"),
    ("B06", "Meja & Kursi Sekolah (×2 Set)", "900 × 900 × 900 mm", "Properti foto interaktif bergaya ruang kelas + display produk di meja"),
    ("B07", "Main Stage 'Gesrek Challenge'", "2.000 × 1.500 × 2.000 mm", "Panggung mini platform t=500mm + backdrop lengkung headphone + speaker dekoratif"),
    ("B08", "Meja Charm Making (DIY)", "2.400 × 900 × 780 mm", "WAJIB: Meja workshop menghias gantungan tas ransel belanjaan pembeli paket"),
    ("B09", "Stool Bangku Duduk (×4)", "Ø 350 × Tinggi 450 mm", "4 bangku bulat untuk peserta workshop charm making"),
    ("B10", "Event Desk Kasir JetZ", "2.000 × 1.000 × 2.000 mm", "Meja transaksi 2 kasir + meja repack tas ransel di belakangnya"),
    ("B11", "Rak Stok Harian Belakang", "900 × 500 × 1.800 mm", "Stok paket JetZ Rp35.000 + tas ransel backpack bonus"),
    ("B12", "Flexy Rack JetZ (×2)", "610 × 500 × 1.300 mm", "Rak display produk snack + pembatas antrean pembeli (lebar lorong 1.490 mm)"),
    ("B13", "Roll-Up Banner Berdiri", "800 × 100 × 2.000 mm", "Promo coret: Paket JetZ Rp35.000 (Normal Rp50.000) isi 6 pack + free backpack"),
]

row_y = LEG_Y + 70
for tag, name, dim, desc in items_b:
    svg.append(f'''
  <g class="item-row">
    <rect x="795" y="{row_y-10}" width="34" height="16" fill="#0284c7" rx="2"/>
    <text x="812" y="{row_y+2}" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">{tag}</text>
    <text x="838" y="{row_y+2}" font-size="9.5" font-weight="700" fill="#0f172a">{name}</text>
    <text x="1050" y="{row_y+2}" font-size="9" font-weight="600" fill="#475569">{dim}</text>
    <text x="838" y="{row_y+14}" font-size="8" fill="#64748b">{desc}</text>
  </g>''')
    row_y += 26

svg.append('</g>')

# Footer Title Block
svg.append(f'''
<!-- Title Block Lembar Gambar -->
<rect x="{CANVAS_W-420}" y="{CANVAS_H-75}" width="360" height="42" fill="#0f172a" rx="4"/>
<text x="{CANVAS_W-405}" y="{CANVAS_H-52}" font-size="10" font-weight="800" fill="#ffffff">LEMBAR GAMBAR: T-01 &amp; T-04 (DENAH + TAMPAK + LEGENDA)</text>
<text x="{CANVAS_W-405}" y="{CANVAS_H-40}" font-size="8.5" font-weight="600" fill="#94a3b8">PROYEK: CHITATO × JETZ BOOTH ACTIVATION | PT INDOFOOD FORTUNA MAKMUR</text>
</svg>
''')

svg_content = "\n".join(svg)

# Simpan SVG
with open(OUT_SVG, "w", encoding="utf-8") as f:
    f.write(svg_content)

# Simpan HTML Viewer
html_content = f'''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Gambar Teknik Detail Booth Chitato × JetZ</title>
  <style>
    body {{
      margin: 0;
      padding: 24px;
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .header-bar {{
      max-width: 1500px;
      width: 100%;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    h1 {{ margin: 0; font-size: 22px; font-weight: 800; }}
    .badge {{
      background: #2563eb;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }}
    .canvas-card {{
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.6);
      padding: 12px;
      max-width: 1500px;
      width: 100%;
      overflow-x: auto;
    }}
    .footer-notes {{
      margin-top: 18px;
      max-width: 1500px;
      width: 100%;
      background: #1e293b;
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
    }}
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <h1>📐 Gambar Teknik (Gamtek) Spesifik Booth Chitato × JetZ</h1>
      <span style="font-size:13px; color:#94a3b8;">Fokus 100% pada fisik &amp; isi booth (30.000 × 4.000 mm) tanpa gangguan elemen luar</span>
    </div>
    <div class="badge">LEMBAR TEKNIK A2/A3</div>
  </div>

  <div class="canvas-card">
    {svg_content}
  </div>

  <div class="footer-notes">
    📌 <b>Cara Baca Gambar Teknik Ini:</b><br>
    1. <b>Bagian 01 (Denah Top View):</b> Menunjukkan letak tepat semua modul dari atas, jarak lorong kasir, posisi standee, dan batas zona di x = 15 meter.<br>
    2. <b>Bagian 02 (Tampak Depan / Elevation):</b> Menampilkan profil tinggi tiap modul terhadap batas maksimal gedung (+2.500 mm). Arch tertinggi berada di +2.450 mm.<br>
    3. <b>Bagian 03 (Legenda Modul):</b> Memuat kode tag resmi (A01–A12 untuk Chitato dan B01–B13 untuk JetZ), ukuran presisi dalam milimeter, serta peruntukan fungsinya di lapangan.
  </div>
</body>
</html>
'''

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"✅ Gamtek Detail Booth (SVG) berhasil dibuat: {OUT_SVG}")
print(f"✅ Gamtek Detail Booth (HTML) berhasil dibuat: {OUT_HTML}")
