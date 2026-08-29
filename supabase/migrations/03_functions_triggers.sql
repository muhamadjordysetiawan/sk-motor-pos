-- ============================================================
-- SK Motor POS — 03: Functions & Triggers
-- ============================================================

-- ── FUNCTION 1: Generate Nomor Invoice ───────────────────────
-- Format: SK-YYYYMMDD-XXXX (XXXX = urutan per hari, 4 digit)
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_date    TEXT;
  v_count   INTEGER;
  v_invoice TEXT;
BEGIN
  -- Hanya generate kalau belum ada
  IF NEW.invoice_number IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_date := TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');

  -- Hitung transaksi hari ini
  SELECT COUNT(*) + 1
  INTO v_count
  FROM public.transactions
  WHERE DATE(created_at AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE AT TIME ZONE 'Asia/Jakarta';

  v_invoice := 'SK-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
  NEW.invoice_number := v_invoice;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_invoice ON public.transactions;
CREATE TRIGGER trg_generate_invoice
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- ── FUNCTION 2: Hitung Subtotal & Total Transaksi ────────────
-- Dipanggil setiap kali transaction_details berubah
CREATE OR REPLACE FUNCTION public.recalculate_transaction_total(p_transaction_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_subtotal NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(subtotal), 0)
  INTO v_subtotal
  FROM public.transaction_details
  WHERE transaction_id = p_transaction_id;

  UPDATE public.transactions
  SET
    subtotal = v_subtotal,
    total    = GREATEST(0, v_subtotal - discount + tax)
  WHERE id = p_transaction_id;
END;
$$;

-- Trigger: auto-recalc saat detail diubah
CREATE OR REPLACE FUNCTION public.trg_recalc_total_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_transaction_total(OLD.transaction_id);
  ELSE
    -- Auto-hitung subtotal baris
    NEW.subtotal := (NEW.unit_price - COALESCE(NEW.discount, 0)) * NEW.qty;
    PERFORM public.recalculate_transaction_total(NEW.transaction_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalc_total ON public.transaction_details;
CREATE TRIGGER trg_recalc_total
  BEFORE INSERT OR UPDATE ON public.transaction_details
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_fn();

DROP TRIGGER IF EXISTS trg_recalc_total_delete ON public.transaction_details;
CREATE TRIGGER trg_recalc_total_delete
  AFTER DELETE ON public.transaction_details
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_fn();

-- ── FUNCTION 3: Deduct / Restore Stok saat Status Berubah ────
CREATE OR REPLACE FUNCTION public.handle_transaction_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_detail RECORD;
  v_new_stock INTEGER;
BEGIN
  -- ── COMPLETED: Kurangi stok ────────────────────────────────
  IF NEW.status = 'completed' AND OLD.status = 'draft' THEN

    NEW.completed_at := NOW();

    FOR v_detail IN
      SELECT td.product_id, td.qty, ps.stock_qty, ps.type
      FROM public.transaction_details td
      JOIN public.products_services ps ON ps.id = td.product_id
      WHERE td.transaction_id = NEW.id
        AND ps.type = 'product'   -- hanya produk fisik, bukan jasa
    LOOP
      -- Validasi stok tidak minus
      IF v_detail.stock_qty < v_detail.qty THEN
        RAISE EXCEPTION 'Stok tidak cukup untuk produk ID: %. Stok tersedia: %, dibutuhkan: %',
          v_detail.product_id, v_detail.stock_qty, v_detail.qty;
      END IF;

      -- Kurangi stok
      v_new_stock := v_detail.stock_qty - v_detail.qty;

      UPDATE public.products_services
      SET stock_qty = v_new_stock
      WHERE id = v_detail.product_id;

      -- Catat di stock_movements
      INSERT INTO public.stock_movements
        (product_id, transaction_id, qty_change, stock_after, reason, created_by)
      VALUES
        (v_detail.product_id, NEW.id, -v_detail.qty, v_new_stock, 'sale', NEW.cashier_id);
    END LOOP;

  -- ── VOIDED: Kembalikan stok ────────────────────────────────
  ELSIF NEW.status = 'voided' AND OLD.status = 'completed' THEN

    NEW.voided_at := NOW();

    FOR v_detail IN
      SELECT td.product_id, td.qty, ps.stock_qty, ps.type
      FROM public.transaction_details td
      JOIN public.products_services ps ON ps.id = td.product_id
      WHERE td.transaction_id = NEW.id
        AND ps.type = 'product'
    LOOP
      v_new_stock := v_detail.stock_qty + v_detail.qty;

      UPDATE public.products_services
      SET stock_qty = v_new_stock
      WHERE id = v_detail.product_id;

      INSERT INTO public.stock_movements
        (product_id, transaction_id, qty_change, stock_after, reason, created_by)
      VALUES
        (v_detail.product_id, NEW.id, v_detail.qty, v_new_stock, 'void_restore', NEW.voided_by);
    END LOOP;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_transaction_status ON public.transactions;
CREATE TRIGGER trg_transaction_status
  BEFORE UPDATE OF status ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_status_change();

-- ── FUNCTION 4: Riwayat Kendaraan ────────────────────────────
-- Kembalikan histori transaksi lengkap berdasarkan nomor polisi
CREATE OR REPLACE FUNCTION public.get_vehicle_history(p_license_plate TEXT)
RETURNS TABLE (
  transaction_id   UUID,
  invoice_number   TEXT,
  transaction_date TIMESTAMPTZ,
  status           TEXT,
  total            NUMERIC,
  cashier_name     TEXT,
  items            JSONB
) LANGUAGE sql STABLE AS $$
  SELECT
    t.id,
    t.invoice_number,
    t.created_at,
    t.status,
    t.total,
    p.full_name,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object(
          'name',       ps.name,
          'qty',        td.qty,
          'unit_price', td.unit_price,
          'subtotal',   td.subtotal,
          'staff',      sp.full_name
        ))
        FROM public.transaction_details td
        JOIN public.products_services ps ON ps.id = td.product_id
        LEFT JOIN public.profiles sp ON sp.id = td.assigned_staff_id
        WHERE td.transaction_id = t.id
      ), '[]'::jsonb
    )
  FROM public.transactions t
  JOIN public.vehicles v ON v.id = t.vehicle_id
  JOIN public.profiles p ON p.id = t.cashier_id
  WHERE UPPER(REPLACE(v.license_plate, ' ', '')) =
        UPPER(REPLACE(p_license_plate, ' ', ''))
  ORDER BY t.created_at DESC;
