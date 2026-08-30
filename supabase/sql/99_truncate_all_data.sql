-- PERINGATAN: SCRIPT INI AKAN MENGHAPUS SELURUH DATA TRANSAKSI, PRODUK, DAN KENDARAAN.
-- AKUN OWNER DAN CASHIER AKAN TETAP AMAN (TIDAK DIHAPUS).

-- 1. Hapus transaksi & detailnya
TRUNCATE TABLE public.transaction_details CASCADE;
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.expenses CASCADE;

-- 2. Hapus stok dan produk
TRUNCATE TABLE public.stock_movements CASCADE;
TRUNCATE TABLE public.products_services CASCADE;

-- 3. Hapus database kendaraan
TRUNCATE TABLE public.vehicles CASCADE;

-- 4. Hapus karyawan (mekanik, pencuci, pelayan) HANYA jika Anda juga ingin mereset karyawan
-- (Akun owner dan cashier akan tetap ada)
DELETE FROM auth.users 
WHERE id IN (
  SELECT id FROM public.profiles 
  WHERE role IN ('mechanic', 'washer', 'waiter')
);

-- (Opsional) Jika Anda juga ingin menghapus Kategori Produk:
-- TRUNCATE TABLE public.categories CASCADE;
