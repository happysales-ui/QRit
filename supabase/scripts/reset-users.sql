-- =============================================================================
-- QR Jewelry: Reset all registered users (manual one-time script)
-- QR Jewelry: 등록된 모든 사용자 초기화 (수동 1회 실행 스크립트)
-- =============================================================================
--
-- ⚠️  DESTRUCTIVE — permanently deletes every user account and all profile/link data.
-- ⚠️  파괴적 작업 — 모든 계정·프로필·링크 데이터가 영구 삭제됩니다.
--
-- HOW TO RUN / 실행 방법:
--   1. Supabase Dashboard → SQL Editor
--   2. Paste this entire script and click Run (runs as postgres role)
--   3. Users can sign up again; handle_new_user trigger recreates profiles
--
-- FK order:
--   profiles.default_link_id → links (must nullify before deleting links)
--   links.profile_id → profiles (ON DELETE CASCADE)
--   profiles.id → auth.users (ON DELETE CASCADE)
--   auth.users child rows (identities, sessions, etc.) cascade on user delete
--
-- This script is NOT applied automatically by migrations — run only when intended.
-- =============================================================================

BEGIN;

-- 1. Break circular FK: profiles.default_link_id → links
UPDATE public.profiles
SET default_link_id = NULL
WHERE default_link_id IS NOT NULL;

-- 2. Remove all link blocks
DELETE FROM public.links;

-- 3. Remove all profiles (redundant if step 4 runs; explicit for clarity)
DELETE FROM public.profiles;

-- 4. Remove all auth users (requires postgres/service role in SQL Editor)
DELETE FROM auth.users;

COMMIT;

-- Verify (optional — run separately after commit):
-- SELECT count(*) AS profiles FROM public.profiles;
-- SELECT count(*) AS links FROM public.links;
-- SELECT count(*) AS users FROM auth.users;
