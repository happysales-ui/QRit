# Supabase setup for QR Jewelry / QR Jewelry Supabase 설정

## 1. Create a Supabase project / Supabase 프로젝트 생성

**English**

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Wait for the database to finish provisioning.

**한국어**

1. [https://supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. 데이터베이스 프로비저닝이 완료될 때까지 기다립니다.

---

## 2. Run the migration / SQL 마이그레이션 실행

**English**

1. Open your project in the Supabase Dashboard.
2. Go to **SQL Editor**.
3. Copy the contents of `supabase/migrations/001_initial.sql`.
4. Paste into a new query and click **Run**.

This creates:

- `profiles` — user profile data (username, display name, bio, avatar, theme)
- `links` — link blocks for each profile
- RLS policies for public read + owner write
- A trigger that auto-creates a profile row when a user signs up

**한국어**

1. Supabase 대시보드에서 프로젝트를 엽니다.
2. **SQL Editor**로 이동합니다.
3. `supabase/migrations/001_initial.sql` 파일 내용을 복사합니다.
4. 새 쿼리에 붙여넣고 **Run**을 클릭합니다.

생성되는 항목:

- `profiles` — 사용자 프로필 (사용자명, 표시 이름, 소개, 아바타, 테마)
- `links` — 프로필별 링크 블록
- 공개 읽기 + 소유자 쓰기 RLS 정책
- 회원가입 시 프로필을 자동 생성하는 트리거

---

## 3. Configure environment variables / 환경 변수 설정

**English**

Copy `.env.example` to `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Fill in values from **Project Settings → API** in the Supabase Dashboard:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon** `public` key (JWT `eyJ...`) **or** **publishable** key (`sb_publishable_...`) |

Restart the Next.js dev server after changing env vars.

**Vercel:** `.env.local` is not deployed. Add the same variables under **Settings → Environment Variables**, then **redeploy** ( `NEXT_PUBLIC_*` values are baked in at build time).

**한국어**

프로젝트 루트에서 `.env.example`을 `.env.local`로 복사합니다:

```bash
cp .env.example .env.local
```

Supabase 대시보드 **Project Settings → API**에서 아래 값을 입력합니다:

| 변수 | 위치 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon** `public` 키 (JWT `eyJ...`) **또는** **publishable** 키 (`sb_publishable_...`) |

환경 변수 변경 후 Next.js 개발 서버를 재시작하세요.

**Vercel:** `.env.local`은 배포되지 않습니다. **Settings → Environment Variables**에 동일 변수를 추가한 뒤 **재배포**하세요 (`NEXT_PUBLIC_*` 값은 빌드 시점에 포함됩니다).

---

## 4. Auth redirect URLs / Auth 리다이렉트 URL 설정

**English**

For email confirmation redirects to work:

1. In Supabase Dashboard, go to **Authentication → URL Configuration**.
2. Set **Site URL** to `http://localhost:3000` (or your production URL).
3. Add `http://localhost:3000/auth/callback` to **Redirect URLs**.

**한국어**

이메일 인증 후 리다이렉트가 동작하려면:

1. Supabase 대시보드 **Authentication → URL Configuration**으로 이동합니다.
2. **Site URL**을 `http://localhost:3000`(또는 배포 URL)로 설정합니다.
3. **Redirect URLs**에 `http://localhost:3000/auth/callback`을 추가합니다.

---

## 5. Verify / 확인

```bash
npm run dev
```

**English**

1. Visit `/signup` and create an account.
2. Visit `/dashboard` to edit your profile and links.
3. Visit `/{your-username}` to see the public profile page.

The `/demo` route continues to use mock data and does not require Supabase.

**한국어**

1. `/signup`에서 계정을 만듭니다.
2. `/dashboard`에서 프로필과 링크를 편집합니다.
3. `/{your-username}`에서 공개 프로필을 확인합니다.

`/demo` 경로는 Supabase 없이 목(mock) 데이터를 사용합니다.

---

## 6. Reset all users (manual) / 전체 사용자 초기화 (수동)

**English**

To wipe every registered account so users can sign up again (e.g. after testing):

1. Open **SQL Editor** in the Supabase Dashboard (runs as `postgres` — required to delete `auth.users`).
2. Copy the contents of `supabase/scripts/reset-users.sql`.
3. Paste and click **Run**.

This permanently deletes all links, profiles, and auth users. It is **not** run automatically by migrations.

**한국어**

등록된 모든 계정을 삭제하고 다시 회원가입할 수 있게 하려면:

1. Supabase 대시보드 **SQL Editor**를 엽니다 (`postgres` 권한 필요 — `auth.users` 삭제).
2. `supabase/scripts/reset-users.sql` 내용을 복사합니다.
3. 붙여넣고 **Run**을 클릭합니다.

모든 링크·프로필·인증 사용자가 영구 삭제됩니다. 마이그레이션으로 자동 실행되지 않습니다.

---

## 7. Admin users / 관리자 계정

**English**

Run `supabase/migrations/011_profiles_is_admin.sql` in the SQL Editor (or apply all migrations in order). This adds `profiles.is_admin` and grants admin to username `hyun1016` if that account exists.

To grant admin on an existing database without re-running the full migration:

1. Open **SQL Editor**.
2. Run `supabase/scripts/grant-admin.sql` (edit the username if needed).

**What admins can do**

| Capability | Where |
|------------|--------|
| QR code generator for jewelry production | `/admin/maker` (login + admin required) |
| Look up any customer by username | Dashboard → **관리자** panel |
| Extend a customer's service expiry (`expired_at`) | Dashboard → **관리자** panel |
| Admin badge on dashboard | Shown when `is_admin = true` |

Admin privileges cannot be self-granted through the app API. Only direct SQL (postgres role) can set `is_admin = true`.

**한국어**

SQL Editor에서 `supabase/migrations/011_profiles_is_admin.sql`을 실행합니다(또는 마이그레이션을 순서대로 모두 적용). `profiles.is_admin` 컬럼이 추가되고, `hyun1016` 계정이 있으면 관리자로 설정됩니다.

이미 운영 중인 DB에만 관리자를 부여하려면 `supabase/scripts/grant-admin.sql`을 실행하세요(필요 시 사용자명 수정).

**관리자 권한**

| 기능 | 위치 |
|------|------|
| 팔찌용 QR 코드 제작 | `/admin/maker` (로그인 + 관리자) |
| 사용자명으로 고객 조회 | 대시보드 → **관리자** 패널 |
| 서비스 만료일(`expired_at`) 연장 | 대시보드 → **관리자** 패널 |
| 대시보드 관리자 뱃지 | `is_admin = true`일 때 표시 |

앱 API로는 `is_admin`을 스스로 올릴 수 없습니다. SQL Editor(postgres)에서만 부여할 수 있습니다.

---

## 8. Profile avatar storage / 프로필 이미지 Storage

**English**

Profile photos are stored in Supabase Storage bucket `avatars` (not pasted URLs).

1. Open **SQL Editor** in the Supabase Dashboard.
2. Copy the contents of `supabase/migrations/012_avatars_storage.sql`.
3. Paste into a new query and click **Run**.

This creates:

- Public bucket `avatars` (JPEG, PNG, WebP, max 2MB per file)
- RLS: authenticated users can upload/update/delete only under `{user_id}/avatar.{ext}`
- Public read for profile pages

**If the migration was not applied**, create the bucket manually:

1. Go to **Storage** in the Supabase Dashboard.
2. Click **New bucket**.
3. Name: `avatars`, enable **Public bucket**.
4. Set file size limit to **2 MB** and allowed MIME types to `image/jpeg`, `image/png`, `image/webp` (if available in bucket settings).
5. Still run `012_avatars_storage.sql` in **SQL Editor** for RLS policies (required for uploads).

After setup, users upload a photo from **Dashboard → 프로필 설정**; the public URL is saved in `profiles.avatar_url`.

**한국어**

프로필 사진은 URL 입력이 아니라 Supabase Storage `avatars` 버킷에 저장됩니다.

1. Supabase 대시보드 **SQL Editor**를 엽니다.
2. `supabase/migrations/012_avatars_storage.sql` 내용을 복사합니다.
3. 새 쿼리에 붙여넣고 **Run**을 클릭합니다.

생성/설정 항목:

- 공개 버킷 `avatars` (JPEG, PNG, WebP, 파일당 최대 2MB)
- RLS: 로그인 사용자는 `{user_id}/avatar.{ext}` 경로에만 업로드·수정·삭제 가능
- 프로필 페이지 공개 읽기

**마이그레이션을 적용하지 않은 경우** 버킷을 수동으로 만듭니다:

1. Supabase 대시보드 **Storage**로 이동합니다.
2. **New bucket**을 클릭합니다.
3. 이름: `avatars`, **Public bucket** 활성화.
4. 파일 크기 제한 **2 MB**, 허용 MIME `image/jpeg`, `image/png`, `image/webp` (버킷 설정에서 가능한 경우).
5. 업로드 RLS를 위해 **SQL Editor**에서 `012_avatars_storage.sql`은 반드시 실행합니다.

설정 후 **대시보드 → 프로필 설정**에서 사진을 업로드하면 공개 URL이 `profiles.avatar_url`에 저장됩니다.
