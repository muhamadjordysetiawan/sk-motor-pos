# SK Motor POS — Panduan Lengkap

SK Motor POS adalah sistem Point of Sales yang dirancang khusus untuk bisnis dengan unit gabungan: **Bengkel, Steam, dan Cafe**. 
Dibangun dengan Next.js 16, Supabase, Zustand, dan Tailwind CSS.

---

## 1. Fitur Utama
1. **Multi-Unit Bisnis**: Satu kasir bisa melayani Bengkel, Steam, dan Cafe sekaligus dalam satu struk.
2. **Manajemen Stok Otomatis**: Stok suku cadang/barang berkurang otomatis setelah transaksi selesai.
3. **Database Kendaraan**: Melacak riwayat servis dan pencucian berdasarkan nomor polisi.
4. **Komisi Staff (Mekanik & Washer)**: Assign mekanik atau washer ke tiap item layanan.
5. **E-Receipt WhatsApp**: Integrasi dengan API Fonnte untuk mengirim struk langsung ke WA pelanggan.
6. **Laporan Keuangan**: Dashboard metrik, tabel transaksi (bisa di-void), pencatatan pengeluaran operasional.
7. **Role-Based Access**: 
   - **Owner**: Akses semua (Laporan, Staff, Produk, Pengaturan).
   - **Kasir**: Hanya akses POS dan Database Kendaraan.

---

## 2. Cara Menjalankan Aplikasi

Aplikasi ini sudah dibuatkan file launcher khusus agar mudah dijalankan:

### Opsi A: Menggunakan `.bat` (Disarankan untuk testing cepat)
1. Buka folder `sk-motor-pos`.
2. Double-click file `SK Motor POS.bat`.
3. Server akan nyala otomatis dan browser akan terbuka di `http://localhost:3000`.

### Opsi B: Menggunakan `.exe` (Disarankan untuk operasional kasir)
1. Buka folder `sk-motor-pos/dist`.
2. Double-click `SKMotorPOS.exe`.
3. Sama seperti .bat, ini akan mengecek server dan membuka browser.

### Opsi C: Manual via Terminal
1. Buka terminal di dalam folder `sk-motor-pos`.
2. Ketik `npm run dev`.
3. Buka browser ke `http://localhost:3000`.

---

## 3. Akun Default (Supabase)

Aplikasi ini menggunakan Supabase Auth. Anda perlu membuat user dari dashboard Supabase Anda (`Authentication -> Users -> Add user`).
Setelah user terbuat, set role-nya melalui Supabase SQL Editor:

```sql
-- Jadikan user sebagai Owner
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'owner')
WHERE email = 'owner@skmotor.com';

-- Jadikan user sebagai Kasir
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'cashier')
WHERE email = 'kasir@skmotor.com';
```

---

## 4. Panduan Kasir (POS)

1. **Pilih Kendaraan (Opsional)**: Ketik nomor polisi di kolom pencarian kanan. Jika belum ada, Anda bisa membuatnya dari menu "Database Kendaraan".
2. **Pilih Produk**: Klik produk di panel kiri. Filter berdasarkan unit bisnis (Bengkel/Steam/Cafe).
3. **Assign Mekanik/Washer**: Untuk item jenis "Service" (misal: Ganti Oli, Cuci Mobil), klik tombol **Assign** di keranjang, lalu pilih nama mekanik/washer yang bertugas.
4. **Diskon**: Jika ada diskon per item, klik tombol **Diskon** di item tersebut.
5. **WhatsApp**: Masukkan nomor WA pelanggan (format: `08...` atau `628...`) di kolom input keranjang jika ingin mengirim struk digital.
6. **Bayar**: Klik tombol "Bayar".
7. **Metode & Kembalian**: Pilih metode pembayaran (Cash/Transfer/QRIS/Piutang). Khusus Cash, masukkan jumlah uang yang diterima, sistem akan otomatis menghitung kembalian.
8. **Struk**: Setelah sukses, struk akan muncul di layar (bisa diprint langsung). Jika nomor WA diisi (dan API Fonnte sudah di-setting), struk akan otomatis terkirim.

---

## 5. Pengaturan & Integrasi WhatsApp (Owner)

Halaman pengaturan hanya bisa diakses oleh **Owner**.

1. Login sebagai Owner.
2. Buka menu **Pengaturan** (ikon gerigi di bawah sidebar).
3. **Profil Bisnis**: Isi nama toko, alamat, dan tagline. Ini akan tampil di header struk.
4. **Integrasi WhatsApp**:
   - Buka website [fonnte.com](https://fonnte.com/) dan buat akun.
   - Sambungkan nomor WhatsApp toko Anda (scan QR code di Fonnte).
   - Masuk ke menu "Device" di Fonnte, copy **Token (API Key)**.
   - Paste Token tersebut di kolom "Fonnte API Key" di Pengaturan SK Motor.
   - Masukkan juga nomor WA pengirim (format: `628...`).
5. Klik **Simpan Pengaturan**. Mulai sekarang, setiap transaksi dengan nomor WA akan otomatis dikirimkan struknya.

---

## 6. Laporan & Void Transaksi (Owner)

1. Buka menu **Laporan Keuangan**.
2. Anda bisa memfilter berdasarkan tanggal, status, dan unit bisnis.
3. Di tabel transaksi, klik baris transaksi (No. Invoice) untuk melihat detail item yang dibeli.
4. **Void Transaksi**:
   - Hanya transaksi berstatus "Selesai" yang bisa di-void.
   - Klik tombol **Void** berwarna merah.
   - Masukkan alasan void.
   - **Perhatian**: Melakukan void akan otomatis *mengembalikan stok produk* yang sebelumnya terjual. Status akan berubah menjadi "Void" dan total pemasukan akan dikurangi.
5. **Pengeluaran**: Klik "Catat Pengeluaran" untuk memasukkan data belanja bahan baku, gaji, listrik, dll. Pengeluaran ini akan mengurangi "Laba Kotor".

---

## 7. Troubleshooting (Masalah Umum)

- **"Kenapa produk saya tidak muncul di POS?"**
  Pastikan saat membuat produk, statusnya adalah "Aktif" dan Stok > 0 (jika jenisnya adalah Produk, bukan Jasa).
- **"Struk WA tidak masuk?"**
  Pastikan Device WhatsApp di dashboard Fonnte Anda dalam status "Connected". Cek kuota pengiriman Fonnte Anda.
- **"Lupa password Owner?"**
  Ganti langsung melalui menu Pengaturan (jika masih bisa login), atau gunakan fitur "Send password recovery" dari dashboard Supabase Anda.
- **"Port 3000 sudah terpakai"**
  Tutup terminal/CMD lama yang mungkin masih menjalankan server. Atau restart komputer Anda jika server ter-freeze di background.
