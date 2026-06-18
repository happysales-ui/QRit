export const USERNAME_REGEX = /^[a-z0-9]{3,30}$/;

export const RESERVED_USERNAMES = new Set([
  "admin",
  "signup",
  "login",
  "dashboard",
  "auth",
  "api",
]);

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  const normalized = normalizeUsername(username);

  if (!USERNAME_REGEX.test(normalized)) {
    return "사용자명은 소문자, 숫자만 사용할 수 있으며 3~30자여야 합니다.";
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return "사용할 수 없는 사용자명입니다.";
  }

  return null;
}

export function validateUrl(url: string): string | null {
  const trimmed = url.trim();

  if (!trimmed) {
    return "URL을 입력해 주세요.";
  }

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "http 또는 https URL만 사용할 수 있습니다.";
    }
  } catch {
    return "올바른 URL 형식이 아닙니다.";
  }

  return null;
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

/** Digits-only Korean mobile number (e.g. 01012345678). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function validatePhone(phone: string): string | null {
  const digits = normalizePhone(phone);

  if (!/^\d{10,11}$/.test(digits)) {
    return "휴대폰 번호는 10~11자리 숫자여야 합니다.";
  }

  if (!digits.startsWith("01")) {
    return "올바른 휴대폰 번호 형식이 아닙니다.";
  }

  if (digits.length === 11 && !digits.startsWith("010")) {
    return "올바른 휴대폰 번호 형식이 아닙니다.";
  }

  return null;
}
