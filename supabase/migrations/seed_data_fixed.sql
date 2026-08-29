-- ================================================================
-- SK MOTOR POS — SEED DATA (Jalankan TERPISAH setelah schema berhasil)
-- ================================================================
-- UUID format yang benar: 8-4-4-4-12 karakter hexadecimal
-- ================================================================

INSERT INTO public.categories (id, name, business_unit, icon, sort_order) VALUES
  -- Bengkel (repair)
  ('00000001-0000-0000-0000-000000000001', 'Oli & Pelumas',    'repair', 'droplets', 1),
  ('00000002-0000-0000-0000-000000000001', 'Filter & Busi',    'repair', 'filter',   2),
  ('00000003-0000-0000-0000-000000000001', 'Jasa Servis',      'repair', 'wrench',   3),
  ('00000004-0000-0000-0000-000000000001', 'Spare Part Umum',  'repair', 'settings', 4),
  -- Steam Car Wash (wash)
  ('00000005-0000-0000-0000-000000000001', 'Paket Cuci Motor', 'wash',   'bike',     1),
  ('00000006-0000-0000-0000-000000000001', 'Paket Cuci Mobil', 'wash',   'car',      2),
  ('00000007-0000-0000-0000-000000000001', 'Layanan Tambahan', 'wash',   'plus',     3),
  -- Cafe
  ('00000008-0000-0000-0000-000000000001', 'Minuman Panas',    'cafe',   'coffee',   1),
  ('00000009-0000-0000-0000-000000000001', 'Minuman Dingin',   'cafe',   'cup-soda', 2),
  ('00000010-0000-0000-0000-000000000001', 'Makanan Berat',    'cafe',   'utensils', 3),
  ('00000011-0000-0000-0000-000000000001', 'Snack & Gorengan', 'cafe',   'cookie',   4)
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.products_services
  (category_id, name, sku, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
VALUES
  -- ── Bengkel: Oli & Pelumas ─────────────────────────────────
  ('00000001-0000-0000-0000-000000000001','Oli Mesin Enduro 0.8L',    'OLI-END-08',  'product','repair', 35000,28000,30, 5,'botol'),
  ('00000001-0000-0000-0000-000000000001','Oli Mesin Enduro 1L',      'OLI-END-10',  'product','repair', 42000,34000,25, 5,'botol'),
  ('00000001-0000-0000-0000-000000000001','Oli Shell Helix 1L',       'OLI-SHL-10',  'product','repair', 65000,55000,15, 3,'botol'),
  ('00000001-0000-0000-0000-000000000001','Oli Gardan 140mL',         'OLI-GRD-14',  'product','repair', 12000, 9000,40,10,'sachet'),
  ('00000001-0000-0000-0000-000000000001','Oli Transmisi Matic 130mL','OLI-ATF-13',  'product','repair', 18000,14000,25, 5,'sachet'),

  -- ── Bengkel: Filter & Busi ─────────────────────────────────
  ('00000002-0000-0000-0000-000000000001','Filter Udara Honda Beat',  'FLT-UDP-BTR', 'product','repair', 25000,18000,20, 5,'pcs'),
  ('00000002-0000-0000-0000-000000000001','Filter Udara Yamaha Vario','FLT-UDP-VRO', 'product','repair', 28000,20000,15, 5,'pcs'),
  ('00000002-0000-0000-0000-000000000001','Busi NGK CR7HSA',          'BSI-NGK-CR7', 'product','repair', 22000,15000,30, 5,'pcs'),
  ('00000002-0000-0000-0000-000000000001','Busi Iridium Denso',       'BSI-DEN-IRD', 'product','repair', 55000,42000,10, 3,'pcs'),

  -- ── Bengkel: Jasa Servis ───────────────────────────────────
  ('00000003-0000-0000-0000-000000000001','Jasa Ganti Oli Motor',     'JSA-GNO-MTR', 'service','repair', 15000,    0, 0, 0,'servis'),
  ('00000003-0000-0000-0000-000000000001','Jasa Tune Up Motor',       'JSA-TUN-MTR', 'service','repair', 50000,    0, 0, 0,'servis'),
  ('00000003-0000-0000-0000-000000000001','Jasa Servis Karburator',   'JSA-KRB-MTR', 'service','repair', 35000,    0, 0, 0,'servis'),
  ('00000003-0000-0000-0000-000000000001','Jasa Ganti Kampas Rem',    'JSA-KMP-REM', 'service','repair', 25000,    0, 0, 0,'servis'),
  ('00000003-0000-0000-0000-000000000001','Jasa Servis Ringan Mobil', 'JSA-SRV-MBL', 'service','repair',150000,    0, 0, 0,'servis'),
  ('00000003-0000-0000-0000-000000000001','Jasa Tune Up Mobil',       'JSA-TUN-MBL', 'service','repair',250000,    0, 0, 0,'servis'),

  -- ── Steam: Paket Cuci Motor ────────────────────────────────
  ('00000005-0000-0000-0000-000000000001','Cuci Motor Biasa',         'WSH-MTR-BIA', 'service','wash',   15000,    0, 0, 0,'unit'),
  ('00000005-0000-0000-0000-000000000001','Cuci Motor + Semir Ban',   'WSH-MTR-SBN', 'service','wash',   20000,    0, 0, 0,'unit'),
  ('00000005-0000-0000-0000-000000000001','Cuci Motor Premium',       'WSH-MTR-PRM', 'service','wash',   35000,    0, 0, 0,'unit'),

  -- ── Steam: Paket Cuci Mobil ────────────────────────────────
  ('00000006-0000-0000-0000-000000000001','Cuci Mobil Biasa',         'WSH-MBL-BIA', 'service','wash',   30000,    0, 0, 0,'unit'),
  ('00000006-0000-0000-0000-000000000001','Cuci Mobil + Interior',    'WSH-MBL-INT', 'service','wash',   60000,    0, 0, 0,'unit'),
  ('00000006-0000-0000-0000-000000000001','Cuci Mobil Full Salon',    'WSH-MBL-FUL', 'service','wash',  150000,    0, 0, 0,'unit'),
  ('00000006-0000-0000-0000-000000000001','Cuci SUV / Pick-Up',       'WSH-SUV-BIA', 'service','wash',   40000,    0, 0, 0,'unit'),

  -- ── Cafe: Minuman Panas ────────────────────────────────────
  ('00000008-0000-0000-0000-000000000001','Kopi Hitam',               'CAF-KHP-001', 'product','cafe',    5000, 2000,50,10,'porsi'),
  ('00000008-0000-0000-0000-000000000001','Kopi Susu',                'CAF-KSU-001', 'product','cafe',    8000, 4000,50,10,'porsi'),
  ('00000008-0000-0000-0000-000000000001','Teh Manis',                'CAF-TEH-001', 'product','cafe',    5000, 2000,60,10,'porsi'),
  ('00000008-0000-0000-0000-000000000001','Susu Coklat Panas',        'CAF-SCK-001', 'product','cafe',    8000, 4000,30,10,'porsi'),

  -- ── Cafe: Minuman Dingin ───────────────────────────────────
  ('00000009-0000-0000-0000-000000000001','Es Kopi Susu',             'CAF-EKS-001', 'product','cafe',   12000, 6000,40,10,'porsi'),
  ('00000009-0000-0000-0000-000000000001','Es Teh Manis',             'CAF-ETM-001', 'product','cafe',    7000, 3000,40,10,'porsi'),
  ('00000009-0000-0000-0000-000000000001','Es Jeruk',                 'CAF-EJR-001', 'product','cafe',    8000, 3500,30,10,'porsi'),
  ('00000009-0000-0000-0000-000000000001','Air Mineral Botol',        'CAF-AIR-001', 'product','cafe',    5000, 3000,60,15,'botol'),

  -- ── Cafe: Makanan Berat ────────────────────────────────────
  ('00000010-0000-0000-0000-000000000001','Nasi Goreng',              'CAF-NSG-001', 'product','cafe',   18000,10000,20, 5,'porsi'),
  ('00000010-0000-0000-0000-000000000001','Mie Goreng',               'CAF-MGR-001', 'product','cafe',   15000, 8000,20, 5,'porsi'),
  ('00000010-0000-0000-0000-000000000001','Indomie Rebus/Goreng',     'CAF-IND-001', 'product','cafe',   10000, 4000,30,10,'porsi'),

  -- ── Cafe: Snack & Gorengan ────────────────────────────────
  ('00000011-0000-0000-0000-000000000001','Gorengan (5 pcs)',         'CAF-GRG-001', 'product','cafe',    8000, 4000,30,10,'porsi'),
  ('00000011-0000-0000-0000-000000000001','Pisang Goreng',            'CAF-PSG-001', 'product','cafe',   10000, 5000,20, 5,'porsi')

ON CONFLICT (sku) DO NOTHING;


-- Verifikasi hasil
SELECT
  'categories'       AS tabel, COUNT(*) AS jumlah FROM public.categories
UNION ALL SELECT
  'products_services', COUNT(*) FROM public.products_services;
