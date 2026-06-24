-- Idempotent (re)create consume_invite_code and reload PostgREST schema cache.
-- Run this if signup passes verify but fails with "초대 코드 처리 중 오류" (022 never applied).

CREATE OR REPLACE FUNCTION public.consume_invite_code(p_code text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invite_codes
  SET
    status = 'used',
    used_at = now(),
    used_by_user_id = p_user_id
  WHERE code = upper(trim(p_code))
    AND status = 'unused';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_invite_code(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_invite_code(text, uuid) TO service_role;

NOTIFY pgrst, 'reload schema';
