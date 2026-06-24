-- Return distinct invite code verification statuses for signup UX.

DROP FUNCTION IF EXISTS public.verify_invite_code(text);

CREATE OR REPLACE FUNCTION public.verify_invite_code(p_code text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(trim(p_code));
  v_status text;
BEGIN
  IF v_code !~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$' THEN
    RETURN 'invalid_format';
  END IF;

  SELECT status INTO v_status
  FROM public.invite_codes
  WHERE code = v_code;

  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;

  IF v_status = 'used' THEN
    RETURN 'already_used';
  END IF;

  RETURN 'valid';
END;
$$;

REVOKE ALL ON FUNCTION public.verify_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_invite_code(text) TO anon, authenticated;
