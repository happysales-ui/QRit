const ALLOWED_EXTERNAL_HREF_REGEX = /^(https?:\/\/|mecard:|qrit:\/\/)/i;

const BLOCKED_URL_SCHEMES = new Set([
  "javascript",
  "data",
  "vbscript",
  "file",
]);

/** Returns href when url uses an allowed external scheme; otherwise null. */
export function safeExternalHref(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || !ALLOWED_EXTERNAL_HREF_REGEX.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function isBlockedUrlScheme(url: string): boolean {
  const trimmed = url.trim();
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  if (!match) {
    return false;
  }
  return BLOCKED_URL_SCHEMES.has(match[1].toLowerCase());
}

export function validateSafeUrlScheme(url: string): string | null {
  if (isBlockedUrlScheme(url)) {
    return "허용되지 않는 URL 형식입니다.";
  }
  return null;
}
