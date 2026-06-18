-- Admin role for profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Helper for RLS policies
CREATE OR REPLACE FUNCTION public.is_profile_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Prevent is_admin changes through the app API (grant via SQL Editor only)
CREATE OR REPLACE FUNCTION public.protect_is_admin_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    NEW.is_admin := OLD.is_admin;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_is_admin ON public.profiles;
CREATE TRIGGER profiles_protect_is_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_is_admin_column();

-- Admins may update any profile (e.g. extend expired_at)
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update"
  ON public.profiles
  FOR UPDATE
  USING (public.is_profile_admin())
  WITH CHECK (public.is_profile_admin());

-- Seed initial admin (safe if user does not exist yet)
UPDATE public.profiles
SET is_admin = true
WHERE username = 'hyun1016';
