-- Ensure profiles.default_link_id for bracelet QR redirect mode.
-- Idempotent fix when 004_profiles_default_link.sql was not applied in Supabase.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_link_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_default_link_id_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_default_link_id_fkey
      FOREIGN KEY (default_link_id) REFERENCES public.links (id) ON DELETE SET NULL;
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.default_link_id IS 'QR scan default destination link; NULL = integrated profile page';
