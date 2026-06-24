import { ManageProfileLink } from "@/components/profile/manage-profile-link";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileLinkButton } from "@/components/profile/profile-link-button";
import {
  QritShopBanner,
  QRIT_SHOP_BANNER_OFFSET_CLASS,
} from "@/components/profile/qrit-shop-banner";
import { getContactLinkHref } from "@/lib/contact-link";
import { getTransferLinkHref } from "@/lib/transfer-link";
import { qritBrand } from "@/lib/qrit-brand-theme";
import type { LinkBlock, Profile } from "@/types";

interface ProfilePageProps {
  profile: Profile;
  links: LinkBlock[];
  showDefaultLinkNote?: boolean;
}

export function ProfilePage({
  profile,
  links,
  showDefaultLinkNote = false,
}: ProfilePageProps) {
  const activeLinks = links
    .filter((link) => link.is_active && !link.is_hidden)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={qritBrand.pageBgProfile}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={qritBrand.profileGlowTeal} />
        <div className={qritBrand.profileGlowYellow} />
      </div>

      <div
        className={`relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-8 ${QRIT_SHOP_BANNER_OFFSET_CLASS}`}
      >
        <ProfileHeader profile={profile} />

        {showDefaultLinkNote ? (
          <p className="mt-4 rounded-xl border border-[#d4e8ea]/70 bg-[#e8f4f5]/50 px-4 py-3 text-center text-xs leading-relaxed text-[#0d5c63]">
            QR 스캔 시에는 선택한 링크로 바로 이동합니다. 여기서는 등록한
            모든 링크를 볼 수 있습니다.
          </p>
        ) : null}

        <nav
          aria-label="프로필 링크"
          className="mt-8 flex flex-1 flex-col gap-3"
        >
          {activeLinks.map((link) => (
            <ProfileLinkButton
              key={link.id}
              link={link}
              href={
                getTransferLinkHref(profile.username, link) ??
                getContactLinkHref(profile.username, link) ??
                undefined
              }
            />
          ))}
        </nav>

        <footer className="mt-10 flex flex-col items-center gap-3 pb-2 text-center">
          <ManageProfileLink />
          <p className="text-xs font-medium tracking-wide text-zinc-400">
            Powered by QRit Jewelry
          </p>
        </footer>
      </div>

      <QritShopBanner />
    </div>
  );
}
