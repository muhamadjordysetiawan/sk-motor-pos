-- ════════════════════════════════════
-- STEP 2E — Row Level Security (RLS)
-- ════════════════════════════════════

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses            ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "self_read_profile"      ON public.profiles;
DROP POLICY IF EXISTS "owner_update_profiles"  ON public.profiles;
DROP POLICY IF EXISTS "system_insert_profile"  ON public.profiles;
CREATE POLICY "self_read_profile"     ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_owner());
CREATE POLICY "owner_update_profiles" ON public.profiles FOR UPDATE USING (public.is_owner());
CREATE POLICY "system_insert_profile" ON public.profiles FOR INSERT WITH CHECK (TRUE);

-- categories
DROP POLICY IF EXISTS "read_categories"       ON public.categories;
DROP POLICY IF EXISTS "owner_manage_categories" ON public.categories;
CREATE POLICY "read_categories"         ON public.categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "owner_manage_categories" ON public.categories FOR ALL   USING (public.is_owner()) WITH CHECK (public.is_owner());

-- products_services
DROP POLICY IF EXISTS "read_products"         ON public.products_services;
DROP POLICY IF EXISTS "owner_manage_products" ON public.products_services;
CREATE POLICY "read_products"         ON public.products_services FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "owner_manage_products" ON public.products_services FOR ALL   USING (public.is_owner()) WITH CHECK (public.is_owner());

-- vehicles
DROP POLICY IF EXISTS "read_vehicles"          ON public.vehicles;
DROP POLICY IF EXISTS "cashier_insert_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "owner_manage_vehicles"  ON public.vehicles;
CREATE POLICY "read_vehicles"           ON public.vehicles FOR SELECT USING (public.is_cashier_or_above());
CREATE POLICY "cashier_insert_vehicles" ON public.vehicles FOR INSERT WITH CHECK (public.is_cashier_or_above());
CREATE POLICY "owner_manage_vehicles"   ON public.vehicles FOR ALL    USING (public.is_owner()) WITH CHECK (public.is_owner());

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
DROP POLICY IF EXISTS "read_details"         ON public.transaction_details;
DROP POLICY IF EXISTS "manage_draft_details" ON public.transaction_details;
CREATE POLICY "read_details" ON public.transaction_details FOR SELECT USING (
  public.is_owner() OR EXISTS (
    SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.cashier_id = auth.uid()
  ));
CREATE POLICY "manage_draft_details" ON public.transaction_details FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.transactions t
    WHERE t.id = transaction_id
      AND (t.cashier_id = auth.uid() OR public.is_owner())
      AND t.status = 'draft'
  ));

-- stock_movements
DROP POLICY IF EXISTS "read_stock_movements" ON public.stock_movements;
CREATE POLICY "read_stock_movements" ON public.stock_movements FOR SELECT USING (
  public.is_owner() OR EXISTS (
    SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND t.cashier_id = auth.uid()
  ));

-- expenses
DROP POLICY IF EXISTS "owner_manage_expenses" ON public.expenses;
CREATE POLICY "owner_manage_expenses" ON public.expenses FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());
