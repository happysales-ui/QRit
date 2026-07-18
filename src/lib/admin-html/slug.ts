const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/;

export function normalizeHtmlPageSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function validateHtmlPageSlug(slug: string): string | null {
  const normalized = normalizeHtmlPageSlug(slug);

  if (!normalized) {
    return "슬러그를 입력해 주세요.";
  }

  if (!SLUG_REGEX.test(normalized)) {
    return "슬러그는 영문 소문자·숫자·하이픈만 사용하며 1~64자여야 합니다.";
  }

  return null;
}
