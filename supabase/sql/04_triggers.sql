-- ════════════════════════════════════
-- STEP 2D — Triggers
-- ════════════════════════════════════

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_updated_at ON public.profiles;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON public.products_services;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON public.products_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON public.vehicles;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_generate_invoice ON public.transactions;
CREATE TRIGGER trg_generate_invoice
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

DROP TRIGGER IF EXISTS trg_recalc_on_insert_update ON public.transaction_details;
CREATE TRIGGER trg_recalc_on_insert_update
  BEFORE INSERT OR UPDATE ON public.transaction_details
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_fn();

DROP TRIGGER IF EXISTS trg_recalc_on_delete ON public.transaction_details;
CREATE TRIGGER trg_recalc_on_delete
  AFTER DELETE ON public.transaction_details
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_total_fn();

DROP TRIGGER IF EXISTS trg_transaction_status ON public.transactions;
CREATE TRIGGER trg_transaction_status
  BEFORE UPDATE OF status ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_status_change();
