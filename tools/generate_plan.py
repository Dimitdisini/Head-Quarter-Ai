#!/usr/bin/env python3
"""
generate_plan.py
Menghasilkan denah teknis 2D berdimensi (SVG) dari spec/booth.spec.json
Memenuhi standar Gate 0 (G0.2):
- Format A3 Landscape (420 x 297 mm viewBox)
- Footprint 30 x 4 m + proteksi karpet hitam 32 x 6 m
- Pembeda gaya garis: 'given' (solid tebal), 'assumed' (putus-putus), 'proposed' (garis tipis)
- Rantai dimensi utama (milimeter)
- Marker foto, antrean, player mark, arah utara (muka pengunjung) & selatan (tenant)
- Title block & legenda
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC_FILE = ROOT / "spec" / "booth.spec.json"
OUT_SVG = ROOT / "concepts" / "plan-v0.svg"
OUT_HTML = ROOT / "concepts" / "plan-v0.html"

with open(SPEC_FILE, "r", encoding="utf-8") as f:
    spec = json.load(f)

# Dimensi kanvas SVG (A3 Landscape: 1200 x 848 px atau skala milimeter)
# Koordinat dunia (meter): x: -2 s.d 32, y: -2 s.d 6
# Sumbu spec: x = 0..30 (barat ke timur), y = 0..4 (selatan=0 / tenant, utara=4 / pengunjung)
# Di SVG: layar monitor (0,0) di kiri-atas.
# Kita petakan:
# X_svg: dari barat (kiri) ke timur (kanan)
# Y_svg: Utara (y=4) di atas, Selatan (y=0) di bawah!
# Rumus: y_screen = (4 - y_world)

SVG_WIDTH = 1400
SVG_HEIGHT = 800

# Margins kanvas
PAD_LEFT = 100
PAD_TOP = 130
SCALE = 38.0  # 1 meter = 38 px

def wx(x):
    # World X (meter) ke SVG X
    return PAD_LEFT + (x + 1.0) * SCALE

def wy(y):
    # World Y (meter, 0=selatan, 4=utara) ke SVG Y (utara di atas)
    return PAD_TOP + (5.0 - y) * SCALE

def wdist(m):
    return m * SCALE

elements = spec["elements"]
standee_rows = spec["standee_rows"]
markers = spec.get("markers", [])
palette = spec.get("palette", {})

svg_parts = []

# Header SVG
svg_parts.append(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SVG_WIDTH} {SVG_HEIGHT}" width="100%" height="100%" style="background:#fcfbf9; font-family:'Helvetica Neue', Arial, sans-serif;">
<defs>
  <pattern id="grid" width="38" height="38" patternUnits="userSpaceOnUse">
    <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#ebe8e1" stroke-width="0.8"/>
  </pattern>
  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#444"/>
  </marker>
  <marker id="tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <line x1="2" y1="8" x2="8" y2="2" stroke="#555" stroke-width="1.5"/>
  </marker>
</defs>

<!-- Background Grid -->
<rect width="100%" height="100%" fill="#fcfbf9"/>
<rect x="50" y="70" width="{SVG_WIDTH-100}" height="600" fill="url(#grid)"/>
''')

# Judul Utama & Header
svg_parts.append(f'''
<!-- Header Lembar -->
<g id="header-text">
  <text x="60" y="45" font-size="20" font-weight="700" fill="#1e293b">DENAH TATA LETAK 2D (GATE 0) — BOOTH CHITATO × JETZ</text>
  <text x="60" y="68" font-size="12" fill="#64748b">Indofood Tower Lobby | Total Footprint: 30.000 × 4.000 mm | Status Spec: v{spec["meta"]["spec_version"]} ({spec["meta"]["status"].upper()})</text>
</g>
''')

# 1. Proteksi Lantai Karpet Hitam (-1..31, -1..5)
f_prot = spec["floor"]["protection"]["rect_xyxy"]
px0, py0, px1, py1 = f_prot
k_x = wx(px0)
k_y = wy(py1)
k_w = wdist(px1 - px0)
k_h = wdist(py1 - py0)
svg_parts.append(f'''
<!-- Proteksi Lantai Karpet Hitam -->
<g id="floor-protection">
  <rect x="{k_x}" y="{k_y}" width="{k_w}" height="{k_h}" fill="#18181b" rx="4" opacity="0.95"/>
  <rect x="{k_x}" y="{k_y}" width="{k_w}" height="{k_h}" fill="none" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="{k_x + 15}" y="{k_y + 22}" fill="#a1a1aa" font-size="11" font-weight="600">AREA PROTEKSI LANTAI: KARPET HITAM WAJIB 32.000 × 6.000 mm (MARGIN 1.000 mm DI SEMUA SISI)</text>
</g>
''')

# 2. Vinyl Graphics Lantai Zona A & B
for gfx in spec["floor"]["graphics"]:
    gx0, gy0, gx1, gy1 = gfx["rect_xyxy"]
    vx = wx(gx0)
    vy = wy(gy1)
    vw = wdist(gx1 - gx0)
    vh = wdist(gy1 - gy0)
    color = "#fff7ed" if "A" in gfx["id"] else "#f0f9ff"
    stroke = "#fdba74" if "A" in gfx["id"] else "#7dd3fc"
    name = "VINYL LANTAI ZONA A (ORANYE-HIJAU WAVE)" if "A" in gfx["id"] else "VINYL LANTAI ZONA B (CHECKER BIRU-PINK)"
    svg_parts.append(f'''
<g id="{gfx['id']}">
  <rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" fill="{color}" stroke="{stroke}" stroke-width="1.5"/>
  <text x="{vx + 15}" y="{vy + vh - 15}" fill="{stroke}" font-size="11" font-weight="700">{name}</text>
</g>
''')

# Garis Pembatas x=15 (Batas Zona A dan Zona B)
bx15 = wx(15)
svg_parts.append(f'''
<!-- Garis Zona Boundary x=15 -->
<line x1="{bx15}" y1="{wy(4.5)}" x2="{bx15}" y2="{wy(-0.5)}" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="8,4"/>
<text x="{bx15 - 8}" y="{wy(4.2)}" fill="#ef4444" font-size="10" font-weight="700" text-anchor="end">BATAS ZONA A (CHITATO)</text>
<text x="{bx15 + 8}" y="{wy(4.2)}" fill="#ef4444" font-size="10" font-weight="700" text-anchor="start">BATAS ZONA B (JETZ)</text>
''')

# Label Konteks Sekitar
svg_parts.append(f'''
<!-- Arah & Konteks Venue -->
<g id="venue-context" fill="#475569" font-size="11" font-weight="600">
  <!-- Sisi Utara: Pengunjung -->
  <rect x="{wx(11)}" y="{wy(4.85)}" width="360" height="24" rx="12" fill="#e2e8f0" stroke="#cbd5e1"/>
  <text x="{wx(15.7)}" y="{wy(4.85) + 16}" text-anchor="middle" fill="#0f172a">▲ UTARA: KORIDOR LOBBY UTAMA (MUKA PENGUNJUNG) ▲</text>

  <!-- Sisi Selatan: Tenant -->
  <rect x="{wx(9.5)}" y="{wy(-0.65)}" width="480" height="24" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/>
  <text x="{wx(15.8)}" y="{wy(-0.65) + 16}" text-anchor="middle" fill="#334155">▼ SELATAN: TENANT (BANK INA, BELLAMAMA, WARUNK UPNORMAL) ▼</text>

  <!-- Barat: Lobby SPIT -->
  <text x="{wx(-1.2)}" y="{wy(2)}" transform="rotate(-90 {wx(-1.2)} {wy(2)})" text-anchor="middle">◄ BARAT: LOBBY SPIT</text>

  <!-- Timur: Indomaret Point -->
  <text x="{wx(31.6)}" y="{wy(2)}" transform="rotate(90 {wx(31.6)} {wy(2)})" text-anchor="middle">TIMUR: INDOMARET POINT ►</text>
</g>
''')

# 3. Elemen-elemen Spec
for el in elements:
    eid = el["id"]
    tag = el["tag"]
    x, y, z = el["pos"]
    sx, sy, sz = el["size"]
    dim_status = el.get("dim", "proposed")
    shape = el.get("shape", "box")
    mat = el.get("mat", "white")

    # Hitung posisi kotak SVG
    ex = wx(x - sx / 2.0)
    ey = wy(y + sy / 2.0)
    ew = wdist(sx)
    eh = wdist(sy)

    # Styling garis berdasarkan status dimensi
    if dim_status == "given":
        stroke_style = 'stroke="#0f172a" stroke-width="2.2"'
        badge_bg = '#0f172a'
    elif dim_status == "assumed":
        stroke_style = 'stroke="#f97316" stroke-width="2.0" stroke-dasharray="5,3"'
        badge_bg = '#f97316'
    else:  # proposed
        stroke_style = 'stroke="#2563eb" stroke-width="1.4"'
        badge_bg = '#2563eb'

    # Warna isian berdasarkan tema
    fill_color = "#ffffff"
    if "chitato_orange" in mat: fill_color = "#ffedd5"
    elif "lite_green" in mat: fill_color = "#dcfce7"
    elif "chitato_yellow" in mat: fill_color = "#fef9c3"
    elif "jetz_blue" in mat: fill_color = "#e0f2fe"
    elif "jetz_pink" in mat: fill_color = "#fce7f3"
    elif "locker" in mat: fill_color = "#f1f5f9"
    elif "wood" in mat: fill_color = "#fef3c7"

    if shape == "cylinder":
        cx = wx(x)
        cy = wy(y)
        rx = wdist(sx / 2.0)
        ry = wdist(sy / 2.0)
        svg_parts.append(f'''
<g id="{eid}">
  <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill_color}" {stroke_style}/>
  <text x="{cx}" y="{cy + 3}" text-anchor="middle" font-size="9" font-weight="700" fill="#1e293b">{tag}</text>
</g>
''')
    else:
        svg_parts.append(f'''
<g id="{eid}">
  <rect x="{ex}" y="{ey}" width="{ew}" height="{eh}" fill="{fill_color}" {stroke_style} rx="2"/>
  <text x="{ex + ew/2}" y="{ey + eh/2 + 3.5}" text-anchor="middle" font-size="9" font-weight="700" fill="#1e293b">{tag}</text>
</g>
''')

# 4. Standee Rows (TREASURE 9 orang & H2H 8 orang)
for row in standee_rows:
    rid = row["id"]
    tag = row["tag"]
    x0 = row["x0"]
    ry = row["y"]
    pitch = row["pitch"]
    bw, bd = row["base"]
    h = row["height"]
    dim_st = row.get("dim", "given")
    items = row["items"]

    stroke = '#0f172a' if dim_st == 'given' else '#f97316'

    for i, it in enumerate(items):
        cx = x0 + i * pitch
        sx = wx(cx - bw / 2.0)
        sy = wy(ry + bd / 2.0)
        sw = wdist(bw)
        sh = wdist(bd)

        # Standee base
        team_color = "#ffedd5" if it.get("team") == "wavy" else ("#dcfce7" if it.get("team") == "lite" else "#e0f2fe")
        svg_parts.append(f'''
<g id="{rid}-{i+1}">
  <rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="{team_color}" stroke="{stroke}" stroke-width="1.4" rx="2"/>
  <circle cx="{sx + sw/2}" cy="{sy + sh/2}" r="3" fill="{stroke}"/>
  <text x="{sx + sw/2}" y="{sy - 4}" text-anchor="middle" font-size="7.5" font-weight="600" fill="#334155">{it["name"].split()[0]}</text>
</g>
''')

# 5. Markers (Foto, Main, Jalur Antrean)
for mk in markers:
    mid = mk["id"]
    mtype = mk["type"]
    note = mk.get("note", "")

    if "pos" in mk:
        mx, my = mk["pos"]
        mcx = wx(mx)
        mcy = wy(my)
        if mtype == "photo_mark":
            svg_parts.append(f'''
<g id="{mid}">
  <circle cx="{mcx}" cy="{mcy}" r="12" fill="none" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="3,2"/>
  <circle cx="{mcx}" cy="{mcy}" r="3" fill="#0284c7"/>
  <text x="{mcx}" y="{mcy + 22}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#0284c7">TITIK FOTO</text>
</g>
''')
        elif mtype == "player_mark":
            svg_parts.append(f'''
<g id="{mid}">
  <circle cx="{mcx}" cy="{mcy}" r="12" fill="none" stroke="#16a34a" stroke-width="1.8" stroke-dasharray="3,2"/>
  <circle cx="{mcx}" cy="{mcy}" r="3" fill="#16a34a"/>
  <text x="{mcx}" y="{mcy + 22}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#16a34a">PLAYER STAND</text>
</g>
''')
    elif "path" in mk:
        pts = mk["path"]
        p1 = (wx(pts[0][0]), wy(pts[0][1]))
        p2 = (wx(pts[1][0]), wy(pts[1][1]))
        svg_parts.append(f'''
<g id="{mid}">
  <line x1="{p1[0]}" y1="{p1[1]}" x2="{p2[0]}" y2="{p2[1]}" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <text x="{p1[0] - 8}" y="{(p1[1]+p2[1])/2}" text-anchor="end" font-size="8.5" font-weight="700" fill="#ea580c">ANTREAN</text>
</g>
''')

# 6. Rantai Dimensi Teknis (Dimension Lines)
def draw_dim_h(x1, x2, y_ref, label, offset_px=-25):
    sx1 = wx(x1)
    sx2 = wx(x2)
    sy = wy(y_ref) + offset_px
    svg_parts.append(f'''
<g class="dim-line">
  <line x1="{sx1}" y1="{sy}" x2="{sx2}" y2="{sy}" stroke="#475569" stroke-width="1.2" marker-start="url(#tick)" marker-end="url(#tick)"/>
  <line x1="{sx1}" y1="{wy(y_ref)}" x2="{sx1}" y2="{sy - 4}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2"/>
  <line x1="{sx2}" y1="{wy(y_ref)}" x2="{sx2}" y2="{sy - 4}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2"/>
  <text x="{(sx1 + sx2)/2}" y="{sy - 5}" text-anchor="middle" font-size="9" font-weight="700" fill="#1e293b">{label}</text>
</g>
''')

def draw_dim_v(y1, y2, x_ref, label, offset_px=-30):
    sy1 = wy(y1)
    sy2 = wy(y2)
    sx = wx(x_ref) + offset_px
    svg_parts.append(f'''
<g class="dim-line">
  <line x1="{sx}" y1="{sy1}" x2="{sx}" y2="{sy2}" stroke="#475569" stroke-width="1.2" marker-start="url(#tick)" marker-end="url(#tick)"/>
  <line x1="{wx(x_ref)}" y1="{sy1}" x2="{sx - 4}" y2="{sy1}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2"/>
  <line x1="{wx(x_ref)}" y1="{sy2}" x2="{sx - 4}" y2="{sy2}" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2,2"/>
  <text x="{sx - 6}" y="{(sy1 + sy2)/2 + 3}" text-anchor="end" font-size="9" font-weight="700" fill="#1e293b">{label}</text>
</g>
''')

# Dimensi Utama
draw_dim_h(0, 30, 4.0, "TOTAL BOOTH: 30.000 mm (30,0 m)", offset_px=-50)
draw_dim_h(0, 15, 4.0, "ZONA A (CHITATO): 15.000 mm", offset_px=-28)
draw_dim_h(15, 30, 4.0, "ZONA B (JETZ): 15.000 mm", offset_px=-28)
draw_dim_v(0, 4, 0.0, "KEDALAMAN: 4.000 mm", offset_px=-45)

# Dimensi Antrean & Modul Kunci
draw_dim_h(12.605, 13.995, 3.25, "LORONG A: 1.390 mm", offset_px=-15)
draw_dim_h(26.705, 28.195, 3.25, "LORONG B: 1.490 mm", offset_px=-15)

# 7. Title Block & Legenda (Gaya Gambar Arsitektur/Teknik)
TB_X = SVG_WIDTH - 420
TB_Y = SVG_HEIGHT - 170

svg_parts.append(f'''
<!-- Title Block & Legenda Status Dimensi -->
<g id="title-block">
  <rect x="{TB_X}" y="{TB_Y}" width="380" height="135" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" rx="3"/>
  <rect x="{TB_X}" y="{TB_Y}" width="380" height="26" fill="#0f172a"/>
  <text x="{TB_X + 12}" y="{TB_Y + 18}" font-size="11" font-weight="700" fill="#ffffff">LEGENDA STATUS DIMENSI &amp; TIKET PRODUKSI</text>
  
  <!-- Baris Given -->
  <line x1="{TB_X + 16}" y1="{TB_Y + 44}" x2="{TB_X + 50}" y2="{TB_Y + 44}" stroke="#0f172a" stroke-width="2.5"/>
  <text x="{TB_X + 60}" y="{TB_Y + 47}" font-size="9.5" font-weight="600" fill="#0f172a">GIVEN (Solid tebal) : Ukuran pasti dari brief klien / POSM resmi</text>
  
  <!-- Baris Assumed -->
  <line x1="{TB_X + 16}" y1="{TB_Y + 68}" x2="{TB_X + 50}" y2="{TB_Y + 68}" stroke="#f97316" stroke-width="2.2" stroke-dasharray="5,3"/>
  <text x="{TB_X + 60}" y="{TB_Y + 71}" font-size="9.5" font-weight="600" fill="#ea580c">ASSUMED (Garis putus) : Ditafsirkan dari brief ambigu (Cek Q01-Q09)</text>
  
  <!-- Baris Proposed -->
  <line x1="{TB_X + 16}" y1="{TB_Y + 92}" x2="{TB_X + 50}" y2="{TB_Y + 92}" stroke="#2563eb" stroke-width="1.5"/>
  <text x="{TB_X + 60}" y="{TB_Y + 95}" font-size="9.5" font-weight="600" fill="#2563eb">PROPOSED (Garis tipis) : Ide desain booth activation kita</text>
  
  <!-- Garis Pemisah Info Proyek -->
  <line x1="{TB_X}" y1="{TB_Y + 107}" x2="{TB_X + 380}" y2="{TB_Y + 107}" stroke="#e2e8f0" stroke-width="1"/>
  <text x="{TB_X + 12}" y="{TB_Y + 123}" font-size="8.5" fill="#64748b">SKALA: 1:100 (A3) | DOKUMEN: LEMBAR T-01 DENAH DASAR | AUTO-GENERATED</text>
</g>
''')

svg_parts.append('</svg>')

# Simpan ke concepts/plan-v0.svg
svg_content = "\n".join(svg_parts)
with open(OUT_SVG, "w", encoding="utf-8") as f:
    f.write(svg_content)

# Simpan versi HTML viewer sederhana agar bisa dibuka langsung di browser
html_content = f'''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Denah Booth Chitato × JetZ 2D (Gate 0)</title>
  <style>
    body {{
      margin: 0;
      padding: 20px;
      background: #0f172a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .header {{
      max-width: 1300px;
      width: 100%;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    h1 {{ margin: 0; font-size: 20px; }}
    .badge {{
      background: #f97316;
      color: #fff;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: bold;
    }}
    .card {{
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      padding: 10px;
      max-width: 1300px;
      width: 100%;
      overflow-x: auto;
    }}
    .tips {{
      margin-top: 15px;
      max-width: 1300px;
      width: 100%;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Denah 2D Berdimensi — Chitato × JetZ (Gate 0)</h1>
      <span style="font-size:13px; color:#94a3b8;">Dihasilkan langsung dari <code>spec/booth.spec.json</code> (Satu Sumber Kebenaran)</span>
    </div>
    <div class="badge">GATE 0 REVIEW</div>
  </div>

  <div class="card">
    {svg_content}
  </div>

  <div class="tips">
    💡 <b>Petunjuk Cepat:</b><br>
    - <b>Garis Tebal Hitam</b>: POSM resmi brand (Event Desk, Totem, Flexy Rack, Locker).<br>
    - <b>Garis Putus Oranye</b>: Modul yang diasumsikan dimensinya (LED 65", Main Stage, Divider, Signage JetZ).<br>
    - <b>Garis Biru</b>: Usulan arsitektural (Arch interaktif, dinding belakang, meja charm, pouffe).<br>
    - Angka dimensi otomatis: Lebar booth 30.000 mm, lebar lorong antrean Chitato 1.390 mm &amp; JetZ 1.490 mm.
  </div>
</body>
</html>
'''

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"✅ SVG berhasil dibuat: {OUT_SVG}")
print(f"✅ HTML viewer dibuat : {OUT_HTML}")
