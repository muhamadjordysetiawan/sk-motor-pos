-- 1. Bikin tabel loyalty_members
CREATE TABLE IF NOT EXISTS public.loyalty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code TEXT NOT NULL UNIQUE, -- Contoh: SKM-001
  full_name TEXT NOT NULL,
  phone TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index untuk pencarian barcode
CREATE INDEX IF NOT EXISTS idx_loyalty_code ON public.loyalty_members(member_code);
CREATE INDEX IF NOT EXISTS idx_loyalty_phone ON public.loyalty_members(phone);

-- 3. Tambah kolom member_id ke tabel transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.loyalty_members(id) ON DELETE SET NULL;

-- 4. Enable RLS
ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated to read members"
ON public.loyalty_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all authenticated to insert members"
ON public.loyalty_members FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow all authenticated to update members"
ON public.loyalty_members FOR UPDATE TO authenticated USING (true);
