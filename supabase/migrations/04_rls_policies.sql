-- ============================================================
-- SK Motor POS — 04: Row Level Security (RLS)
-- ============================================================

-- Aktifkan RLS di semua tabel
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses            ENABLE ROW LEVEL SECURITY;

-- Helper function: ambil role user yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_cashier_or_above()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('owner','cashier')
  );
$$;

-- ══════════════════════════════════════════════════════════════
-- PROFILES
-- ══════════════════════════════════════════════════════════════

-- Owner: baca semua profil
DROP POLICY IF EXISTS "owner_read_all_profiles" ON public.profiles;
CREATE POLICY "owner_read_all_profiles" ON public.profiles
  FOR SELECT USING (public.is_owner());

-- Semua user login: baca profil sendiri
DROP POLICY IF EXISTS "self_read_profile" ON public.profiles;
CREATE POLICY "self_read_profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Owner: ubah semua profil
DROP POLICY IF EXISTS "owner_update_profiles" ON public.profiles;
CREATE POLICY "owner_update_profiles" ON public.profiles
  FOR UPDATE USING (public.is_owner());

-- Owner: insert profil baru (untuk tambah staff)
DROP POLICY IF EXISTS "owner_insert_profiles" ON public.profiles;
CREATE POLICY "owner_insert_profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_owner());

-- System: trigger bisa insert profil baru (SECURITY DEFINER sudah handle ini)

-- ══════════════════════════════════════════════════════════════
-- CATEGORIES
-- ══════════════════════════════════════════════════════════════

-- Semua user login bisa baca kategori
DROP POLICY IF EXISTS "authenticated_read_categories" ON public.categories;
CREATE POLICY "authenticated_read_categories" ON public.categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Owner: full CRUD
DROP POLICY IF EXISTS "owner_manage_categories" ON public.categories;
CREATE POLICY "owner_manage_categories" ON public.categories
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ══════════════════════════════════════════════════════════════
-- PRODUCTS_SERVICES
-- ══════════════════════════════════════════════════════════════

-- Kasir & Owner: baca semua produk aktif
DROP POLICY IF EXISTS "authenticated_read_products" ON public.products_services;
CREATE POLICY "authenticated_read_products" ON public.products_services
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Owner: baca semua (termasuk non-aktif)
DROP POLICY IF EXISTS "owner_read_all_products" ON public.products_services;
CREATE POLICY "owner_read_all_products" ON public.products_services
  FOR SELECT USING (public.is_owner());

-- Owner: full CRUD
DROP POLICY IF EXISTS "owner_manage_products" ON public.products_services;
CREATE POLICY "owner_manage_products" ON public.products_services
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

-- System trigger: boleh update stok (SECURITY DEFINER pada function)

-- ══════════════════════════════════════════════════════════════
-- VEHICLES
-- ══════════════════════════════════════════════════════════════

-- Kasir & Owner: baca & insert kendaraan
DROP POLICY IF EXISTS "cashier_read_vehicles" ON public.vehicles;
CREATE POLICY "cashier_read_vehicles" ON public.vehicles
  FOR SELECT USING (public.is_cashier_or_above());

DROP POLICY IF EXISTS "cashier_insert_vehicles" ON public.vehicles;
CREATE POLICY "cashier_insert_vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (public.is_cashier_or_above());

-- Owner: update & delete kendaraan
DROP POLICY IF EXISTS "owner_manage_vehicles" ON public.vehicles;
CREATE POLICY "owner_manage_vehicles" ON public.vehicles
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ══════════════════════════════════════════════════════════════
-- TRANSACTIONS
-- ══════════════════════════════════════════════════════════════

-- Kasir: baca transaksi milik sendiri
DROP POLICY IF EXISTS "cashier_read_own_transactions" ON public.transactions;
CREATE POLICY "cashier_read_own_transactions" ON public.transactions
  FOR SELECT USING (cashier_id = auth.uid());

-- Owner: baca semua transaksi
DROP POLICY IF EXISTS "owner_read_all_transactions" ON public.transactions;
CREATE POLICY "owner_read_all_transactions" ON public.transactions
  FOR SELECT USING (public.is_owner());

-- Kasir & Owner: buat transaksi baru
DROP POLICY IF EXISTS "cashier_insert_transactions" ON public.transactions;
CREATE POLICY "cashier_insert_transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    public.is_cashier_or_above() AND cashier_id = auth.uid()
  );

-- Kasir: update transaksi sendiri (dari draft ke completed)
DROP POLICY IF EXISTS "cashier_update_own_transactions" ON public.transactions;
CREATE POLICY "cashier_update_own_transactions" ON public.transactions
  FOR UPDATE USING (
    cashier_id = auth.uid()
    AND status = 'draft'        -- kasir hanya bisa ubah yang masih draft
  );

-- Owner: update semua transaksi (termasuk void)
DROP POLICY IF EXISTS "owner_update_all_transactions" ON public.transactions;
CREATE POLICY "owner_update_all_transactions" ON public.transactions
  FOR UPDATE USING (public.is_owner());

-- ══════════════════════════════════════════════════════════════
-- TRANSACTION_DETAILS
-- ══════════════════════════════════════════════════════════════

-- Kasir: baca detail transaksi milik sendiri
DROP POLICY IF EXISTS "cashier_read_own_details" ON public.transaction_details;
CREATE POLICY "cashier_read_own_details" ON public.transaction_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id AND t.cashier_id = auth.uid()
    )
  );

-- Owner: baca semua detail
DROP POLICY IF EXISTS "owner_read_all_details" ON public.transaction_details;
CREATE POLICY "owner_read_all_details" ON public.transaction_details
  FOR SELECT USING (public.is_owner());

-- Kasir & Owner: insert detail (hanya ke transaksi draft sendiri)
DROP POLICY IF EXISTS "cashier_insert_details" ON public.transaction_details;
CREATE POLICY "cashier_insert_details" ON public.transaction_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
        AND t.cashier_id = auth.uid()
        AND t.status = 'draft'
    )
  );

-- Kasir & Owner: update & delete detail di transaksi draft
DROP POLICY IF EXISTS "cashier_manage_draft_details" ON public.transaction_details;
CREATE POLICY "cashier_manage_draft_details" ON public.transaction_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
        AND (t.cashier_id = auth.uid() OR public.is_owner())
        AND t.status = 'draft'
    )
  );

-- ══════════════════════════════════════════════════════════════
-- STOCK_MOVEMENTS
-- ══════════════════════════════════════════════════════════════

-- Owner: baca semua pergerakan stok
DROP POLICY IF EXISTS "owner_read_stock_movements" ON public.stock_movements;
CREATE POLICY "owner_read_stock_movements" ON public.stock_movements
  FOR SELECT USING (public.is_owner());

-- Kasir: baca stok yang terkait transaksi sendiri
DROP POLICY IF EXISTS "cashier_read_own_stock_movements" ON public.stock_movements;
CREATE POLICY "cashier_read_own_stock_movements" ON public.stock_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id AND t.cashier_id = auth.uid()
    )
  );

-- Insert hanya melalui trigger (SECURITY DEFINER), bukan langsung dari client

-- ══════════════════════════════════════════════════════════════
-- EXPENSES
-- ══════════════════════════════════════════════════════════════

-- Owner: full CRUD
DROP POLICY IF EXISTS "owner_manage_expenses" ON public.expenses;
CREATE POLICY "owner_manage_expenses" ON public.expenses
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());
