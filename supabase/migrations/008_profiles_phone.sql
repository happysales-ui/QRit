-- Phone-based auth: store display phone on profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique_idx
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;

-- Store phone from signup metadata when creating profile
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

  INSERT INTO public.profiles (id, username, phone, expired_at)
  VALUES (NEW.id, candidate, user_phone, now() + interval '2 years');

  RETURN NEW;
END;
$$;
