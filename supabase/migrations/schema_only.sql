-- ================================================================
-- SK MOTOR POS — SCHEMA ONLY (Tabel + Functions + RLS)
-- Jalankan file INI DULU, lalu seed_data_fixed.sql
-- ================================================================


-- ── EXTENSIONS ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── TABEL: profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT        NOT NULL,
  role       TEXT        NOT NULL DEFAULT 'cashier'
               CHECK (role IN ('owner','cashier','mechanic','washer','waiter')),
  phone      TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TABEL: categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  business_unit TEXT        NOT NULL CHECK (business_unit IN ('repair','wash','cafe','general')),
  icon          TEXT        DEFAULT 'package',
  sort_order    INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TABEL: products_services ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products_services (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id         UUID          REFERENCES public.categories(id) ON DELETE SET NULL,
  name                TEXT          NOT NULL,
  sku                 TEXT          UNIQUE,
  description         TEXT,
  type                TEXT          NOT NULL CHECK (type IN ('product','service')),
  business_unit       TEXT          NOT NULL CHECK (business_unit IN ('repair','wash','cafe','general')),
  price               NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price          NUMERIC(12,2) DEFAULT 0,
  stock_qty           INTEGER       NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER       NOT NULL DEFAULT 5,
  unit                TEXT          DEFAULT 'pcs',
  is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── TABEL: vehicles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vehicles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate TEXT        NOT NULL UNIQUE,
  owner_name    TEXT        NOT NULL,
  phone         TEXT,
  vehicle_type  TEXT        NOT NULL CHECK (vehicle_type IN ('motor','mobil','truk','lainnya')),
  brand         TEXT,
  model         TEXT,
  color         TEXT,
  year          INTEGER,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TABEL: transactions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT          UNIQUE,
  vehicle_id     UUID          REFERENCES public.vehicles(id) ON DELETE SET NULL,
  cashier_id     UUID          NOT NULL REFERENCES public.profiles(id),
  status         TEXT          NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','completed','voided')),
  payment_method TEXT          CHECK (payment_method IN ('cash','transfer','qris','piutang')),
  subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid    NUMERIC(12,2) DEFAULT 0,
  change_amount  NUMERIC(12,2) DEFAULT 0,
  notes          TEXT,
  wa_phone       TEXT,
  voided_by      UUID          REFERENCES public.profiles(id),
  void_reason    TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMPTZ,
  voided_at      TIMESTAMPTZ
);

