-- ==========================================
-- SEED DATA - BENGKEL MOBIL & CAFE SUKABUMI
-- ==========================================

-- 1. MASUKKAN KATEGORI
INSERT INTO public.categories (id, name, business_unit, icon, sort_order) VALUES
(gen_random_uuid(), 'Oli & Pelumas', 'repair', 'package', 1),
(gen_random_uuid(), 'Filter & Mesin', 'repair', 'package', 2),
(gen_random_uuid(), 'Pengapian & Kelistrikan', 'repair', 'package', 3),
(gen_random_uuid(), 'Pengereman (Rem)', 'repair', 'package', 4),
(gen_random_uuid(), 'Jasa Bengkel', 'repair', 'wrench', 5),
(gen_random_uuid(), 'Cuci Mobil (Steam)', 'wash', 'droplets', 1),
(gen_random_uuid(), 'Kopi & Minuman Dingin', 'cafe', 'coffee', 1),
(gen_random_uuid(), 'Makanan & Cemilan', 'cafe', 'package', 2);


-- 2. MASUKKAN PRODUK & JASA

-- ================== BENGKEL (REPAIR) ==================

-- Oli & Pelumas
INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Oli Mesin Shell Helix HX5 15W-40 4L', 'OLI-SH-HX5-4L', 'Oli standar bengkel, cocok untuk Avanza/Xenia/Mobilio lama', 'product', 'repair', 245000, 210000, 20, 4, 'galon'
FROM public.categories WHERE name = 'Oli & Pelumas' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Oli TMO 10W-40 4L (Toyota)', 'OLI-TMO-10W40-4L', 'Oli resmi Toyota, cocok untuk Agya, Calya, Avanza', 'product', 'repair', 275000, 240000, 15, 3, 'galon'
FROM public.categories WHERE name = 'Oli & Pelumas' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Oli Pertamina Fastron Gold 5W-30 4L', 'OLI-FAS-GOLD-4L', 'Oli sintetis, tarikan enteng (LCGC/City Car)', 'product', 'repair', 450000, 390000, 10, 2, 'galon'
FROM public.categories WHERE name = 'Oli & Pelumas' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Minyak Rem Jumbo DOT-3 (300ml)', 'OLI-REM-JMB-300', 'Minyak rem standar merah/putih', 'product', 'repair', 30000, 22000, 12, 3, 'botol'
FROM public.categories WHERE name = 'Oli & Pelumas' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Air Radiator Coolant Top1 4L', 'RAD-TOP1-4L', 'Radiator coolant warna hijau', 'product', 'repair', 115000, 95000, 8, 2, 'galon'
FROM public.categories WHERE name = 'Oli & Pelumas' LIMIT 1;

-- Filter & Mesin
INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Filter Oli Denso DXE-1004', 'FLT-OLI-DNS-1', 'Cocok untuk Avanza, Xenia, Rush, Terios, GranMax', 'product', 'repair', 35000, 25000, 30, 5, 'pcs'
FROM public.categories WHERE name = 'Filter & Mesin' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Filter Udara Avanza / Xenia VVTI', 'FLT-UDR-AVN', 'Saringan udara mesin tipe kertas', 'product', 'repair', 65000, 45000, 15, 3, 'pcs'
FROM public.categories WHERE name = 'Filter & Mesin' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Filter Solar Bosch (Innova/Fortuner/Pajero)', 'FLT-SLR-BSC', 'Filter bahan bakar diesel umum', 'product', 'repair', 90000, 70000, 10, 2, 'pcs'
FROM public.categories WHERE name = 'Filter & Mesin' LIMIT 1;

-- Pengapian
INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Busi NGK BKR6E-11 (Biasa)', 'BSI-NGK-BKR6E', 'Busi nikel standar untuk Avanza/Xenia lama, APV', 'product', 'repair', 30000, 22000, 40, 10, 'pcs'
FROM public.categories WHERE name = 'Pengapian & Kelistrikan' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Busi Denso Iridium (Brio/Mobilio/Jazz)', 'BSI-DNS-IRI', 'Busi iridium awet dan tarikan enteng', 'product', 'repair', 95000, 75000, 20, 8, 'pcs'
FROM public.categories WHERE name = 'Pengapian & Kelistrikan' LIMIT 1;

