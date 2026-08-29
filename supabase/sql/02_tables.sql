-- ════════════════════════════════════
-- STEP 2B — Tables
-- ════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT        NOT NULL,
  role       TEXT        NOT NULL DEFAULT 'cashier'
               CHECK (role IN ('owner','cashier','mechanic','washer','waiter')),
  phone      TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  business_unit TEXT        NOT NULL CHECK (business_unit IN ('repair','wash','cafe','general')),
  icon          TEXT        DEFAULT 'package',
  sort_order    INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products_services (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id         UUID          REFERENCES public.categories(id) ON DELETE SET NULL,
  name                TEXT          NOT NULL,
  sku                 TEXT          UNIQUE,
  description         TEXT,
  type                TEXT          NOT NULL CHECK (type IN ('product','service')),
  business_unit       TEXT          NOT NULL CHECK (business_unit IN ('repair','wash','cafe','general')),
  price               NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_price          NUMERIC(12,2) DEFAULT 0,
  stock_qty           INTEGER       NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER       NOT NULL DEFAULT 5,
  unit                TEXT          DEFAULT 'pcs',
  is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  license_plate TEXT        NOT NULL UNIQUE,
  owner_name    TEXT        NOT NULL,
  phone         TEXT,
  vehicle_type  TEXT        NOT NULL CHECK (vehicle_type IN ('motor','mobil','truk','lainnya')),
  brand         TEXT,
  model         TEXT,
  color         TEXT,
  year          INTEGER,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT          UNIQUE,
  vehicle_id     UUID          REFERENCES public.vehicles(id) ON DELETE SET NULL,
  cashier_id     UUID          NOT NULL REFERENCES public.profiles(id),
  status         TEXT          NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','completed','voided')),
  payment_method TEXT          CHECK (payment_method IN ('cash','transfer','qris','piutang')),
  subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid    NUMERIC(12,2) DEFAULT 0,
  change_amount  NUMERIC(12,2) DEFAULT 0,
  notes          TEXT,
  wa_phone       TEXT,
  voided_by      UUID          REFERENCES public.profiles(id),
  void_reason    TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMPTZ,
  voided_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.transaction_details (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id    UUID          NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id        UUID          NOT NULL REFERENCES public.products_services(id),
  assigned_staff_id UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  qty               INTEGER       NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID        NOT NULL REFERENCES public.products_services(id),
  transaction_id UUID        REFERENCES public.transactions(id) ON DELETE SET NULL,
  qty_change     INTEGER     NOT NULL,
  stock_after    INTEGER     NOT NULL,
  reason         TEXT        NOT NULL,
  notes          TEXT,
  created_by     UUID        REFERENCES public.profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_by   UUID          NOT NULL REFERENCES public.profiles(id),
  business_unit TEXT          NOT NULL CHECK (business_unit IN ('repair','wash','cafe','general')),
  category      TEXT          NOT NULL,
  description   TEXT          NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expense_date  DATE          NOT NULL DEFAULT CURRENT_DATE,
  receipt_url   TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_business_unit ON public.products_services(business_unit);
CREATE INDEX IF NOT EXISTS idx_products_type          ON public.products_services(type);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm     ON public.products_services USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_transactions_status    ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier   ON public.transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vehicle   ON public.transactions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date      ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_txdetails_transaction  ON public.transaction_details(transaction_id);
CREATE INDEX IF NOT EXISTS idx_txdetails_staff        ON public.transaction_details(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_stockmove_product      ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date          ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_trgm    ON public.vehicles USING GIN (license_plate gin_trgm_ops);
