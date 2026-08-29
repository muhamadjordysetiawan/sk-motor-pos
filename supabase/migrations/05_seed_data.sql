-- ============================================================
-- SK Motor POS — 05: Seed Data (Data Awal)
-- ============================================================
-- CATATAN: Jalankan file ini SETELAH 01-04 berhasil
-- ============================================================

-- ── CATEGORIES ───────────────────────────────────────────────

INSERT INTO public.categories (id, name, business_unit, icon, sort_order) VALUES
  -- Bengkel
  ('cat-repair-01-0000-0000-000000000001', 'Oli & Pelumas',        'repair', 'droplets',   1),
  ('cat-repair-02-0000-0000-000000000002', 'Filter & Busi',        'repair', 'filter',      2),
  ('cat-repair-03-0000-0000-000000000003', 'Jasa Servis',          'repair', 'wrench',      3),
  ('cat-repair-04-0000-0000-000000000004', 'Spare Part Umum',      'repair', 'settings',    4),
  -- Steam Car Wash
  ('cat-wash-01-0000-0000-000000000005',   'Paket Cuci Motor',     'wash',   'bike',        1),
  ('cat-wash-02-0000-0000-000000000006',   'Paket Cuci Mobil',     'wash',   'car',         2),
  ('cat-wash-03-0000-0000-000000000007',   'Layanan Tambahan',     'wash',   'plus-circle', 3),
  -- Cafe
  ('cat-cafe-01-0000-0000-000000000008',   'Minuman Panas',        'cafe',   'coffee',      1),
  ('cat-cafe-02-0000-0000-000000000009',   'Minuman Dingin',       'cafe',   'cup-soda',    2),
  ('cat-cafe-03-0000-0000-000000000010',   'Makanan Berat',        'cafe',   'utensils',    3),
  ('cat-cafe-04-0000-0000-000000000011',   'Snack & Gorengan',     'cafe',   'cookie',      4)
ON CONFLICT (id) DO NOTHING;

-- ── PRODUCTS & SERVICES ──────────────────────────────────────

INSERT INTO public.products_services
  (id, category_id, name, sku, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit, is_active)
