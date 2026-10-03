#!/usr/bin/env python3
"""
TRELLIS AI 3D Generator via Hugging Face Cloud (Free GPU Pipeline)
Runs 100% on the cloud without needing NVIDIA CUDA on Mac.
Outputs: .glb with PBR textures.
"""

import sys
import os
import json
import time
import requests
from pathlib import Path

SPACE_URL = "https://trellis-community-trellis.hf.space"
UPLOAD_URL = f"{SPACE_URL}/gradio_api/upload"
CALL_URL = f"{SPACE_URL}/gradio_api/call"
FILE_URL = f"{SPACE_URL}/gradio_api/file"

def generate_3d_model(input_image_path, output_glb_path):
    input_path = Path(input_image_path).resolve()
    output_path = Path(output_glb_path).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not input_path.exists():
        print(f"Error: Input file {input_path} does not exist!")
        return False

    print(f"=== Mulai Generasi 3D AI (TRELLIS Cloud GPU) ===")
    print(f"Foto sumber: {input_path.name}")
    print(f"Target simpan: {output_path}")

    # 1. Upload foto ke server cloud
    print("\n[1/3] Mengunggah foto ke server...")
    with open(input_path, "rb") as f:
        resp = requests.post(UPLOAD_URL, files={"files": (input_path.name, f, "image/jpeg")}, timeout=60)
        resp.raise_for_status()
        server_path = resp.json()[0]
    
    file_obj = {
        "path": server_path,
        "url": f"{FILE_URL}={server_path}",
        "orig_name": input_path.name,
        "mime_type": "image/jpeg",
        "meta": {"_type": "gradio.FileData"}
    }
    print(f"Foto berhasil diunggah.")

    # 2. Preprocessing gambar (hapus latar & penyesuaian sudut)
    print("\n[2/3] Melakukan pra-proses (menghapus latar & centering otomatis)...")
    resp = requests.post(f"{CALL_URL}/preprocess_image", json={"data": [file_obj]}, timeout=60)
    resp.raise_for_status()
    event_id = resp.json()["event_id"]

    preprocessed_obj = None
    with requests.get(f"{CALL_URL}/preprocess_image/{event_id}", stream=True, timeout=120) as sse:
        prev_event = ""
        for line in sse.iter_lines():
            if line:
                decoded = line.decode("utf-8")
                if decoded.startswith("event:"):
                    prev_event = decoded
                elif decoded.startswith("data:") and "complete" in prev_event:
                    data = json.loads(decoded[5:].strip())
                    preprocessed_obj = data[0]
                    break

    if not preprocessed_obj:
        print("Gagal memproses gambar awal. Menggunakan gambar asli...")
        preprocessed_obj = file_obj
    else:
        print("Pra-proses selesai!")

    # 3. Generate 3D & Ekstraksi GLB
    print("\n[3/3] Menjalankan inferensi AI 3D (pembentukan mesh & tekstur PBR di GPU)...")
    payload = {
        "data": [
            preprocessed_obj,  # 0: image_prompt
            [],                # 1: multiimage_prompt
            False,             # 2: is_multiimage
            0,                 # 3: seed
            7.5,               # 4: ss_guidance_strength
            12,                # 5: ss_sampling_steps
            3.0,               # 6: slat_guidance_strength
            12,                # 7: slat_sampling_steps
            "stochastic",      # 8: multiimage_algo
            0.95,              # 9: mesh_simplify
            1024               # 10: texture_size
        ]
    }
    resp = requests.post(f"{CALL_URL}/generate_and_extract_glb", json=payload, timeout=60)
    resp.raise_for_status()
    gen_event_id = resp.json()["event_id"]
    print(f"Antrean server aktif (Event ID: {gen_event_id}). Menunggu hasil komputasi...")

    glb_download_url = None
    start_time = time.time()
    with requests.get(f"{CALL_URL}/generate_and_extract_glb/{gen_event_id}", stream=True, timeout=300) as sse:
        prev_event = ""
        for line in sse.iter_lines():
            if line:
                decoded = line.decode("utf-8")
                if decoded.startswith("event:"):
                    prev_event = decoded
                    if "heartbeat" not in decoded:
                        print(f"Status: {decoded}")
                elif decoded.startswith("data:"):
                    raw_data = decoded[5:].strip()
                    if "complete" in prev_event:
                        result_data = json.loads(raw_data)
                        # outputs: [output_buf, video_output, model_output]
                        # model_output is at index 2
                        if len(result_data) >= 3 and result_data[2]:
                            model_data = result_data[2]
                            if isinstance(model_data, dict) and "url" in model_data:
                                glb_download_url = model_data["url"]
                            elif isinstance(model_data, str) and model_data.startswith("http"):
                                glb_download_url = model_data
                        break
                    elif "progress" in prev_event:
                        try:
                            prog = json.loads(raw_data)
                            print(f"Progress: {prog.get('log', prog)}")
                        except Exception:
                            pass

    if not glb_download_url:
        print("Gagal mendapatkan link unduh GLB dari server!")
        return False

    elapsed = round(time.time() - start_time, 1)
    print(f"\nKomputasi selesai dalam {elapsed} detik!")
    print(f"Mengunduh model 3D dari: {glb_download_url} ...")

    dl_resp = requests.get(glb_download_url, timeout=120)
    dl_resp.raise_for_status()
    with open(output_path, "wb") as f:
        f.write(dl_resp.content)

    size_mb = round(len(dl_resp.content) / (1024 * 1024), 2)
    print(f"\n==========================================")
    print(f"BERHASIL! Model 3D GLB tersimpan di:")
    print(f"{output_path} ({size_mb} MB)")
    print(f"==========================================")
    return True

if __name__ == "__main__":
    img = sys.argv[1] if len(sys.argv) > 1 else "concepts/renders/chitato_chip_chair_closeup_1790941282305.jpg"
    out = sys.argv[2] if len(sys.argv) > 2 else "dist/models/chitato_chip_chair.glb"
    success = generate_3d_model(img, out)
    sys.exit(0 if success else 1)