-- Rem
INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Kampas Rem Depan Bendix (Avanza/Xenia)', 'REM-BNDX-AVN', 'Brake pad depan (Cakram)', 'product', 'repair', 210000, 160000, 12, 3, 'set'
FROM public.categories WHERE name = 'Pengereman (Rem)' LIMIT 1;

-- Jasa Bengkel (Service)
INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Ganti Oli Mesin', 'JASA-OLI-1', 'Jasa pengosongan dan pengisian oli mesin baru', 'service', 'repair', 25000, 0, 0, 0, 'servis'
FROM public.categories WHERE name = 'Jasa Bengkel' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Tune Up Mobil (Injeksi)', 'JASA-TUNE-1', 'Pembersihan throtle body, ruang bakar, dan cek pengapian', 'service', 'repair', 150000, 0, 0, 0, 'servis'
FROM public.categories WHERE name = 'Jasa Bengkel' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Servis Rem Depan-Belakang', 'JASA-REM-1', 'Bongkar dan pembersihan kampas & cakram rem', 'service', 'repair', 100000, 0, 0, 0, 'servis'
FROM public.categories WHERE name = 'Jasa Bengkel' LIMIT 1;


-- ================== STEAM (WASH) ==================

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Cuci Mobil Reguler (Luar + Kaca)', 'WASH-REG-1', 'Cuci body shampo dan semir ban', 'service', 'wash', 40000, 0, 0, 0, 'servis'
FROM public.categories WHERE name = 'Cuci Mobil (Steam)' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Cuci Salju + Vakum Interior', 'WASH-SALJU-VKM', 'Cuci snow wash, vakum kabin, bersihkan dashboard', 'service', 'wash', 65000, 0, 0, 0, 'servis'
FROM public.categories WHERE name = 'Cuci Mobil (Steam)' LIMIT 1;


-- ================== CAFE ==================

-- Minuman Kopi
INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Iced Cafe Latte', 'CF-LATTE-ICE', 'Espresso + Susu Fresh Milk + Es', 'product', 'cafe', 18000, 8000, 50, 10, 'gelas'
FROM public.categories WHERE name = 'Kopi & Minuman Dingin' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Iced Americano', 'CF-AMER-ICE', 'Espresso + Air Dingin', 'product', 'cafe', 15000, 5000, 50, 10, 'gelas'
FROM public.categories WHERE name = 'Kopi & Minuman Dingin' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Es Kopi Susu Gula Aren', 'CF-AREN-ICE', 'Kopi susu kekinian gula aren asli', 'product', 'cafe', 18000, 9000, 50, 10, 'gelas'
FROM public.categories WHERE name = 'Kopi & Minuman Dingin' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Air Mineral Botol Le Minerale 600ml', 'CF-AM-600', 'Air putih botol dingin/biasa', 'product', 'cafe', 4000, 2500, 60, 15, 'botol'
FROM public.categories WHERE name = 'Kopi & Minuman Dingin' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Teh Manis Dingin', 'CF-TEH-ICE', 'Es teh manis', 'product', 'cafe', 5000, 2000, 100, 20, 'gelas'
FROM public.categories WHERE name = 'Kopi & Minuman Dingin' LIMIT 1;

-- Makanan
INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Mie Goreng Telur (Indomie)', 'CF-MIE-GTR', 'Indomie goreng + Telur ceplok + Sayur', 'product', 'cafe', 15000, 6000, 30, 5, 'porsi'
FROM public.categories WHERE name = 'Makanan & Cemilan' LIMIT 1;

INSERT INTO public.products_services (category_id, name, sku, description, type, business_unit, price, cost_price, stock_qty, low_stock_threshold, unit)
SELECT id, 'Roti Bakar Coklat Keju', 'CF-ROTI-CK', 'Roti bakar dua lembar isi meises dan keju parut', 'product', 'cafe', 16000, 7000, 25, 5, 'porsi'
FROM public.categories WHERE name = 'Makanan & Cemilan' LIMIT 1;

