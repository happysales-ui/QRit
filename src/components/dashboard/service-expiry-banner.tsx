import {
  formatExpiryDate,
  getDaysUntilExpiry,
} from "@/lib/service-expiry";
import type { Profile } from "@/types";

interface ServiceExpiryBannerProps {
  profile: Profile;
}

export function ServiceExpiryBanner({ profile }: ServiceExpiryBannerProps) {
  const daysRemaining = getDaysUntilExpiry(profile.expired_at);
  const showWarning = daysRemaining <= 30 && daysRemaining > 0;

  return (
    <section className="mb-8 rounded-xl border border-violet-100 bg-white p-6 shadow-sm">
      <p className="text-sm text-zinc-600">
        서비스 만료일:{" "}
        <span className="font-semibold text-zinc-900">
          {formatExpiryDate(profile.expired_at)}
        </span>
      </p>
      {showWarning ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
          🔔 팔찌 사용 기간이 {daysRemaining}일 남았습니다. 연장 신청(갱신료
          1만원)을 진행해 주세요.
        </p>
      ) : null}
    </section>
  );
}
