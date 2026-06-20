-- Fix: protect_is_admin trigger blocked SQL Editor admin grants.
-- Migration 011 seed and grant-admin.sql silently no-oped when is_admin changed.

CREATE OR REPLACE FUNCTION public.protect_is_admin_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- SQL Editor / migrations run as postgres; allow intentional admin grants
  IF current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    NEW.is_admin := OLD.is_admin;
  END IF;
  RETURN NEW;
END;
$$;

-- Re-apply initial admin seed (idempotent)
UPDATE public.profiles
SET is_admin = true
WHERE username = 'hyun1016'
  AND is_admin IS NOT TRUE;
