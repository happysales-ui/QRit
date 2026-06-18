import { ManageProfileLink } from "@/components/profile/manage-profile-link";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileLinkButton } from "@/components/profile/profile-link-button";
import {
  QritShopBanner,
  QRIT_SHOP_BANNER_OFFSET_CLASS,
} from "@/components/profile/qrit-shop-banner";
import { getTransferLinkHref } from "@/lib/transfer-link";
import type { LinkBlock, Profile } from "@/types";

interface ProfilePageProps {
  profile: Profile;
  links: LinkBlock[];
}

export function ProfilePage({ profile, links }: ProfilePageProps) {
  const activeLinks = links
    .filter((link) => link.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-violet-100/80 via-violet-50/40 to-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-56 translate-x-1/4 translate-y-1/4 rounded-full bg-fuchsia-200/25 blur-3xl" />
      </div>

      <div
        className={`relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-8 ${QRIT_SHOP_BANNER_OFFSET_CLASS}`}
      >
        <ProfileHeader profile={profile} />

        <nav
          aria-label="프로필 링크"
          className="mt-8 flex flex-1 flex-col gap-3"
        >
          {activeLinks.map((link) => (
            <ProfileLinkButton
              key={link.id}
              title={link.title}
              url={link.url}
              href={getTransferLinkHref(profile.username, link) ?? undefined}
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
