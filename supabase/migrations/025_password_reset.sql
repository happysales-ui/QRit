-- Self-service password reset: rate limiting + profile verification RPCs.
-- Apply after 019_phone_privacy_hardening.sql.

CREATE TABLE IF NOT EXISTS public.password_reset_attempts (
  bucket_key text PRIMARY KEY,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  last_attempt_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.password_reset_attempts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_password_reset_rate_limit(
  p_bucket_key text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.password_reset_attempts%ROWTYPE;
  v_window interval;
BEGIN
  IF p_bucket_key IS NULL OR length(trim(p_bucket_key)) = 0 THEN
    RETURN false;
  END IF;

  v_window := make_interval(mins => GREATEST(p_window_minutes, 1));

  SELECT * INTO v_row
  FROM public.password_reset_attempts
  WHERE bucket_key = p_bucket_key
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.password_reset_attempts (bucket_key)
    VALUES (p_bucket_key);
    RETURN true;
  END IF;

  IF v_row.window_start + v_window < now() THEN
    UPDATE public.password_reset_attempts
    SET attempt_count = 1,
        window_start = now(),
        last_attempt_at = now()
    WHERE bucket_key = p_bucket_key;
    RETURN true;
  END IF;

  IF v_row.attempt_count >= GREATEST(p_max_attempts, 1) THEN
    RETURN false;
  END IF;

  UPDATE public.password_reset_attempts
  SET attempt_count = attempt_count + 1,
      last_attempt_at = now()
  WHERE bucket_key = p_bucket_key;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_profile_for_password_reset(
  p_phone text,
  p_username text
)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.profiles
  WHERE phone = regexp_replace(trim(p_phone), '\D', '', 'g')
    AND username = lower(trim(p_username))
    AND phone IS NOT NULL
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.check_password_reset_rate_limit(text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_profile_for_password_reset(text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.check_password_reset_rate_limit(text, integer, integer)
  TO service_role;

GRANT EXECUTE ON FUNCTION public.verify_profile_for_password_reset(text, text)
  TO service_role;
