export type SubscriptionStatus = "free" | "expired" | "paid";

export interface SubscriptionFields {
  free_until: string;
  subscription_status: SubscriptionStatus;
}

export function isSubscriptionExpired(
  profile: SubscriptionFields,
  now = new Date(),
): boolean {
  if (profile.subscription_status === "paid") {
    return false;
  }

  return now.getTime() > new Date(profile.free_until).getTime();
}

export function formatFreeUntilDate(freeUntil: string): string {
  return new Date(freeUntil).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatFreeUntilMessage(freeUntil: string): string {
  return `${formatFreeUntilDate(freeUntil)}까지 무료 이용 가능`;
}

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  free: "무료",
  expired: "만료",
  paid: "유료",
};
