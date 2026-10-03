#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/booth-3d"

echo "==========================================================="
echo "  DEPLOY BOOTH 3D KE VERCEL"
echo "==========================================================="
echo "Direktori: $DIR/booth-3d"
echo ""
echo "Menjalankan Vercel CLI..."
echo "(Jika pertama kali, Anda akan diminta login via browser)"
echo "==========================================================="
echo ""

npx --yes vercel --prod

echo ""
echo "==========================================================="
echo "Selesai! Tautan web Vercel dapat langsung dibagikan ke klien."
echo "==========================================================="
read -p "Tekan Enter untuk keluar... " dummy
