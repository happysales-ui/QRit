-- Relax links table constraints and ensure transfer columns exist.
-- Fixes dashboard insert failures for new preset titles (블로그/카페, 회사 홈페이지),
-- MECARD:/qrit://transfer URLs, and missing bank_code/account_no columns.

-- Ensure bank transfer columns (idempotent; same as 003)
ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS bank_code TEXT,
  ADD COLUMN IF NOT EXISTS account_no TEXT;

-- Remove optional type column if a preset enum was added manually
ALTER TABLE public.links DROP COLUMN IF EXISTS type;

-- Drop known named CHECK constraints (if added outside repo migrations)
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_title_check;
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_title_format;
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_url_check;
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_url_format;
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_bank_code_check;
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_account_no_check;

-- Drop any remaining CHECK constraints on links (title/url whitelist, https-only, etc.)
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'links'
      AND con.contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.links DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

COMMENT ON COLUMN public.links.title IS 'Display label; any non-empty text (preset or custom)';
COMMENT ON COLUMN public.links.url IS 'https://, MECARD:, qrit://transfer, or other link payload';
