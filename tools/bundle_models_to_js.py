#!/usr/bin/env python3
import base64
from pathlib import Path

MODELS_DIR = Path("dist/models")
OUTPUT_JS = Path("dist/models_data.js")

models = {
    "chip_chair": "chitato_chip_chair.glb",
    "bag_plinth": "chitato_bag_plinth.glb",
    "main_stage": "jetz_main_stage.glb",
    "charm_table": "jetz_charm_table.glb"
}

data_entries = []
for key, filename in models.items():
    file_path = MODELS_DIR / filename
    if file_path.exists():
        with open(file_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
            data_entries.append(f'  "{key}": "{b64}"')
        print(f"Bundled {filename} ({round(file_path.stat().st_size/1024, 1)} KB)")

js_content = "window.BOOTH_MODELS_B64 = {\n" + ",\n".join(data_entries) + "\n};\n"
with open(OUTPUT_JS, "w") as f:
    f.write(js_content)

print(f"-> Berhasil membuat {OUTPUT_JS} ({round(OUTPUT_JS.stat().st_size/1024, 1)} KB)")
