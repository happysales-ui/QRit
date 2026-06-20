import {
  formatFreeUntilMessage,
  isSubscriptionExpired,
} from "@/lib/subscription";
import { qritBrand } from "@/lib/qrit-brand-theme";
import type { Profile } from "@/types";

interface ServiceExpiryBannerProps {
  profile: Profile;
}

export function ServiceExpiryBanner({ profile }: ServiceExpiryBannerProps) {
  const expired = isSubscriptionExpired(profile);

  return (
    <section className={`mb-8 ${qritBrand.card}`}>
      {expired ? (
        <p className="text-sm text-zinc-600">무료 이용 기간이 종료되었습니다</p>
      ) : (
        <p className="text-sm text-zinc-600">
          {formatFreeUntilMessage(profile.free_until)}
        </p>
      )}
    </section>
  );
}
