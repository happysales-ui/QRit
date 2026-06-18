-- Service expiration: 2 years from account creation

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;

-- Backfill existing profiles from created_at
UPDATE public.profiles
SET expired_at = created_at + interval '2 years'
WHERE expired_at IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN expired_at SET NOT NULL,
  ALTER COLUMN expired_at SET DEFAULT (now() + interval '2 years');

-- Ensure new signups get expired_at on profile creation
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
BEGIN
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

  INSERT INTO public.profiles (id, username, expired_at)
  VALUES (NEW.id, candidate, now() + interval '2 years');

  RETURN NEW;
END;
$$;