-- ── TABEL: transaction_details ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transaction_details (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id    UUID          NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id        UUID          NOT NULL REFERENCES public.products_services(id),
  assigned_staff_id UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  qty               INTEGER       NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── TABEL: stock_movements ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID        NOT NULL REFERENCES public.products_services(id),
  transaction_id UUID        REFERENCES public.transactions(id) ON DELETE SET NULL,
  qty_change     INTEGER     NOT NULL,
  stock_after    INTEGER     NOT NULL,
  reason         TEXT        NOT NULL,
  notes          TEXT,
  created_by     UUID        REFERENCES public.profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TABEL: expenses ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_by   UUID          NOT NULL REFERENCES public.profiles(id),
  business_unit TEXT          NOT NULL CHECK (business_unit IN ('repair','wash','cafe','general')),
  category      TEXT          NOT NULL,
  description   TEXT          NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expense_date  DATE          NOT NULL DEFAULT CURRENT_DATE,
  receipt_url   TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── INDEX ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_business_unit ON public.products_services(business_unit);
CREATE INDEX IF NOT EXISTS idx_products_type          ON public.products_services(type);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm     ON public.products_services USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_transactions_status    ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier   ON public.transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vehicle   ON public.transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date      ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_txdetails_transaction  ON public.transaction_details(transaction_id);
CREATE INDEX IF NOT EXISTS idx_txdetails_staff        ON public.transaction_details(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_stockmove_product      ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date          ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_trgm    ON public.vehicles USING GIN (license_plate gin_trgm_ops);


-- ── FUNCTION: auto-buat profil saat user baru ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cashier')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── FUNCTION: auto-update updated_at ─────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_updated_at ON public.profiles;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON public.products_services;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.products_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON public.vehicles;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── FUNCTION: auto-generate nomor invoice ────────────────────────
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_date    TEXT;
  v_count   INTEGER;
BEGIN
  IF NEW.invoice_number IS NOT NULL THEN RETURN NEW; END IF;
  v_date := TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO v_count FROM public.transactions
  WHERE created_at::DATE = (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE;
  NEW.invoice_number := 'SK-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_invoice ON public.transactions;
CREATE TRIGGER trg_generate_invoice BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- ── FUNCTION: hitung total transaksi ─────────────────────────────
CREATE OR REPLACE FUNCTION public.recalculate_transaction_total(p_transaction_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE v_subtotal NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(subtotal), 0) INTO v_subtotal
  FROM public.transaction_details WHERE transaction_id = p_transaction_id;
  UPDATE public.transactions
  SET subtotal = v_subtotal, total = GREATEST(0, v_subtotal - discount + tax)
  WHERE id = p_transaction_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_total_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_transaction_total(OLD.transaction_id);
    RETURN OLD;
  END IF;
  NEW.subtotal := (NEW.unit_price - COALESCE(NEW.discount, 0)) * NEW.qty;
  PERFORM public.recalculate_transaction_total(NEW.transaction_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalc_on_insert_update ON public.transaction_details;
CREATE TRIGGER trg_recalc_on_insert_update BEFORE INSERT OR UPDATE ON public.transaction_details
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_fn();

DROP TRIGGER IF EXISTS trg_recalc_on_delete ON public.transaction_details;
CREATE TRIGGER trg_recalc_on_delete AFTER DELETE ON public.transaction_details
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_fn();

-- ── FUNCTION: deduct/restore stok ────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_transaction_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_detail    RECORD;
  v_new_stock INTEGER;
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'draft' THEN
    NEW.completed_at := NOW();
    FOR v_detail IN
      SELECT td.product_id, td.qty, ps.stock_qty
      FROM public.transaction_details td
      JOIN public.products_services ps ON ps.id = td.product_id
      WHERE td.transaction_id = NEW.id AND ps.type = 'product'
    LOOP
      IF v_detail.stock_qty < v_detail.qty THEN
        RAISE EXCEPTION 'Stok tidak cukup: %. Tersedia: %, dibutuhkan: %',
          v_detail.product_id, v_detail.stock_qty, v_detail.qty;
      END IF;
      v_new_stock := v_detail.stock_qty - v_detail.qty;
      UPDATE public.products_services SET stock_qty = v_new_stock WHERE id = v_detail.product_id;
      INSERT INTO public.stock_movements (product_id, transaction_id, qty_change, stock_after, reason, created_by)
      VALUES (v_detail.product_id, NEW.id, -v_detail.qty, v_new_stock, 'sale', NEW.cashier_id);
    END LOOP;

  ELSIF NEW.status = 'voided' AND OLD.status = 'completed' THEN
    NEW.voided_at := NOW();
    FOR v_detail IN
      SELECT td.product_id, td.qty, ps.stock_qty
      FROM public.transaction_details td
      JOIN public.products_services ps ON ps.id = td.product_id
      WHERE td.transaction_id = NEW.id AND ps.type = 'product'
    LOOP
      v_new_stock := v_detail.stock_qty + v_detail.qty;
      UPDATE public.products_services SET stock_qty = v_new_stock WHERE id = v_detail.product_id;
      INSERT INTO public.stock_movements (product_id, transaction_id, qty_change, stock_after, reason, created_by)
      VALUES (v_detail.product_id, NEW.id, v_detail.qty, v_new_stock, 'void_restore', NEW.voided_by);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_transaction_status ON public.transactions;
CREATE TRIGGER trg_transaction_status BEFORE UPDATE OF status ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_status_change();

-- ── FUNCTION: riwayat kendaraan ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_vehicle_history(p_license_plate TEXT)
RETURNS TABLE (transaction_id UUID, invoice_number TEXT, transaction_date TIMESTAMPTZ,
               status TEXT, total NUMERIC, cashier_name TEXT, items JSONB)
LANGUAGE sql STABLE AS $$
  SELECT t.id, t.invoice_number, t.created_at, t.status, t.total, p.full_name,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object('name',ps.name,'qty',td.qty,'subtotal',td.subtotal,'staff',sp.full_name))
      FROM public.transaction_details td
      JOIN public.products_services ps ON ps.id = td.product_id
      LEFT JOIN public.profiles sp ON sp.id = td.assigned_staff_id
      WHERE td.transaction_id = t.id
    ), '[]'::jsonb)
  FROM public.transactions t
  JOIN public.vehicles v ON v.id = t.vehicle_id
  JOIN public.profiles p ON p.id = t.cashier_id
  WHERE UPPER(REPLACE(v.license_plate,' ','')) = UPPER(REPLACE(p_license_plate,' ',''))
  ORDER BY t.created_at DESC;
$$;

-- ── FUNCTION: revenue summary ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_revenue_summary(
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date   DATE DEFAULT CURRENT_DATE,
  p_unit       TEXT DEFAULT NULL)
RETURNS TABLE (business_unit TEXT, total_revenue NUMERIC, total_transactions BIGINT, total_items BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT ps.business_unit, SUM(td.subtotal), COUNT(DISTINCT t.id), SUM(td.qty)
  FROM public.transactions t
  JOIN public.transaction_details td ON td.transaction_id = t.id
  JOIN public.products_services ps ON ps.id = td.product_id
  WHERE t.status = 'completed'
    AND t.completed_at::DATE BETWEEN p_start_date AND p_end_date
    AND (p_unit IS NULL OR ps.business_unit = p_unit)
  GROUP BY ps.business_unit;
$$;

-- ── FUNCTION: komisi staff ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_staff_commission(
  p_staff_id UUID,
  p_start_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,
  p_end_date   DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (product_name TEXT, business_unit TEXT, total_qty BIGINT, total_revenue NUMERIC, assigned_date DATE)
LANGUAGE sql STABLE AS $$
  SELECT ps.name, ps.business_unit, SUM(td.qty), SUM(td.subtotal), t.completed_at::DATE
  FROM public.transaction_details td
  JOIN public.transactions t ON t.id = td.transaction_id
  JOIN public.products_services ps ON ps.id = td.product_id
  WHERE td.assigned_staff_id = p_staff_id AND t.status = 'completed'
    AND t.completed_at::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY ps.name, ps.business_unit, t.completed_at::DATE
  ORDER BY t.completed_at::DATE DESC;
$$;


-- ── ROW LEVEL SECURITY ────────────────────────────────────────────
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses            ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner');
$$;

CREATE OR REPLACE FUNCTION public.is_cashier_or_above()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','cashier'));
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- profiles
DROP POLICY IF EXISTS "self_read_profile"      ON public.profiles;
DROP POLICY IF EXISTS "owner_update_profiles"  ON public.profiles;
DROP POLICY IF EXISTS "system_insert_profile"  ON public.profiles;
CREATE POLICY "self_read_profile"     ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_owner());
CREATE POLICY "owner_update_profiles" ON public.profiles FOR UPDATE USING (public.is_owner());
CREATE POLICY "system_insert_profile" ON public.profiles FOR INSERT WITH CHECK (TRUE);

-- categories
DROP POLICY IF EXISTS "authenticated_read_categories" ON public.categories;
DROP POLICY IF EXISTS "owner_manage_categories"       ON public.categories;
CREATE POLICY "authenticated_read_categories" ON public.categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "owner_manage_categories"       ON public.categories FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

-- products_services
DROP POLICY IF EXISTS "read_active_products"  ON public.products_services;
DROP POLICY IF EXISTS "owner_manage_products" ON public.products_services;
CREATE POLICY "read_active_products"  ON public.products_services FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "owner_manage_products" ON public.products_services FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

-- vehicles
DROP POLICY IF EXISTS "cashier_read_vehicles"   ON public.vehicles;
DROP POLICY IF EXISTS "cashier_insert_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "owner_manage_vehicles"   ON public.vehicles;
CREATE POLICY "cashier_read_vehicles"   ON public.vehicles FOR SELECT USING (public.is_cashier_or_above());
CREATE POLICY "cashier_insert_vehicles" ON public.vehicles FOR INSERT WITH CHECK (public.is_cashier_or_above());
CREATE POLICY "owner_manage_vehicles"   ON public.vehicles FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

-- transactions
DROP POLICY IF EXISTS "read_transactions"             ON public.transactions;
DROP POLICY IF EXISTS "cashier_insert_transactions"   ON public.transactions;
DROP POLICY IF EXISTS "cashier_update_draft"          ON public.transactions;
DROP POLICY IF EXISTS "owner_update_all_transactions" ON public.transactions;
CREATE POLICY "read_transactions"             ON public.transactions FOR SELECT USING (cashier_id = auth.uid() OR public.is_owner());
CREATE POLICY "cashier_insert_transactions"   ON public.transactions FOR INSERT WITH CHECK (public.is_cashier_or_above() AND cashier_id = auth.uid());
CREATE POLICY "cashier_update_draft"          ON public.transactions FOR UPDATE USING (cashier_id = auth.uid() AND status = 'draft');
CREATE POLICY "owner_update_all_transactions" ON public.transactions FOR UPDATE USING (public.is_owner());

-- transaction_details
DROP POLICY IF EXISTS "read_details"          ON public.transaction_details;
DROP POLICY IF EXISTS "manage_draft_details"  ON public.transaction_details;
CREATE POLICY "read_details"         ON public.transaction_details FOR SELECT USING (
  public.is_owner() OR EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.cashier_id = auth.uid()));
CREATE POLICY "manage_draft_details" ON public.transaction_details FOR ALL USING (
  EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND (t.cashier_id = auth.uid() OR public.is_owner()) AND t.status = 'draft'));

-- stock_movements
DROP POLICY IF EXISTS "read_stock_movements" ON public.stock_movements;
CREATE POLICY "read_stock_movements" ON public.stock_movements FOR SELECT USING (
  public.is_owner() OR EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.cashier_id = auth.uid()));

-- expenses
DROP POLICY IF EXISTS "owner_manage_expenses" ON public.expenses;
CREATE POLICY "owner_manage_expenses" ON public.expenses FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());


-- ── VERIFIKASI ────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
