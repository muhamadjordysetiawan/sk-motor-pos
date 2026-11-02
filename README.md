<div align="center">

# 🏍️ SK MOTOR POS
### All-in-One Point of Sale & Workshop Management System

**Sistem Kasir Terintegrasi Multi-Unit: Bengkel Motor, Cuci Steam, dan Kafe dalam Satu Struk Transaksi**

[![Next.js](https://img.shields.io/badge/Next.js-15.x-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![WhatsApp](https://img.shields.io/badge/Fonnte-WhatsApp_E--Receipt-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://fonnte.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br />

<p align="center">
  Solusi kasir modern dan manajemen operasional terpadu yang dirancang untuk otomotif terintegrasi. Memungkinkan kasir melayani pesanan suku cadang bengkel, jasa pengerjaan servis mekanik, cuci steam kendaraan, dan pesanan makanan/minuman kafe sekaligus dalam satu transaksi terpadu dengan e-receipt otomatis via WhatsApp.
</p>

[Fitur Unggulan](#-fitur-unggulan) •
[Arsitektur Alur Transaksi](#-arsitektur-alur-transaksi) •
[Tech Stack](#-tech-stack) •
[Panduan Menjalankan](#-panduan-menjalankan) •
[Manajemen Peran & Akun](#-manajemen-peran--role) •
[Struktur Proyek](#-struktur-proyek) •
[Lisensi](#-lisensi)

</div>

---

## ✨ Fitur Unggulan

- 🛒 **Multi-Unit Business in One Receipt**: Satu keranjang transaksi dapat mencakup 3 unit usaha sekaligus (**Bengkel Motor**, **Cuci Steam**, dan **Cafe**) dengan pemisahan kategori rapi pada struk cetak maupun digital.
- 📦 **Automated Inventory Tracking**: Pengurangan stok suku cadang & inventaris kafe secara otomatis dan realtime begitu transaksi pembayaran berhasil diproses.
- 🛵 **Database Kendaraan & Riwayat Servis**: Pelacakan riwayat servis, penggantian sparepart, dan pencucian berdasarkan nomor plat kendaraan konsumen.
- 👨‍🔧 **Sistem Komisi Staf Fleksibel**: Penugasan mekanik atau petugas washer pada tiap item layanan jasa untuk kalkulasi pembagian komisi harian/bulanan secara otomatis.
- 📲 **E-Receipt WhatsApp Otomatis**: Integrasi langsung dengan API Fonnte untuk mengirimkan bukti pembayaran & rincian nota langsung ke nomor WhatsApp pelanggan.
- 📊 **Laporan Finansial & Dashboard Metrik**: Ringkasan omzet harian, laba rugi kotor, riwayat transaksi lengkap dengan fitur *void* terproteksi, dan pencatatan kas keluar operasional.
- 🔐 **Role-Based Access Control (RBAC)**:
  - **Owner**: Akses penuh ke dashboard analitik, laporan laba/omzet, kelola staf & komisi, inventori produk, dan pengaturan sistem.
  - **Kasir**: Akses terisolasi khusus ke terminal POS dan pencarian database riwayat kendaraan.

---

## 🔄 Arsitektur Alur Transaksi

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan as 🛵 Pelanggan
    actor Kasir as 👨‍💼 Kasir
    participant POS as 💻 Terminal POS (Next.js + Zustand)
    participant DB as 🗄️ Supabase (PostgreSQL + RLS)
    participant WA as 📲 Fonnte WhatsApp Gateway

    Pelanggan->>Kasir: Bawa Kendaraan (Servis / Cuci) & Pesan Makanan
    Kasir->>POS: Masukkan No. Polisi & Pilih Item (Bengkel + Steam + Cafe)
    Kasir->>POS: Assign Mekanik / Washer ke Item Jasa
    Kasir->>POS: Proses Pembayaran (Tunai / QRIS / Transfer)
    POS->>DB: Simpan Transaksi & Detail Penjualan
    POS->>DB: Potong Stok Sparepart / Inventori
    POS->>DB: Catat Akumulasi Komisi Staf
    POS->>WA: Kirim Struk Digital ke Nomor WA Pelanggan
    WA-->>Pelanggan: Notifikasi Struk WhatsApp Diterima
    POS-->>Kasir: Cetak Nota Struk Thermal Kasir
```

---

## 🛠️ Tech Stack

| Kategori | Teknologi | Peran & Penggunaan |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) | Full-stack React Framework (App Router & API Routes) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | Strict typing end-to-end |
| **Backend & Database** | [Supabase](https://supabase.com/) | PostgreSQL, Autentikasi Pengguna, dan Row-Level Security |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Manajemen state keranjang kasir (cart) yang cepat dan reaktif |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Antarmuka kasir responsif & ramah layar sentuh (touchscreen) |
| **Notifikasi** | Fonnte API | WhatsApp Gateway otomatis untuk pengiriman e-receipt |
| **Desktop Launcher** | Batch & Exe Wrapper | Kemudahan eksekusi 1-klik untuk staf kasir di toko fisik |

---

## 🚀 Panduan Menjalankan

### Opsi 1: Menggunakan Launcher Cepat (Operasional Toko)
* **Windows Desktop**: Klik dua kali file `SK Motor POS.bat` atau executable di folder `dist/SKMotorPOS.exe`. Server lokal akan berjalan otomatis dan langsung membuka browser di `http://localhost:3000`.

### Opsi 2: Manual via Terminal (Development)

1. **Clone repository**:
   ```bash
   git clone git@github.com:muhamadjordysetiawan/sk-motor-pos.git
   cd sk-motor-pos
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**:
   Buat file `.env.local` di root direktori:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   FONNTE_TOKEN=your_fonnte_whatsapp_api_token
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 👥 Manajemen Peran (Role)

Sistem menggunakan Supabase Authentication dengan metadata role. Buat akun di dashboard Supabase (`Authentication -> Users -> Add user`), lalu berikan role via Supabase SQL Editor:

```sql
-- Role: Owner (Akses Penuh)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'owner')
WHERE email = 'owner@skmotor.com';

-- Role: Kasir (Akses POS & Database Kendaraan)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'cashier')
WHERE email = 'kasir@skmotor.com';
```

---

## 📂 Struktur Proyek

```text
sk-motor-pos/
├── dist/                   # Standalone desktop executable launcher
├── public/                 # Logo, ikon, dan aset statis nota
├── src/
│   ├── app/                # Next.js App Router (POS, Dashboard, Laporan)
│   ├── components/         # Komponen kasir (Cart, ProductGrid, ReceiptModal)
│   ├── hooks/              # Custom hooks inventori & transaksi
│   ├── lib/                # Client Supabase & helper format rupiah
│   └── stores/             # Zustand store (cart, multi-unit filter, session)
├── supabase/               # SQL migrations & schema definisi tabel
├── SK Motor POS.bat        # 1-Click launcher untuk operasional Windows
├── package.json
└── tsconfig.json
```

---

## 📄 Lisensi

Didistribusikan di bawah lisensi [MIT License](LICENSE).

---

<div align="center">
  Dikembangkan untuk efisiensi bisnis oleh <b>Muhamad Jordy Setiawan</b>
</div>
