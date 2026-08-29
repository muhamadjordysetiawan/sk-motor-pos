-- Menghapus semua policy lama yang bentrok
DROP POLICY IF EXISTS "read_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "cashier_insert_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "owner_manage_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.vehicles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.vehicles;

-- Membuat policy baru yang super sederhana (selama user login, dia bisa Read, Insert, dan Update)
CREATE POLICY "allow_all_authenticated_read" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_authenticated_insert" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_all_authenticated_update" ON public.vehicles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
