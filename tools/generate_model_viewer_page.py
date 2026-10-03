#!/usr/bin/env python3
import base64
from pathlib import Path

glb_path = Path("dist/models/chitato_booth_hero_design.glb")
out_html = Path("dist/Desain 3D Booth Chitato.html")

with open(glb_path, "rb") as f:
    b64_glb = base64.b64encode(f.read()).decode("utf-8")

html_content = f'''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Desain 3D Booth Chitato × TREASURE — Google Model Viewer</title>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"></script>
  <style>
    :root {{
      --bg: #090d16;
      --card: rgba(15, 23, 42, 0.90);
      --border: rgba(255, 255, 255, 0.12);
      --amber: #f59e0b;
      --text: #f8fafc;
      --muted: #94a3b8;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; user-select: none; }}
    body {{
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
    }}

    model-viewer {{
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle at 50% 50%, #1e293b 0%, #090d16 100%);
      --poster-color: transparent;
    }}

    .top-header {{
      position: absolute;
      top: 20px;
      left: 20px;
      background: var(--card);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 22px;
      z-index: 10;
      box-shadow: 0 12px 30px rgba(0,0,0,0.5);
    }}
    .top-header h1 {{
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .badge {{
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      background: #10b981;
      color: #fff;
      text-transform: uppercase;
    }}
    .top-header p {{
      font-size: 12px;
      color: var(--muted);
      margin-top: 4px;
    }}

    .controls-panel {{
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 10;
    }}
    .ctrl-btn {{
      background: var(--card);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border);
      color: #f1f5f9;
      font-size: 12.5px;
      font-weight: 600;
      padding: 10px 16px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      transition: all 0.2s;
    }}
    .ctrl-btn:hover {{
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }}
    .ctrl-btn.active {{
      background: #ea580c;
      border-color: #f97316;
      color: #fff;
    }}

    .download-badge {{
      position: absolute;
      bottom: 24px;
      right: 24px;
      background: var(--card);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 18px;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 14px;
    }}
    .download-btn {{
      background: #0284c7;
      color: #fff;
      font-size: 12.5px;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }}
    .download-btn:hover {{ background: #0369a1; }}

    .toast-info {{
      position: absolute;
      bottom: 24px;
      left: 24px;
      background: var(--card);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 12px;
      color: var(--muted);
      z-index: 10;
    }}
    .toast-info b {{ color: #f8fafc; }}
  </style>
</head>
<body>

  <div class="top-header">
    <h1>
      DESAIN 3D BOOTH CHITATO 2026
      <span class="badge">NATIVE 3D MODEL (.GLB)</span>
    </h1>
    <p>Model 3D Arsitektural Asli &bull; 103 Modul Geometri Lengkap &bull; Studio PBR Raytraced Reflection</p>
  </div>

  <div class="controls-panel">
    <button class="ctrl-btn active" onclick="setCamera('-25deg', '78deg', '14m')">👁️ Hero Angle (Persis Foto)</button>
    <button class="ctrl-btn" onclick="setCamera('0deg', '90deg', '16m')">🧍 Tampak Depan (Front Elevation)</button>
    <button class="ctrl-btn" onclick="setCamera('0deg', '20deg', '18m')">⬆️ Tampak Atas (Top Plan)</button>
    <button class="ctrl-btn" onclick="setCamera('-50deg', '82deg', '8m')">✨ Close-Up Arch &amp; Kiosk</button>
    <button class="ctrl-btn" onclick="setCamera('35deg', '82deg', '10m')">🖼️ Close-Up Lightbox Poster</button>
    <button class="ctrl-btn" id="btn-spin" onclick="toggleAutoRotate()">🔄 Putar Otomatis (360° Spin)</button>
  </div>

  <div class="toast-info">
    🖱️ <b>Klik Kiri + Putar:</b> 360° Orbit Bebas | <b>Scroll:</b> Zoom In/Out | <b>Klik Kanan:</b> Geser (Pan)
  </div>

  <div class="download-badge">
    <div>
      <div style="font-size:11px; color:var(--muted); font-weight:700;">BERKAS 3D UNTUK KONTRAKTOR</div>
      <div style="font-size:13px; font-weight:800; color:#f8fafc;">chitato_booth_hero_design.glb (86 KB)</div>
    </div>
    <a href="models/chitato_booth_hero_design.glb" download class="download-btn">Unduh File 3D (.glb)</a>
  </div>

  <model-viewer
    id="viewer"
    src="data:model/gltf-binary;base64,{b64_glb}"
    alt="3D Desain Booth Chitato Hero"
    camera-controls
    touch-action="pan-y"
    camera-orbit="-25deg 78deg 14m"
    min-camera-orbit="auto auto 4m"
    max-camera-orbit="auto auto 30m"
    field-of-view="35deg"
    shadow-intensity="1.6"
    shadow-softness="0.8"
    exposure="1.15"
    environment-image="neutral"
    auto-rotate-delay="3000">
  </model-viewer>

  <script>
    const viewer = document.getElementById('viewer');
    let autoRotate = false;

    function setCamera(orbitX, orbitY, distance) {{
      viewer.cameraOrbit = `${{orbitX}} ${{orbitY}} ${{distance}}`;
    }}

    function toggleAutoRotate() {{
      autoRotate = !autoRotate;
      viewer.autoRotate = autoRotate;
      const btn = document.getElementById('btn-spin');
      if (autoRotate) btn.classList.add('active');
      else btn.classList.remove('active');
    }}
  </script>

</body>
</html>
'''

with open(out_html, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"-> Berhasil membuat {out_html} ({round(out_html.stat().st_size/1024, 1)} KB)")
