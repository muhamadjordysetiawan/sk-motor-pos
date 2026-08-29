-- ════════════════════════════════════
-- STEP 2C — Functions
-- ════════════════════════════════════

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

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_date  TEXT;
  v_count INTEGER;
BEGIN
  IF NEW.invoice_number IS NOT NULL THEN RETURN NEW; END IF;
  v_date := TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO v_count FROM public.transactions
  WHERE created_at::DATE = (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE;
  NEW.invoice_number := 'SK-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.get_staff_commission(
  p_staff_id   UUID,
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
