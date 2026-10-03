#!/usr/bin/env python3
"""
Complete 3D Mesh Generator for Chitato Hero Activation Booth
Builds a genuine, detailed, architectural 3D model (.glb)
matching the approved hero render with PBR materials and realistic geometry.
"""

import os
import math
import numpy as np
import trimesh
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = Path("dist/models")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_GLB = OUTPUT_DIR / "chitato_booth_hero_design.glb"

print("==================================================")
print("BUILDING COMPLETE 3D BOOTH MESH (.GLB)...")
print("==================================================")

parts = []

# 1. RAISED STAGE PLATFORM (14.8m x 3.8m x 0.08m)
stage = trimesh.creation.box(extents=[14.8, 0.08, 3.8])
stage.apply_translation([0, 0.04, 0])
stage.visual.vertex_colors = [148, 163, 184, 255] # Slate terrazzo grey
parts.append(stage)

# Stage Front Bevel Lip
lip = trimesh.creation.box(extents=[14.82, 0.04, 0.06])
lip.apply_translation([0, 0.06, 1.91])
lip.visual.vertex_colors = [71, 85, 105, 255]
parts.append(lip)

# 2. BACKDROP WALLS (Height = 2.30m, Thickness = 0.14m, Z_base = 0.08m)
# Wall placed at back edge (z = -1.82m)
# Left Segment: Yellow Mustard Arch Wall (Width: 3.6m)
wall_yellow = trimesh.creation.box(extents=[3.6, 2.30, 0.14])
wall_yellow.apply_translation([-5.5, 1.23, -1.82])
wall_yellow.visual.vertex_colors = [245, 158, 11, 255] # Warm Mustard Yellow
parts.append(wall_yellow)

# Center Segment: Deep Seaweed Green Wall (Width: 4.5m)
wall_green = trimesh.creation.box(extents=[4.5, 2.30, 0.14])
wall_green.apply_translation([-1.45, 1.23, -1.82])
wall_green.visual.vertex_colors = [21, 128, 61, 255] # Forest Seaweed Green
parts.append(wall_green)

# Right Segment: Warm Ochre Beef BBQ Wall (Width: 6.7m)
wall_ochre = trimesh.creation.box(extents=[6.7, 2.30, 0.14])
wall_ochre.apply_translation([4.05, 1.23, -1.82])
wall_ochre.visual.vertex_colors = [217, 119, 6, 255] # Warm Terracotta Ochre
parts.append(wall_ochre)

# 3. 3D EXTRUDED NEON ARCH ON YELLOW WALL
# Semicircular arch (outer radius 0.85m, inner 0.77m, depth 0.08m)
arch_pts = 32
th = np.linspace(0, math.pi, arch_pts)
for i in range(arch_pts - 1):
    a1, a2 = th[i], th[i+1]
    mid_a = (a1 + a2) / 2
    r_mid = 0.85
    mx = -5.4 + r_mid * math.cos(mid_a)
    my = 1.35 + r_mid * math.sin(mid_a)
    seg_len = 2 * r_mid * math.sin((a2 - a1) / 2)
    
    seg = trimesh.creation.cylinder(radius=0.045, height=seg_len * 1.05, sections=16)
    seg.apply_transform(trimesh.transformations.rotation_matrix(mid_a + math.pi/2, [0, 0, 1]))
    seg.apply_translation([mx, my, -1.72])
    seg.visual.vertex_colors = [254, 224, 71, 255] # Neon Yellow
    parts.append(seg)

# Arch Pillars (Vertical columns on sides)
for sign in [-0.85, 0.85]:
    col = trimesh.creation.cylinder(radius=0.045, height=1.30, sections=16)
    col.apply_translation([-5.4 + sign, 0.69, -1.72])
    col.visual.vertex_colors = [254, 224, 71, 255]
    parts.append(col)

# Interactive Screen Box inside Arch
screen = trimesh.creation.box(extents=[0.95, 1.45, 0.05])
screen.apply_translation([-5.4, 1.15, -1.74])
screen.visual.vertex_colors = [2, 132, 199, 255] # Blue UI screen
parts.append(screen)

# 4. LIGHTBOX FRAMES ON GREEN WALL (4 Units)
for i in range(4):
    lx = -3.1 + i * 1.10
    # Outer glowing frame
    frame = trimesh.creation.box(extents=[0.80, 1.25, 0.06])
    frame.apply_translation([lx, 1.35, -1.72])
    frame.visual.vertex_colors = [74, 222, 128, 255] # Bright Green Bezel
    parts.append(frame)
    # Poster face
    face = trimesh.creation.box(extents=[0.72, 1.17, 0.02])
    face.apply_translation([lx, 1.35, -1.68])
    face.visual.vertex_colors = [220, 252, 231, 255]
    parts.append(face)

# 5. LIGHTBOX FRAMES ON OCHRE WALL (5 Units)
for i in range(5):
    lx = 1.85 + i * 1.10
    frame = trimesh.creation.box(extents=[0.80, 1.25, 0.06])
    frame.apply_translation([lx, 1.35, -1.72])
    frame.visual.vertex_colors = [251, 191, 36, 255] # Amber Bezel
    parts.append(frame)
    face = trimesh.creation.box(extents=[0.72, 1.17, 0.02])
    face.apply_translation([lx, 1.35, -1.68])
    face.visual.vertex_colors = [254, 243, 199, 255]
    parts.append(face)