VALUES

  -- ── BENGKEL: Oli & Pelumas ────────────────────────────────
  (gen_random_uuid(), 'cat-repair-01-0000-0000-000000000001', 'Oli Mesin Enduro 0.8L',     'OLI-END-08', 'product', 'repair',  35000,  28000, 30,  5, 'botol', TRUE),
  (gen_random_uuid(), 'cat-repair-01-0000-0000-000000000001', 'Oli Mesin Enduro 1L',       'OLI-END-10', 'product', 'repair',  42000,  34000, 25,  5, 'botol', TRUE),
  (gen_random_uuid(), 'cat-repair-01-0000-0000-000000000001', 'Oli Mesin Shell Helix 1L',  'OLI-SHL-10', 'product', 'repair',  65000,  55000, 15,  3, 'botol', TRUE),
  (gen_random_uuid(), 'cat-repair-01-0000-0000-000000000001', 'Oli Gardan 140mL',          'OLI-GRD-14', 'product', 'repair',  12000,   9000, 40, 10, 'sachet',TRUE),
  (gen_random_uuid(), 'cat-repair-01-0000-0000-000000000001', 'Oli Transmisi Matic 130mL', 'OLI-ATF-13', 'product', 'repair',  18000,  14000, 25,  5, 'sachet',TRUE),

  -- ── BENGKEL: Filter & Busi ───────────────────────────────
  (gen_random_uuid(), 'cat-repair-02-0000-0000-000000000002', 'Filter Udara Honda Beat',   'FLT-UDP-BTR', 'product', 'repair', 25000,  18000, 20,  5, 'pcs', TRUE),
  (gen_random_uuid(), 'cat-repair-02-0000-0000-000000000002', 'Filter Udara Yamaha Vario', 'FLT-UDP-VRO', 'product', 'repair', 28000,  20000, 15,  5, 'pcs', TRUE),
  (gen_random_uuid(), 'cat-repair-02-0000-0000-000000000002', 'Busi NGK CR7HSA',           'BSI-NGK-CR7', 'product', 'repair', 22000,  15000, 30,  5, 'pcs', TRUE),
  (gen_random_uuid(), 'cat-repair-02-0000-0000-000000000002', 'Busi Iridium Denso',        'BSI-DEN-IRD', 'product', 'repair', 55000,  42000, 10,  3, 'pcs', TRUE),

  -- ── BENGKEL: Jasa Servis (tidak ada stok) ────────────────
  (gen_random_uuid(), 'cat-repair-03-0000-0000-000000000003', 'Jasa Ganti Oli Motor',      'JSA-GNO-MTR', 'service', 'repair', 15000,      0,  0,  0, 'servis', TRUE),
  (gen_random_uuid(), 'cat-repair-03-0000-0000-000000000003', 'Jasa Tune Up Motor',        'JSA-TUN-MTR', 'service', 'repair', 50000,      0,  0,  0, 'servis', TRUE),
  (gen_random_uuid(), 'cat-repair-03-0000-0000-000000000003', 'Jasa Servis Karburator',    'JSA-KRB-MTR', 'service', 'repair', 35000,      0,  0,  0, 'servis', TRUE),
  (gen_random_uuid(), 'cat-repair-03-0000-0000-000000000003', 'Jasa Ganti Kampas Rem',     'JSA-KMP-REM', 'service', 'repair', 25000,      0,  0,  0, 'servis', TRUE),
  (gen_random_uuid(), 'cat-repair-03-0000-0000-000000000003', 'Jasa Servis Ringan Mobil',  'JSA-SRV-MBL', 'service', 'repair',150000,      0,  0,  0, 'servis', TRUE),
  (gen_random_uuid(), 'cat-repair-03-0000-0000-000000000003', 'Jasa Tune Up Mobil',        'JSA-TUN-MBL', 'service', 'repair',250000,      0,  0,  0, 'servis', TRUE),

  -- ── STEAM CAR WASH: Paket Motor ──────────────────────────
  (gen_random_uuid(), 'cat-wash-01-0000-0000-000000000005',   'Cuci Motor Biasa',          'WSH-MTR-BIA', 'service', 'wash',   15000,      0,  0,  0, 'unit',  TRUE),
  (gen_random_uuid(), 'cat-wash-01-0000-0000-000000000005',   'Cuci Motor + Semir Ban',    'WSH-MTR-SBN', 'service', 'wash',   20000,      0,  0,  0, 'unit',  TRUE),
  (gen_random_uuid(), 'cat-wash-01-0000-0000-000000000005',   'Cuci Motor Premium (salon)','WSH-MTR-PRM', 'service', 'wash',   35000,      0,  0,  0, 'unit',  TRUE),

  -- ── STEAM CAR WASH: Paket Mobil ──────────────────────────
  (gen_random_uuid(), 'cat-wash-02-0000-0000-000000000006',   'Cuci Mobil Biasa',          'WSH-MBL-BIA', 'service', 'wash',   30000,      0,  0,  0, 'unit',  TRUE),
  (gen_random_uuid(), 'cat-wash-02-0000-0000-000000000006',   'Cuci Mobil + Interior',     'WSH-MBL-INT', 'service', 'wash',   60000,      0,  0,  0, 'unit',  TRUE),
  (gen_random_uuid(), 'cat-wash-02-0000-0000-000000000006',   'Cuci Mobil Full Salon',     'WSH-MBL-FUL', 'service', 'wash',  150000,      0,  0,  0, 'unit',  TRUE),
  (gen_random_uuid(), 'cat-wash-02-0000-0000-000000000006',   'Cuci SUV/Pick-Up',          'WSH-SUV-BIA', 'service', 'wash',   40000,      0,  0,  0, 'unit',  TRUE),

  -- ── CAFE: Minuman Panas ───────────────────────────────────
  (gen_random_uuid(), 'cat-cafe-01-0000-0000-000000000008',   'Kopi Hitam',                'CAF-KHP-001', 'product', 'cafe',    5000,   2000, 50, 10, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-01-0000-0000-000000000008',   'Kopi Susu',                 'CAF-KSU-001', 'product', 'cafe',    8000,   4000, 50, 10, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-01-0000-0000-000000000008',   'Teh Manis',                 'CAF-TEH-001', 'product', 'cafe',    5000,   2000, 60, 10, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-01-0000-0000-000000000008',   'Susu Coklat Panas',         'CAF-SCK-001', 'product', 'cafe',    8000,   4000, 30, 10, 'porsi', TRUE),

  -- ── CAFE: Minuman Dingin ──────────────────────────────────
  (gen_random_uuid(), 'cat-cafe-02-0000-0000-000000000009',   'Es Kopi Susu',              'CAF-EKS-001', 'product', 'cafe',   12000,   6000, 40, 10, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-02-0000-0000-000000000009',   'Es Teh Manis',              'CAF-ETM-001', 'product', 'cafe',    7000,   3000, 40, 10, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-02-0000-0000-000000000009',   'Es Jeruk',                  'CAF-EJR-001', 'product', 'cafe',    8000,   3500, 30, 10, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-02-0000-0000-000000000009',   'Air Mineral Botol',         'CAF-AIR-001', 'product', 'cafe',    5000,   3000, 60, 15, 'botol', TRUE),

  -- ── CAFE: Makanan ─────────────────────────────────────────
  (gen_random_uuid(), 'cat-cafe-03-0000-0000-000000000010',   'Nasi Goreng',               'CAF-NSG-001', 'product', 'cafe',   18000,  10000, 20,  5, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-03-0000-0000-000000000010',   'Mie Goreng',                'CAF-MGR-001', 'product', 'cafe',   15000,   8000, 20,  5, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-03-0000-0000-000000000010',   'Indomie Rebus/Goreng',      'CAF-IND-001', 'product', 'cafe',   10000,   4000, 30, 10, 'porsi', TRUE),

  -- ── CAFE: Snack ───────────────────────────────────────────
  (gen_random_uuid(), 'cat-cafe-04-0000-0000-000000000011',   'Gorengan (5 pcs)',          'CAF-GRG-001', 'product', 'cafe',    8000,   4000, 30, 10, 'porsi', TRUE),
  (gen_random_uuid(), 'cat-cafe-04-0000-0000-000000000011',   'Pisang Goreng',             'CAF-PSG-001', 'product', 'cafe',   10000,   5000, 20,  5, 'porsi', TRUE)

ON CONFLICT (sku) DO NOTHING;

-- ── PESAN SUKSES ─────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data berhasil dimasukkan!';
  RAISE NOTICE '   Kategori: %', (SELECT COUNT(*) FROM public.categories);
  RAISE NOTICE '   Produk/Layanan: %', (SELECT COUNT(*) FROM public.products_services);
END $$;
