-- Hapus policy RLS produk yang lama
DROP POLICY IF EXISTS "owner_manage_products" ON public.products_services;
DROP POLICY IF EXISTS "read_products" ON public.products_services;

-- Buat policy baru: Kasir dan Owner bebas baca, tambah, edit produk
CREATE POLICY "all_manage_products" ON public.products_services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
