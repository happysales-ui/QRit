-- Restrict profile phone exposure: public reads use public_profiles view (no phone column).
-- Signup availability checks use SECURITY DEFINER RPCs so anon cannot SELECT * on profiles.

DROP POLICY IF EXISTS "profiles_public_select" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select"
  ON public.profiles
  FOR SELECT
  USING (public.is_profile_admin());

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  username,
  display_name,
  bio,
  avatar_url,
  theme,
  default_link_id,
  expired_at,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

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
