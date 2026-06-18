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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |

Restart the Next.js dev server after changing env vars.

**한국어**

프로젝트 루트에서 `.env.example`을 `.env.local`로 복사합니다:

```bash
cp .env.example .env.local
```

Supabase 대시보드 **Project Settings → API**에서 아래 값을 입력합니다:

| 변수 | 위치 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` 키 |

환경 변수 변경 후 Next.js 개발 서버를 재시작하세요.

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
