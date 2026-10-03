# Panduan Presentasi Desain 3D: Booth Chitato × JetZ 2026

Dokumen ini disusun sebagai panduan pitch kepada klien untuk booth aktivasi gabungan **Chitato × TREASURE** dan **JetZ × Hearts2Hearts** di Lobby Indofood Tower (9–13 November 2026).

---

## 1. Ringkasan Eksekutif & Kepatuhan Brief

| Parameter | Spesifikasi Brief | Realisasi Model 3D | Status Kepatuhan |
| :--- | :--- | :--- | :--- |
| **Dimensi Total** | 30 × 4 meter (Chitato 15 m + JetZ 15 m) | 30,0 × 4,0 meter pada sumbu X & Z | Sesuai 100% |
| **Batas Tinggi** | Maksimal 2,50 meter (aturan gedung) | Puncak kanopi tepat 2,50 meter, clearance 2,32 meter | Sesuai 100% |
| **Proteksi Lantai** | Karpet hitam lebih 1 m di tiap sisi | Karpet 32 × 6 m (192 m²) + lakban hitam di sambungan | Sesuai 100% |
| **Akustik Venue** | Tanpa suara dominan / bising di lobby | Konsep **Silent Disco** dengan headphone wireless | Sesuai 100% |
| **Partisi Brand** | Memanfaatkan loker sekolah sebagai pembatas | Loker Side A (kelas) & Side B (pembatas 4,8 × 2,4 m) | Sesuai 100% |
| **Aktivitas Wajib** | Charm making (motorik) & product trial | Meja charm 230 × 85 cm (6 stool) + Wave Challenge kiosk | Sesuai 100% |
| **Target Selling** | Paket bundling Rp 35.000 (backpack + snack) | Rak display paket repack bening + backpack display | Sesuai 100% |

---

## 2. Cara Membuka & Menjalankan Aplikasi 3D Interaktif

Aplikasi 3D ini dibangun menggunakan WebGL / Three.js murni tanpa dependensi eksternal, sehingga dapat dijalankan offline langsung di laptop presentasi.

### Langkah Cepat (Mac):
1. Buka folder `booth-chitato-jetz` di Finder.
2. Klik ganda berkas **`Buka Booth 3D.command`**.
3. Aplikasi akan langsung membuka browser default di alamat:
   `http://127.0.0.1:8765/index.html`

### Fitur Interaktif pada Antarmuka (UI):
- **13 Sudut Kamera Preset**:
  - *Overview 2 booth*: Memperlihatkan kedua booth berdampingan secara utuh dari concourse lobby.
  - *Zona Chitato*: Framing setara mata pengunjung ke Zona Chitato × TREASURE.
  - *Zona JetZ*: Framing setara mata pengunjung ke Zona JetZ × Hearts2Hearts.
  - *Headphone stage*: Close-up panggung silent disco dan DJ desk "JetZrek-in Aja!".
  - *Pegboard gantungan kunci*: Makro kamera fokus ke detail fisik ring, rantai, dan charm.
  - *Charm making*: Meja perakitan manik-manik, instruksi, dan baki komponen.
  - *Lightbox TREASURE*: 8 panel lightbox anggota grup + standee 180 cm.
  - *Selling area*: Kasir POS, antrean pengunjung, dan display paket.
  - *Pembatas loker*: Sudut transisi tengah antara kedua zona.
  - *Denah atas (plan view)*: Potongan atap otomatis memperlihatkan denah interior layout.
  - *Aerial 3/4*: Sudut pandang isometrik dari atas lobby.
  - *Mata pengunjung SPIT & Indomaret*: Perspektif arah jalan pengunjung saat masuk dari lobby samping.
- **Mode Tampilan**:
  - *Lobby Siang*: Pencahayaan natural atrium skylight dan pantulan marmer lantai.
  - *Presentasi Gelap (Malam)*: Menghidupkan efek pendaran LED strip, cove light, lightbox grafis, dan neon flex.
- **Breakdown Aset 1 per 1 (Lihat Aset Terpisah)**:
  - Klik modul mana pun di panel kiri (A01–A15 atau B01–B14) lalu klik tombol *Lihat aset terpisah*.
  - Kamera otomatis mengisolasi modul tersebut ke atas podium turntable studio 360° untuk inspeksi detail konstruksi.
- **Simpan Render Resolusi Tinggi**:
  - Tombol *Simpan PNG 4K* (3840 × 2160) dan *PNG Full HD* (1920 × 1080) untuk mengekspor gambar seketika dari sudut pandang mana pun.

---

## 3. Galeri Render Siap Pitch (Folder `booth-3d/renders/`)

Semua berkas render telah disimpan dalam resolusi tinggi di folder `booth-3d/renders/`:

1. `overview.png` — Pandangan penuh 30 meter kedua booth di Lobby Indofood Tower.
2. `night_overview.png` — Tampilan malam dramatis dengan pendaran neon dan lightbox.
3. `chitato_view.png` — Zona Chitato (standee TREASURE, wave challenge, sculpture, selling).
4. `jetz_view.png` — Zona JetZ (loker pastel, 8 standee Hearts2Hearts, headphone stage, charm corner).
5. `stage_view.png` — Panggung raksasa headphone silent disco dan Main Stage DJ booth.
6. `keychain_view.png` — Detail makro gantungan kunci 3D (ring, rantai, charm mini pack, hati, bintang, chip).
7. `charm_view.png` — Suasana meja charm making interaktif dengan baki manik dan peserta.
8. `lightbox_view.png` — Deretan lightbox TREASURE Team Lite & Team Wavy setinggi 180 cm.
9. `selling_view.png` — Konter kasir Chitato, roll-up banner, dan display paket Rp 35.000.
10. `divider_view.png` — Partisi pembatas loker sekolah yang memisahkan kedua brand.
11. `plan_view.png` — Denah tata letak interior arsitektural (cutaway plan).
12. `aerial_view.png` — Perspektif udara 3/4 memperlihatkan integrasi dengan concourse gedung.
13. `iso_B08.png` — Inspeksi turntable studio: Pegboard Gantungan Kunci.
14. `iso_B04.png` — Inspeksi turntable studio: Giant Headphone Stage & DJ Desk.
15. `iso_A06.png` — Inspeksi turntable studio: Neon Arch & Kiosk Wave Challenge.
16. `iso_B11.png` — Inspeksi turntable studio: Meja Charm Making & Stool Pastel.
17. `iso_A01.png` — Inspeksi turntable studio: Event Desk Kasir Chitato.
18. `iso_A04.png` — Inspeksi turntable studio: Totem Pillow Pack Raksasa.

---

## 4. Catatan Teknis & Transparansi Visual

1. **Akurasi Geometri vs Placeholder Visual:**
   - Semua modul arsitektur, panggung, meja, rak, lampu track, dan perintilannya (gantungan kunci, rantai jump ring, bungkus bantal snack) dimodelkan secara geometri 3D akurat berbasis ukuran meter nyata.
   - Figur manusia dan ilustrasi wajah anggota idol (TREASURE & Hearts2Hearts) dibuat secara prosedural sebagai **placeholder skala & tata letak**. Untuk tahap produksi dan cetak fisik akhir, tim produksi tinggal menyematkan berkas Key Visual (KV) foto resmi beresolusi tinggi dari pihak agensi/klien.
2. **Kepatuhan Lisensi & Hak Kekayaan Intelektual (IP):**
   - Menghindari penggunaan aset bajakan; seluruh grafis merek (logo Chitato, JetZ, slogan, kemasan rasa) dibuat ulang dalam grafik vektor/kanvas berlisensi internal proyek.
