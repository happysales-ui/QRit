-- Fix for 016 when public_profiles view update failed (42P16 column rename error).
-- Safe to re-run: idempotent table changes + drop/recreate view.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS free_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free';

UPDATE public.profiles
SET free_until = COALESCE(expired_at, created_at + interval '2 years')
WHERE free_until IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN free_until SET DEFAULT (now() + interval '2 years');

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'free_until'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN free_until SET NOT NULL;
  END IF;
END $$;

UPDATE public.profiles
SET expired_at = free_until
WHERE expired_at IS DISTINCT FROM free_until;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('free', 'expired', 'paid'));

UPDATE public.profiles
SET subscription_status = 'expired'
WHERE subscription_status = 'free'
  AND free_until < now();

CREATE OR REPLACE FUNCTION public.sync_expired_at_from_free_until()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.free_until IS DISTINCT FROM OLD.free_until THEN
    NEW.expired_at := NEW.free_until;
    IF NEW.subscription_status = 'free' AND NEW.free_until >= now() THEN
      NULL;
    ELSIF NEW.subscription_status = 'free' AND NEW.free_until < now() THEN
      NEW.subscription_status := 'expired';
    ELSIF NEW.subscription_status = 'expired' AND NEW.free_until >= now() THEN
      NEW.subscription_status := 'free';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_expired_at ON public.profiles;
CREATE TRIGGER profiles_sync_expired_at
  BEFORE UPDATE OF free_until ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_expired_at_from_free_until();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  candidate TEXT;
  suffix INT := 0;
  user_phone TEXT;
  trial_end TIMESTAMPTZ := now() + interval '2 years';
BEGIN
  user_phone := NULLIF(trim(NEW.raw_user_meta_data ->> 'phone'), '');

  base_username := COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    split_part(NEW.email, '@', 1)
  );

  base_username := lower(regexp_replace(base_username, '[^a-z0-9]', '', 'g'));

  IF char_length(base_username) < 3 THEN
    base_username := 'user' || substr(replace(NEW.id::text, '-', ''), 1, 8);
  END IF;

  IF char_length(base_username) > 30 THEN
    base_username := substr(base_username, 1, 30);
  END IF;

  candidate := base_username;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    suffix := suffix + 1;
    candidate := substr(base_username, 1, 30 - char_length(suffix::text)) || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (
    id,
    username,
    phone,
    expired_at,
    free_until,
    subscription_status
  )
  VALUES (
    NEW.id,
    candidate,
    user_phone,
    trial_end,
    trial_end,
    'free'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

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
