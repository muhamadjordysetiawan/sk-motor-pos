-- Allow insert vehicles for authenticated users
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.vehicles;
CREATE POLICY "Enable insert for authenticated users" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (true);

-- Allow update vehicles for authenticated users
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.vehicles;
CREATE POLICY "Enable update for authenticated users" ON public.vehicles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
