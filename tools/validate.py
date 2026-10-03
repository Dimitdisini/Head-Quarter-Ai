#!/usr/bin/env python3
"""
validate.py — Booth Spec Validator
Sumber kebenaran: spec/booth.spec.json

Memeriksa:
  - Semua elemen di dalam batas 30 x 4 m
  - Tinggi maksimum <= 2.5 m
  - Tidak ada elemen zona A yang melewati x = 15
  - Tidak ada elemen zona B yang melampaui x = 15 ke kiri
  - Tidak ada tabrakan footprint (termasuk standee yang diekspansi)
  - ID unik
  - Urutan standee Zona A sesuai brief

Exit code: 0 = OK, 1 = ada error
"""

import json
import sys
import itertools
from pathlib import Path

# Cari spec dari lokasi script atau direktori kerja
SCRIPT_DIR = Path(__file__).parent
SPEC_PATH = SCRIPT_DIR.parent / "spec" / "booth.spec.json"

if not SPEC_PATH.exists():
    # Fallback: cari dari direktori kerja saat ini
    SPEC_PATH = Path("spec/booth.spec.json")

if not SPEC_PATH.exists():
    print(f"ERROR: spec/booth.spec.json tidak ditemukan (dicari di {SPEC_PATH.resolve()})")
    sys.exit(1)

with open(SPEC_PATH, encoding="utf-8") as f:
    spec = json.load(f)

# ── Ambil limits ──────────────────────────────────────────────────────────────
L = spec["limits"]
bx0, by0, bx1, by1 = L["bounds_xyxy"]
HMAX = L["max_height"]
eps = 1e-9

# ── Ekspansi elemen ke solid list ─────────────────────────────────────────────
solid = []

for e in spec["elements"]:
    x, y, z = e["pos"]
    sx, sy, sz = e["size"]
    solid.append(dict(
        id=e["id"], tag=e["tag"], type=e["type"],
        x0=x - sx / 2, x1=x + sx / 2,
        y0=y - sy / 2, y1=y + sy / 2,
        z0=z, z1=z + sz,
        zone=e["zone"], dim=e.get("dim", "?")
    ))

for r in spec["standee_rows"]:
    bw, bd = r["base"]
    for i, it in enumerate(r["items"]):
        cx = r["x0"] + i * r["pitch"]
        solid.append(dict(
            id=f"{r['id']}-{i+1}:{it['name']}", tag=r["tag"], type="standee",
            x0=cx - bw / 2, x1=cx + bw / 2,
            y0=r["y"] - bd / 2, y1=r["y"] + bd / 2,
            z0=0, z1=r["height"],
            zone=r["zone"], dim=r.get("dim", "?")
        ))

# ── Jalankan checks ───────────────────────────────────────────────────────────
errs = []
warns = []

# 1. Batas area
for s in solid:
    if s["x0"] < bx0 - eps or s["x1"] > bx1 + eps or \
       s["y0"] < by0 - eps or s["y1"] > by1 + eps:
        errs.append(f"OUT OF BOUNDS  {s['id']}  "
                    f"x=[{s['x0']:.3f}, {s['x1']:.3f}] y=[{s['y0']:.3f}, {s['y1']:.3f}]")

# 2. Tinggi maksimum
for s in solid:
    if s["z1"] > HMAX + eps:
        errs.append(f"TOO TALL       {s['id']}  tinggi={s['z1']:.3f} m (maks {HMAX} m)")

# 3. Zona A tidak boleh melewati x = 15
for s in solid:
    if s["zone"] == "A" and s["x1"] > 15 + eps:
        errs.append(f"ZONA A > x=15  {s['id']}  x1={s['x1']:.3f}")

# 4. Zona B tidak boleh melampaui x = 15 ke kiri
for s in solid:
    if s["zone"] == "B" and s["x0"] < 15 - eps:
        errs.append(f"ZONA B < x=15  {s['id']}  x0={s['x0']:.3f}")

# 5. Tabrakan footprint (overlap di x, y, DAN z)
for a, b in itertools.combinations(solid, 2):
    ox = min(a["x1"], b["x1"]) - max(a["x0"], b["x0"])
    oy = min(a["y1"], b["y1"]) - max(a["y0"], b["y0"])
    oz = min(a["z1"], b["z1"]) - max(a["z0"], b["z0"])
    if ox > eps and oy > eps and oz > eps:
        errs.append(f"OVERLAP        {a['id']}  <->  {b['id']}  "
                    f"(Δx={ox:.3f} Δy={oy:.3f} Δz={oz:.3f})")

# 6. ID unik
all_ids = [e["id"] for e in spec["elements"]] + \
          [r["id"] for r in spec["standee_rows"]]
seen = set()
for id_ in all_ids:
    if id_ in seen:
        errs.append(f"DUPLICATE ID   {id_}")
    seen.add(id_)

# 7. Urutan standee Zona A sesuai brief
REQUIRED_ORDER_A = [
    "Choi Hyunsuk", "Junkyu", "So Junghwan", "Yoshi", "Yoo Jaehyun",
    "Haruto", "Doyoung", "Park Jeongwoo", "Jihoon"
]
a_std = next((r for r in spec["standee_rows"] if r["id"] == "A-STD"), None)
if a_std is None:
    errs.append("MISSING        standee row A-STD tidak ditemukan")
else:
    got = [it["name"] for it in a_std["items"]]
    if got != REQUIRED_ORDER_A:
        errs.append(
            f"STANDEE ORDER A  mismatch\n"
            f"  Dibutuhkan : {REQUIRED_ORDER_A}\n"
            f"  Ditemukan  : {got}"
        )

# 8. Warning: modul assumed (bukan error, tapi wajib terlihat di gambar)
assumed = [s for s in solid if s["dim"] == "assumed"]
if assumed:
    warns.append(f"{len(assumed)} modul berstatus 'assumed' — tandai garis putus di gambar:")
    for s in assumed:
        warns.append(f"  {s['id']} ({s['tag']})")

# ── Ringkasan ─────────────────────────────────────────────────────────────────
total_elements  = len(spec["elements"])
total_standees  = sum(len(r["items"]) for r in spec["standee_rows"])
max_h           = max((s["z1"] for s in solid), default=0)
spec_version    = spec["meta"]["spec_version"]
spec_status     = spec["meta"]["status"]

print("=" * 60)
print(f"  Booth Spec Validator — v{spec_version}  [{spec_status.upper()}]")
print("=" * 60)
print(f"  Elemen        : {total_elements}")
print(f"  Standee       : {total_standees}")
print(f"  Tinggi maks   : {max_h:.3f} m  (batas {HMAX} m)")
print(f"  Zona A        : {sum(1 for s in solid if s['zone'] == 'A')} objek")
print(f"  Zona B        : {sum(1 for s in solid if s['zone'] == 'B')} objek")
print("-" * 60)

if warns:
    print("PERINGATAN:")
    for w in warns:
        print(f"  {w}")
    print("-" * 60)

if errs:
    print(f"ERRORS ({len(errs)}):")
    for e in errs:
        print(f"  ✗ {e}")
    print("-" * 60)
    print("GAGAL — perbaiki spec sebelum build.")
    sys.exit(1)
else:
    print("OK — tidak ada error. Spec valid dan siap dipakai.")
    sys.exit(0)
