#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/booth-3d"

# Periksa apakah server sudah berjalan di port 8765
if ! nc -z 127.0.0.1 8765 >/dev/null 2>&1; then
  echo "Menjalankan server lokal..."
  node server.js >/dev/null 2>&1 &
  SERVER_PID=$!
  sleep 1
else
  SERVER_PID=""
fi

echo "==========================================================="
echo "  BOOTH 3D INTERAKTIF — CHITATO x JETZ 2026"
echo "  Indofood Tower Lobby (30 x 4 x 2,5 m)"
echo "==========================================================="
echo "  Membuka browser ke http://127.0.0.1:8765/index.html"
echo ""
echo "  Fitur untuk presentasi klien:"
echo "  - 13 Sudut kamera interaktif (Overview, Chitato, JetZ, Stage, Charm, dll)"
echo "  - Mode Siang (lobby concourse) & Malam (dramatis glowing)"
echo "  - Breakdown 32 modul aset dengan inspeksi turntable 360"
echo "  - Denah atas (plan view) potongan interior"
echo "  - Tombol simpan render gambar PNG 4K & Full HD langsung dari browser"
echo ""
echo "  Tekan Ctrl+C untuk menutup server jika sudah selesai."
echo "==========================================================="

open "http://127.0.0.1:8765/index.html"

# Jaga terminal tetap hidup jika server dijalankan oleh skrip ini
if [ -n "$SERVER_PID" ]; then
  trap "kill $SERVER_PID 2>/dev/null; exit 0" INT TERM EXIT
  wait $SERVER_PID
else
  # Tunggu interaksi user sebelum keluar
  read -p "Tekan Enter untuk menutup jendela ini... " dummy
fi
