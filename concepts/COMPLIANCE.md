# Checklist Kepatuhan Batasan & Kebutuhan (Compliance Matrix)

Tanggal: 2 Oktober 2026  
Status Dokumen: **Gate 0 Review**  
Referensi: `spec/booth.spec.json` v0.1.0

---

## 1. Kepatuhan Batasan Venue (IFM / Indofood Tower)

| ID | Batasan Venue | Realisasi Desain di Spec | Status | Catatan Verifikasi |
|---|---|---|:---:|---|
| **V-01** | Footprint maks 30 × 4 m (termasuk listrik) | Dibatasi tepat 30.000 × 4.000 mm | **LULUS** | Validator memastikan `x: 0..30`, `y: 0..4`. |
| **V-02** | Tinggi maks 2,5 m | Elemen tertinggi 2,45 m (A-ARCH) | **LULUS** | `max_height: 2.450 m` di bawah batas 2.500 mm. |
| **V-03** | Karpet & lakban hitam wajib + proteksi 1 m di sekeliling | Karpet 32 × 6 m (`rect: [-1, -1, 31, 5]`) | **LULUS** | Vinyl bergambar dipasang di atas karpet hitam. |
| **V-04** | Dilarang suara dominan | Audio game via headset / volume rendah | **LULUS** | Speaker panggung JetZ B07 hanya dekorasi. |
| **V-05** | Dilarang spanduk gantung / umbul-umbul | Hanya standing banner & totem mandiri | **LULUS** | Tidak ada struktur gantung ke plafon lobby. |
| **V-06** | Dilarang kru *shooting* komersial | Titik interaktif mandiri via HP pengunjung | **LULUS** | Tidak ada kru video / lighting studio. |
| **V-07** | SPG maks 3 orang per booth | Alur difokuskan mandiri (QRIS & signage) | **LULUS** | Perlu konfirmasi apakah kasir dihitung SPG (Q-08). |
| **V-08** | Storage B1 disediakan IFM | Rak stok booth hanya untuk harian (360 pack) | **LULUS** | Rak A10 & B11 ukuran ramping (0,9 × 0,5 m). |

---

## 2. Kepatuhan Kebutuhan Brand Chitato × TREASURE (Zona A)

| ID | Kebutuhan Brand | Modul Penjawab | Status | Catatan |
|---|---|:---:|:---:|---|
| **C-01** | Visual kuat tema HQ TVC (Oranye / Hijau) | A01, A04, A05 | **LULUS** | Pembagian dinding Wavy (oranye) & Lite (hijau). |
| **C-02** | Game interaktif kuis | A07 (Arch + LED 65") | **LULUS** | Layar portrait 65" + kamera di tengah arch. |
| **C-03** | Merchandise eksklusif tas (3 warna) | A08 (Plinth silinder) | **LULUS** | Display tas di samping area kasir. |
| **C-04** | Area jual menyatu & alur kupon QR | A07 ➔ A09 (Desk) | **LULUS** | Alur: foto ➔ main ➔ antrean kasir. |
| **C-05** | Urutan 9 standee TREASURE terkunci | A02 (A-STD) | **LULUS** | Urutan ki-ka terkunci di validator (9 personil). |
| **C-06** | POSM resmi: Flexy Rack, Event Desk, Totem | A06, A09, A11, A12 | **LULUS** | Dimensi `given` dipetakan presisi. |

---

## 3. Kepatuhan Kebutuhan Brand JetZ × Hearts2Hearts (Zona B)

| ID | Kebutuhan Brand | Modul Penjawab | Status | Catatan |
|---|---|:---:|:---:|---|
| **J-01** | Nuansa kelas ceria (Biru + Pink) | B02, B03, B06 | **LULUS** | Dinding biru, locker sekolah, meja kayu props. |
| **J-02** | Aktivitas motorik "Gesrek Challenge" | B07 (Main Stage) | **LULUS** | Panggung mini 2,0 × 1,5 m level 0,5 m. |
| **J-03** | Integrasi 3 rasa snack | B05 (Signage Varian) | **LULUS** | Sweet Stick, Tortilla, Croissant di atas standee. |
| **J-04** | **Wajib:** Meja charm making DIY | B08 (Meja 2,4 m) + B09 | **LULUS** | 4 bangku stool untuk aktivitas menghias tas. |
| **J-05** | Locker sebagai divider booth | B01 (Divider x=15) | **LULUS** | Memanfaatkan 5 modul locker (4,0 m kedalaman). |
| **J-06** | Standee Hearts2Hearts 8 personil | B04 (B-STD) | **LULUS** | Tinggi 165 cm dikelompokkan per varian rasa. |

---

## 4. Daftar Modul "ASSUMED" (Perlu Konfirmasi)

Modul-modul ini digambar dengan **garis putus-putus oranye** di denah karena keterangan di brief ambigu:

1. **A-LED (A07)**: Ukuran layar TV LED 65 inci (diasumsikan portrait 0,81 × 1,44 m).
2. **B-DIV (B01)**: Tebal partisi locker divider diasumsikan 400 mm.
3. **B-SIGN-SWEET / TORT / CROIS (B05)**: Di brief tertulis "T 1.5 cm" (jelas typo, diasumsikan tinggi papan 500 mm).
4. **B-STAGE (B07)**: Ukuran panggung tertulis "2 × 0.5 × 2 m" (diasumsikan Lebar 2,0 m × Dalam 1,5 m × Tinggi panggung 0,5 m).
