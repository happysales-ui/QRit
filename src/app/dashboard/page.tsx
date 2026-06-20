import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { authEmailToPhone } from "@/lib/auth/phone-auth";
import { getSiteUrl } from "@/lib/site-url";
import { BraceletModeSetting } from "@/components/dashboard/bracelet-mode-setting";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { LinksManager } from "@/components/dashboard/links-manager";
import { ServiceExpiryBanner } from "@/components/dashboard/service-expiry-banner";
import { AdminPanel } from "@/components/dashboard/admin-panel";
import { isAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { getLinksForProfile, getProfileForUser } from "@/lib/profile";
import { linkDashboardTheme } from "@/lib/link-dashboard-theme";
import { qritBrand } from "@/lib/qrit-brand-theme";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileForUser(user.id);

  if (!profile) {
    return (
      <main className={qritBrand.pageBg + " px-4 py-12"}>
        <div className={`mx-auto max-w-lg ${qritBrand.card} text-center`}>
          <h1 className="text-xl font-bold text-zinc-900">프로필 준비 중</h1>
          <p className="mt-2 text-sm text-zinc-500">
            프로필이 아직 생성되지 않았습니다. 잠시 후 새로고침해 주세요.
          </p>
        </div>
      </main>
    );
  }

  const links = await getLinksForProfile(profile.id);
  const siteUrl = await getSiteUrl();
  const publicUrl = `${siteUrl}/${profile.username}`;
  const displayPhone = profile.phone ?? authEmailToPhone(user.email);

  return (
    <main className={qritBrand.pageBg + " px-4 py-12"}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className={`inline-flex items-center gap-2 ${qritBrand.link}`}>
              <Image
                src="/qrit-logo.png"
                alt=""
                width={24}
                height={24}
                className="rounded-full"
                aria-hidden
              />
              <span>← QRit Jewelry</span>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900">대시보드</h1>
              {isAdmin(profile) ? (
                <span className="rounded-full bg-[#F5C518]/20 px-2.5 py-0.5 text-xs font-semibold text-[#094347]">
                  관리자
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-zinc-500">{displayPhone ?? "—"}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              로그아웃
            </button>
          </form>
        </div>

        <ServiceExpiryBanner profile={profile} />

        {isAdmin(profile) ? <AdminPanel /> : null}

        <BraceletModeSetting profile={profile} links={links} />

        <section className={`mb-8 ${qritBrand.card}`}>
          <h2 className="text-lg font-semibold text-zinc-900">공개 프로필</h2>
          <p className="mt-2 break-all text-sm text-zinc-600">{publicUrl}</p>
          <Link
            href={`/${profile.username}`}
            target="_blank"
            className={`mt-3 inline-block ${qritBrand.link}`}
          >
            프로필 미리보기 →
          </Link>
        </section>

        <section className={`mb-8 ${qritBrand.card}`}>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">프로필 설정</h2>
          <ProfileForm profile={profile} />
        </section>

        <section className={linkDashboardTheme.section}>
          <h2 className={`mb-5 ${linkDashboardTheme.sectionTitle}`}>링크 관리</h2>
          <LinksManager links={links} />
        </section>
      </div>
    </main>
  );
}
