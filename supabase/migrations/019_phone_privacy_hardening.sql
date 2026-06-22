-- Harden profiles.phone privacy (idempotent).
-- Safe to run when 014/016/017 are already applied, or when 014 was never applied
-- and anon still has profiles_public_select from 001.

-- Remove permissive anon SELECT on profiles (001 default if 014 skipped).
DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Only profile owner may read their row (includes phone).
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins may read all profiles (includes phone).
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
CREATE POLICY "profiles_admin_select"
  ON public.profiles
  FOR SELECT
  USING (public.is_profile_admin());

-- Belt-and-suspenders: anon must not SELECT the profiles table directly.
REVOKE ALL ON TABLE public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

-- Public reads go through a view that never exposes phone (or is_admin).
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT
  id,
  username,
  display_name,
  bio,
  avatar_url,
  theme,
  default_link_id,
  expired_at,
  free_until,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Signup availability checks: SECURITY DEFINER RPCs (no direct profiles SELECT for anon).
CREATE OR REPLACE FUNCTION public.is_username_taken(p_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE username = lower(trim(p_username))
  );
$$;

CREATE OR REPLACE FUNCTION public.is_phone_taken(p_phone text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE phone = regexp_replace(trim(p_phone), '\D', '', 'g')
      AND phone IS NOT NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_username_taken(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_taken(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.is_phone_taken(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_phone_taken(text) TO anon, authenticated;
