-- Grant admin privileges to a user by username.
-- Run in Supabase SQL Editor (postgres role). Safe to re-run.
--
-- Admin capabilities:
--   - Access /admin/maker (QR generator for jewelry production)
--   - Dashboard admin panel: look up customers, extend service expiry
--   - Update any profile's expired_at via RLS (app-enforced)
--
-- To grant admin to another user, change the username below:
--   UPDATE public.profiles SET is_admin = true WHERE username = 'otheruser';

UPDATE public.profiles
SET is_admin = true
WHERE username = 'hyun1016';

-- Verify:
-- SELECT username, is_admin, expired_at FROM public.profiles WHERE username = 'hyun1016';
