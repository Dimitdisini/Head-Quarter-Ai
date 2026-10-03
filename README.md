# Booth 3D Activation: Chitato × JetZ 2026

Repositori resmi untuk desain arsitektur, simulasi 3D interaktif, dan gambar kerja aktivasi booth gabungan **Chitato × TREASURE** dan **JetZ × Hearts2Hearts** di Lobby Indofood Tower, Jakarta (9–13 November 2026).

---

## Ringkasan Proyek

| Parameter | Spesifikasi | Keterangan |
| :--- | :--- | :--- |
| **Lokasi** | Concourse Lobby Indofood Tower, Jakarta | Koridor antara SPIT & Indomaret Point |
| **Dimensi Area** | 30,0 × 4,0 meter (120 m²) | Zona Chitato (15 × 4 m) & Zona JetZ (15 × 4 m) |
| **Batas Ketinggian** | Maksimal 2,50 meter | Sesuai batas izin IFM Building Management |
| **Proteksi Lantai** | Karpet hitam 32,0 × 6,0 meter | Margin proteksi marmer gedung 1 m di tiap sisi |
| **Konsep Audio** | Silent Disco (Wireless Headphones) | Bebas polusi suara di lobby perkantoran aktif |
| **Pemisah Zona** | Partisi Loker Sekolah (Double-sided) | Tinggi 2,4 m dengan loker pastel fungsional |

---

## Struktur Repositori

```
booth-chitato-jetz/
├── booth-3d/                     # Aplikasi Web 3D Interaktif (Three.js PBR)
│   ├── index.html                # Kanvas 3D, kontrol kamera, panel inspeksi
│   ├── js/                       # Modul geometri prosedural & logika scene
│   │   ├── main.js               # Inisialisasi engine Three.js, event, render loop
│   │   ├── chitato.js            # Geometri Zona A (portal neon, plinth, kasir)
│   │   ├── jetz.js               # Geometri Zona B (panggung, loker, charm desk)
│   │   ├── people.js             # Skala figur manusia realistis
│   │   ├── props.js              # Detail gantungan kunci, baki manik, snack pack
│   │   └── structure.js          # Kanopi, tiang truss, plafon, lampu track
│   ├── vendor/                   # Three.js & modul lokal (mandiri tanpa CDN/npm)
│   ├── renders/                  # 20 berkas render resolusi tinggi (siap pitch)
│   ├── server.js                 # HTTP server lokal ringan berbasis Node.js
│   └── vercel.json               # Konfigurasi deployment Vercel
├── spec/
│   └── booth.spec.json           # Sumber kebenaran dimensi & koordinat modul
├── tools/
│   ├── validate.py               # Validator spec otomatis (ketinggian & batas)
│   └── ...                       # Skrip generator CAD & data
├── dist/
│   ├── Master Breakdown...html   # Laporan breakdown aset modul 1 per 1
│   └── Gambar Teknik Detail...html # Gambar kerja CAD arsitektural
├── concepts/                     # Papan referensi visual, denah SVG & render konsep
├── drawings/
│   └── out/bom.csv               # Bill of Materials (BOM) estimasi kebutuhan unit
├── Panduan Presentasi Klien.md   # Talking points & cheat sheet pitch klien
├── Buka Booth 3D.command         # Shortcut satu-klik jalankan server & browser di macOS
├── Deploy ke Vercel.command      # Shortcut satu-klik deploy online ke Vercel di macOS
└── package.json                  # Konfigurasi npm script
```

---

## Cara Menjalankan Secara Lokal

Aplikasi viewer 3D dirancang mandiri tanpa perlu build step atau instalasi library tambahan.

### Opsi 1: Satu Klik di macOS
Cukup klik dua kali berkas **`Buka Booth 3D.command`** di Finder. Browser akan otomatis terbuka di `http://127.0.0.1:8765/index.html`.

### Opsi 2: Menggunakan Terminal / Node.js
```bash
# Jalankan server lokal
npm start

# Buka di browser:
# http://127.0.0.1:8765/index.html
```

---

## Fitur Interaktif pada Viewer 3D

1. **13 Preset Sudut Kamera Pitching:**
   - *Overview*: Pandangan penuh 30 meter kedua booth berdampingan.
   - *Zona Chitato & JetZ*: Sudut mata pengunjung setinggi 1,6 meter.
   - *Headphone Stage & DJ Desk*: Panggung silent disco "JetZrek-in Aja!".
   - *Pegboard & Charm Table*: Detail makro rantai, jump ring, dan manik-manik.
   - *Lightbox & Selling POS*: Panel karakter dan kasir antrean.
   - *Plan View & Aerial*: Potongan denah interior dan perspektif atas gedung.
2. **Mode Pencahayaan Siang & Malam:**
   - Simulasi marmer lobby di siang hari vs. pendaran LED neon, lightbox, dan cove light saat redup.
3. **Turntable Studio 360° (Inspeksi Per Modul):**
   - Pilih salah satu modul di panel samping (A01–A15 atau B01–B14) lalu tekan *Lihat aset terpisah* untuk mengisolasi dan memutar objek 360 derajat di atas podium studio.
4. **Ekspor Render Seketika:**
   - Tombol *Simpan PNG 4K* (3840 × 2160) dan *PNG Full HD* (1920 × 1080) untuk ekspor gambar presentasi langsung dari browser.

---

## Cara Deploy ke Vercel (Online)

Agar klien dan tim dapat mengakses model 3D langsung dari ponsel atau laptop tanpa instalasi:

```bash
# Jika Vercel CLI sudah terpasang:
cd booth-3d
vercel --prod
```
Atau klik dua kali berkas **`Deploy ke Vercel.command`** di macOS.

---

## Validasi Spesifikasi Konstruksi

Untuk memastikan seluruh penempatan modul berada di dalam batas koridor (30 × 4 m) dan tidak melebihi izin ketinggian gedung (2,50 m):

```bash
npm run check
# atau
python3 tools/validate.py
```
Hasil validasi akan memverifikasi seluruh modul, titik tumpuan, serta clearance gedung secara otomatis.
