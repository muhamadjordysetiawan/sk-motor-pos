-- ============================================================
-- SK Motor POS — 01: Extensions
-- Jalankan ini PERTAMA di Supabase SQL Editor
-- ============================================================

-- UUID generator (sudah tersedia di Supabase, tapi pastikan aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search untuk pencarian produk & kendaraan
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Untuk enkripsi (opsional, dipakai Supabase Auth)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
