-- Hapus semua policy lama di transactions
DROP POLICY IF EXISTS "read_transactions" ON public.transactions;
DROP POLICY IF EXISTS "cashier_insert_transactions" ON public.transactions;
DROP POLICY IF EXISTS "cashier_update_draft" ON public.transactions;
DROP POLICY IF EXISTS "owner_update_all_transactions" ON public.transactions;

-- Buat policy baru yang simple: Kasir & Owner bebas insert, update, dan select
CREATE POLICY "all_transactions_access" ON public.transactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Hapus semua policy lama di transaction_details
DROP POLICY IF EXISTS "read_details" ON public.transaction_details;
DROP POLICY IF EXISTS "manage_draft_details" ON public.transaction_details;

-- Buat policy baru untuk transaction_details
CREATE POLICY "all_details_access" ON public.transaction_details
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
