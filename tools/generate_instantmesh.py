#!/usr/bin/env python3
"""
Tencent InstantMesh 3D Generator via Hugging Face Cloud
Outputs: real 3D GLB & OBJ model files.
Runs 100% free on cloud GPU.
"""

import sys
import os
import json
import time
import requests
from pathlib import Path

SPACE_URL = "https://tencentarc-instantmesh.hf.space"
UPLOAD_URL = f"{SPACE_URL}/gradio_api/upload"
CALL_URL = f"{SPACE_URL}/gradio_api/call"
FILE_URL = f"{SPACE_URL}/gradio_api/file"

def generate_instantmesh(image_path, output_glb_path):
    img_path = Path(image_path).resolve()
    out_path = Path(output_glb_path).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if not img_path.exists():
        print(f"Error: {img_path} tidak ditemukan!")
        return False

    session = requests.Session()
    print("=== Mulai AI Image-to-3D (Tencent InstantMesh Cloud GPU) ===")
    print(f"Foto sumber: {img_path.name}")
    print(f"Target file: {out_path}")

    # 1. Upload
    print("\n[1/4] Mengunggah foto ke server...")
    with open(img_path, "rb") as f:
        resp = session.post(UPLOAD_URL, files={"files": (img_path.name, f, "image/jpeg")}, timeout=60)
        resp.raise_for_status()
        server_path = resp.json()[0]
    
    file_obj = {
        "path": server_path,
        "url": f"{FILE_URL}={server_path}",
        "orig_name": img_path.name,
        "mime_type": "image/jpeg",
        "meta": {"_type": "gradio.FileData"}
    }
    print("Foto berhasil diunggah.")

    # 2. Preprocess (Remove Background & Center)
    print("\n[2/4] Menghapus latar belakang & normalisasi sudut pandang...")
    resp = session.post(f"{CALL_URL}/preprocess", json={"data": [file_obj, True]}, timeout=60)
    resp.raise_for_status()
    pre_event_id = resp.json()["event_id"]

    preprocessed_obj = None
    with session.get(f"{CALL_URL}/preprocess/{pre_event_id}", stream=True, timeout=120) as sse:
        prev = ""
        for line in sse.iter_lines():
            if line:
                dec = line.decode("utf-8")
                if dec.startswith("event:"):
                    prev = dec
                elif dec.startswith("data:") and "complete" in prev:
                    preprocessed_obj = json.loads(dec[5:].strip())[0]
                    break

    if not preprocessed_obj:
        print("Gagal preprocessing! Menggunakan file asli...")
        preprocessed_obj = file_obj
    else:
        print("Pra-proses selesai!")

    # 3. Generate Multi-Views (Zero123++)
    print("\n[3/4] Menghasilkan sintesis multi-sudut pandang 360 (Multi-View Diffusion)...")
    resp = session.post(f"{CALL_URL}/generate_mvs", json={"data": [preprocessed_obj, 30, 42]}, timeout=60)
    resp.raise_for_status()
    mvs_event_id = resp.json()["event_id"]

    mv_images_obj = None
    with session.get(f"{CALL_URL}/generate_mvs/{mvs_event_id}", stream=True, timeout=240) as sse:
        prev = ""
        for line in sse.iter_lines():
            if line:
                dec = line.decode("utf-8")
                if dec.startswith("event:"):
                    prev = dec
                elif dec.startswith("data:") and "complete" in prev:
                    mvs_data = json.loads(dec[5:].strip())
                    # outputs: [state, multiviews_image]
                    mv_images_obj = mvs_data[1]
                    break

    if not mv_images_obj:
        print("Gagal menghasilkan multi-view!")
        return False
    print("Multi-view 360 derajat selesai dibuat!")

    # 4. Make 3D (Mesh Reconstruction & GLB Export)
    print("\n[4/4] Rekonstruksi geometri 3D & ekstraksi file GLB...")
    resp = session.post(f"{CALL_URL}/make3d", json={"data": [mv_images_obj]}, timeout=60)
    resp.raise_for_status()
    make3d_event_id = resp.json()["event_id"]

    glb_download_info = None
    start_t = time.time()
    with session.get(f"{CALL_URL}/make3d/{make3d_event_id}", stream=True, timeout=300) as sse:
        prev = ""
        for line in sse.iter_lines():
            if line:
                dec = line.decode("utf-8")
                if dec.startswith("event:"):
                    prev = dec
                    if "heartbeat" not in dec:
                        print(f"Status proses: {dec}")
                elif dec.startswith("data:"):
                    if "complete" in prev:
                        res = json.loads(dec[5:].strip())
                        # outputs: [obj_model, glb_model]
                        print("Hasil diterima:", res)
                        if len(res) >= 2 and res[1]:
                            glb_download_info = res[1]
                        elif len(res) >= 1 and res[0]:
                            glb_download_info = res[0]
                        break

    if not glb_download_info:
        print("Gagal mengekstrak model 3D!")
        return False

    glb_url = glb_download_info.get("url") if isinstance(glb_download_info, dict) else glb_download_info
    print(f"\nKomputasi 3D selesai dalam {round(time.time() - start_t, 1)} detik!")
    print(f"Mengunduh GLB dari: {glb_url} ...")

    dl = session.get(glb_url, timeout=120)
    dl.raise_for_status()
    with open(out_path, "wb") as f:
        f.write(dl.content)

    print(f"\n==========================================")
    print(f"BERHASIL! Model 3D GLB tersimpan di:")
    print(f"{out_path} ({round(len(dl.content)/(1024*1024), 2)} MB)")
    print(f"==========================================")
    return True

if __name__ == "__main__":
    img = sys.argv[1] if len(sys.argv) > 1 else "concepts/renders/chitato_chip_chair_closeup_1790941282305.jpg"
    out = sys.argv[2] if len(sys.argv) > 2 else "dist/models/chitato_chip_chair.glb"
    ok = generate_instantmesh(img, out)
    sys.exit(0 if ok else 1)
