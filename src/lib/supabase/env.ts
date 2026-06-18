const PLACEHOLDER_URLS = new Set([
  "https://placeholder.supabase.co",
  "https://your-project-id.supabase.co",
]);

const PLACEHOLDER_KEYS = new Set([
  "placeholder-anon-key",
  "your-anon-key-here",
]);

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlaceholderUrl(url: string): boolean {
  const trimmed = url.trim();
  return (
    PLACEHOLDER_URLS.has(trimmed) ||
    trimmed.includes("your-project") ||
    !trimmed.endsWith(".supabase.co")
  );
}

function isPlaceholderKey(key: string): boolean {
  const trimmed = key.trim();
  return (
    PLACEHOLDER_KEYS.has(trimmed) ||
    trimmed.includes("your-anon") ||
    trimmed === "your-publishable-key"
  );
}

export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co"
  );
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isNonEmpty(url) || !isNonEmpty(key)) {
    return false;
  }

  if (isPlaceholderUrl(url) || isPlaceholderKey(key)) {
    return false;
  }

  return true;
}

/** Server-side: Vercel vs local hint. Client: combined message (VERCEL is server-only). */
export function getSupabaseConfigErrorMessage(): string {
  if (process.env.VERCEL === "1") {
    return (
      "Supabase 연결 설정이 없습니다. Vercel 대시보드 → Settings → Environment Variables에 " +
      "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가한 뒤 재배포해 주세요. " +
      "(Supabase Dashboard → Project Settings → API에서 Project URL과 anon/public 또는 publishable 키를 복사)"
    );
  }

  return (
    "Supabase 연결 설정이 없습니다. 프로젝트 루트 .env.local에 " +
    "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정한 뒤 개발 서버를 재시작해 주세요. " +
    "(Vercel 배포 시에는 .env.local 대신 Vercel Environment Variables에 동일한 값을 설정해야 합니다.)"
  );
}

/** Client-safe banner text (works in browser where VERCEL env is unavailable). */
export function getSupabaseConfigErrorMessageForClient(): string {
  return (
    "Supabase 연결 설정이 없습니다. " +
    "로컬: .env.local에 NEXT_PUBLIC_SUPABASE_URL·NEXT_PUBLIC_SUPABASE_ANON_KEY 설정 후 dev 서버 재시작 · " +
    "Vercel: Settings → Environment Variables에 동일 변수 추가 후 재배포"
  );
}
