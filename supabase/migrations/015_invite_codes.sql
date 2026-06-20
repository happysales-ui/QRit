-- Closed signup: invite codes (6-char, single-use)

CREATE TABLE public.invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used')),
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz,
  used_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note text,
  CONSTRAINT invite_codes_code_format CHECK (
    code ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$'
  )
);

CREATE INDEX invite_codes_status_created_at_idx
  ON public.invite_codes (status, created_at DESC);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Admins: full read/write via existing is_profile_admin() helper
CREATE POLICY "invite_codes_admin_select"
  ON public.invite_codes
  FOR SELECT
  USING (public.is_profile_admin());

CREATE POLICY "invite_codes_admin_insert"
  ON public.invite_codes
  FOR INSERT
  WITH CHECK (public.is_profile_admin());

CREATE POLICY "invite_codes_admin_update"
  ON public.invite_codes
  FOR UPDATE
  USING (public.is_profile_admin())
  WITH CHECK (public.is_profile_admin());

-- Anon/authenticated: verify a specific code only (no table SELECT)
CREATE OR REPLACE FUNCTION public.verify_invite_code(p_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invite_codes
    WHERE code = upper(trim(p_code))
      AND status = 'unused'
  );
$$;

REVOKE ALL ON FUNCTION public.verify_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_invite_code(text) TO anon, authenticated;
