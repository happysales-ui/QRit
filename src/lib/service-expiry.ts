const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isProfileExpired(expiredAt: string, now = new Date()): boolean {
  return now.getTime() > new Date(expiredAt).getTime();
}

export function getDaysUntilExpiry(
  expiredAt: string,
  now = new Date(),
): number {
  const diffMs = new Date(expiredAt).getTime() - now.getTime();
  return Math.ceil(diffMs / MS_PER_DAY);
}

export function formatExpiryDate(expiredAt: string): string {
  const date = new Date(expiredAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
