# Checklist Persetujuan Gate 0 (REVIEW.md)

Harap periksa denah 2D di `concepts/plan-v0.svg` (atau buka `concepts/plan-v0.html` langsung di browser).  
Beri tanda centang `[x]` setelah menyetujui poin-poin berikut:

- [ ] **Alur Pengunjung:** Zona A (Foto Standee ➔ Main Game Wave ➔ Tebus & Kasir) dan Zona B (Foto Locker ➔ Stage Gesrek ➔ Beli Paket ➔ Meja Charm Making) sudah logis dan tidak bertabrakan.
- [ ] **Ukuran & Spasi:**
  - Lebar lorong antrean kasir Zona A (1.390 mm) dan Zona B (1.490 mm) aman dari penumpukan pengunjung.
  - Clearance area foto Zona A (x = 2,6..5,4 m) dan Zona B (x = 17,0..19,6 m) cukup lega untuk grup foto.
- [ ] **Karakter Visual:** Pembeda Chitato (berani, bold, wave oranye-hijau) vs JetZ (suasana kelas, playful, biru-pink) sudah tegas terpisah di garis x = 15 m.
- [ ] **Toleransi Batasan Gedung:** Batas tinggi maks 2,5 m aman (tertinggi 2,45 m pada Arch), karpet proteksi hitam 32 × 6 m mengelilingi seluruh booth.
- [ ] **Modul Asumsi (Assumed):** Ukuran panggung JetZ (2,0 × 1,5 m), layar TV 65", dan tebal locker (400 mm) disetujui sebagai acuan awal.

---

### Cara Memberi Persetujuan Resmi (Menuju Gate 1):
Setelah semua poin di atas cocok, ubah status di `spec/booth.spec.json`:
```json
"meta": {
  "status": "approved",
  "approved_by": "Dimitri",
  "approved_at": "2026-10-02"
}
```
Lalu kita bisa langsung meluncur ke pembuatan **3D HTML Viewer interaktif**!