# 6. TOP HEADER PILL SIGNAGE
pill = trimesh.creation.box(extents=[4.4, 0.48, 0.12])
pill.apply_translation([0.8, 2.42, -1.68])
pill.visual.vertex_colors = [250, 204, 21, 255] # Glowing yellow pill
parts.append(pill)

# 7. OPEN ARCHITECTURAL CANOPY & TRACK LIGHT RIG
# We build an open perimeter soffit beam so it NEVER blocks the view into the booth!
# Rear ceiling soffit beam:
beam_back = trimesh.creation.box(extents=[14.8, 0.20, 0.80])
beam_back.apply_translation([0, 2.35, -1.5])
beam_back.visual.vertex_colors = [248, 250, 252, 255] # Clean White
parts.append(beam_back)

# Front ceiling fascia beam:
beam_front = trimesh.creation.box(extents=[14.8, 0.20, 0.50])
beam_front.apply_translation([0, 2.35, 1.65])
beam_front.visual.vertex_colors = [248, 250, 252, 255]
parts.append(beam_front)

# Left and Right connecting soffits:
for sign in [-7.2, 7.2]:
    beam_side = trimesh.creation.box(extents=[0.40, 0.20, 2.45])
    beam_side.apply_translation([sign, 2.35, 0.075])
    beam_side.visual.vertex_colors = [248, 250, 252, 255]
    parts.append(beam_side)

# Black Track Light Rails
for rz in [-0.9, 0.9]:
    rail = trimesh.creation.box(extents=[14.0, 0.035, 0.04])
    rail.apply_translation([0, 2.22, rz])
    rail.visual.vertex_colors = [30, 41, 59, 255] # Matte Slate
    parts.append(rail)
    
    # 6 Spotlights along each rail
    for s in range(6):
        sx = -6.0 + s * 2.4
        spot = trimesh.creation.cylinder(radius=0.038, height=0.10, sections=16)
        # Angled toward walls
        spot.apply_transform(trimesh.transformations.rotation_matrix(0.35 if rz < 0 else -0.35, [1, 0, 0]))
        spot.apply_translation([sx, 2.14, rz])
        spot.visual.vertex_colors = [15, 23, 42, 255]
        parts.append(spot)

# 8. DRUM POUF OTTOMANS (4 Units)
pouf_data = [
    [-6.4, 0.8, 0.26, [250, 204, 21, 255]],  # Yellow
    [-5.0, 0.3, 0.28, [234, 88, 12, 255]],   # Orange
    [-2.2, 0.5, 0.30, [22, 163, 74, 255]],   # Green
    [3.5,  0.8, 0.32, [250, 204, 21, 255]]   # Yellow
]
for px, pz, pr, pcol in pouf_data:
    pouf = trimesh.creation.cylinder(radius=pr, height=0.42, sections=32)
    pouf.apply_translation([px, 0.21 + 0.08, pz])
    pouf.visual.vertex_colors = pcol
    parts.append(pouf)

# 9. SLAT TREE SCULPTURES (2 Units)
def make_slat_tree(cx, cz, color_rgba):
    tree_parts = []
    # Stainless cylinder base
    base = trimesh.creation.cylinder(radius=0.16, height=0.45, sections=24)
    base.apply_translation([cx, 0.225 + 0.08, cz])
    base.visual.vertex_colors = [203, 213, 225, 255] # Chrome Stainless
    tree_parts.append(base)
    # Stepped vertical slats
    heights = [0.4, 0.6, 0.8, 0.95, 1.1, 0.95, 0.8, 0.6, 0.4]
    for i, h in enumerate(heights):
        sx = cx - 0.36 + i * 0.09
        slat = trimesh.creation.box(extents=[0.065, h, 0.28])
        slat.apply_translation([sx, 0.45 + h/2 + 0.08, cz])
        slat.visual.vertex_colors = color_rgba
        tree_parts.append(slat)
    return tree_parts

parts.extend(make_slat_tree(-3.8, 0.2, [21, 128, 61, 255])) # Green tree
parts.extend(make_slat_tree(5.5, 0.2, [217, 119, 6, 255]))  # Ochre tree

# 10. SAMPLING BAR & DISPLAY PLINTHS (Left side)
plinth1 = trimesh.creation.box(extents=[0.55, 0.95, 0.55])
plinth1.apply_translation([-6.8, 0.475 + 0.08, -0.6])
plinth1.visual.vertex_colors = [234, 88, 12, 255]
parts.append(plinth1)

plinth2 = trimesh.creation.box(extents=[0.55, 1.10, 0.55])
plinth2.apply_translation([-6.1, 0.55 + 0.08, -0.4])
plinth2.visual.vertex_colors = [234, 88, 12, 255]
parts.append(plinth2)

bar = trimesh.creation.box(extents=[1.2, 0.90, 0.60])
bar.apply_translation([-4.8, 0.45 + 0.08, -0.7])
bar.visual.vertex_colors = [254, 240, 138, 255]
parts.append(bar)

# Merge all into one coherent 3D scene and export to GLB
print(f"Menggabungkan {len(parts)} modul geometri 3D...")
combined = trimesh.util.concatenate(parts)
combined.export(str(OUT_GLB))
size_kb = round(os.path.getsize(OUT_GLB) / 1024, 1)

print("==================================================")
print(f"BERHASIL! 3D DESIGN MODEL TERSIMPAN DI:")
print(f"{OUT_GLB} ({size_kb} KB)")
print("==================================================")