$$;

-- ── FUNCTION 5: Dashboard Revenue Summary ────────────────────
-- Dipakai oleh Owner Dashboard untuk summary harian
CREATE OR REPLACE FUNCTION public.get_revenue_summary(
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date   DATE DEFAULT CURRENT_DATE,
  p_unit       TEXT DEFAULT NULL   -- NULL = semua unit
)
RETURNS TABLE (
  business_unit     TEXT,
  total_revenue     NUMERIC,
  total_transactions BIGINT,
  total_items       BIGINT
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(ps.business_unit, 'general') AS business_unit,
    SUM(td.subtotal)                       AS total_revenue,
    COUNT(DISTINCT t.id)                   AS total_transactions,
    SUM(td.qty)                            AS total_items
  FROM public.transactions t
  JOIN public.transaction_details td ON td.transaction_id = t.id
  JOIN public.products_services ps ON ps.id = td.product_id
  WHERE t.status = 'completed'
    AND DATE(t.completed_at AT TIME ZONE 'Asia/Jakarta')
        BETWEEN p_start_date AND p_end_date
    AND (p_unit IS NULL OR ps.business_unit = p_unit)
  GROUP BY ps.business_unit;
$$;

-- ── FUNCTION 6: Staff Commission Report ──────────────────────
CREATE OR REPLACE FUNCTION public.get_staff_commission(
  p_staff_id   UUID,
  p_start_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,
  p_end_date   DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  product_name TEXT,
  business_unit TEXT,
  total_qty    BIGINT,
  total_revenue NUMERIC,
  assigned_date DATE
) LANGUAGE sql STABLE AS $$
  SELECT
    ps.name,
    ps.business_unit,
    SUM(td.qty),
    SUM(td.subtotal),
    DATE(t.completed_at AT TIME ZONE 'Asia/Jakarta')
  FROM public.transaction_details td
  JOIN public.transactions t ON t.id = td.transaction_id
  JOIN public.products_services ps ON ps.id = td.product_id
  WHERE td.assigned_staff_id = p_staff_id
    AND t.status = 'completed'
    AND DATE(t.completed_at AT TIME ZONE 'Asia/Jakarta')
        BETWEEN p_start_date AND p_end_date
  GROUP BY ps.name, ps.business_unit, DATE(t.completed_at AT TIME ZONE 'Asia/Jakarta')
  ORDER BY DATE(t.completed_at AT TIME ZONE 'Asia/Jakarta') DESC;
$$;
