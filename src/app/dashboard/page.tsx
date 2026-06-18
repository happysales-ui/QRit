import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { getSiteUrl } from "@/lib/site-url";
import { BraceletModeSetting } from "@/components/dashboard/bracelet-mode-setting";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { LinksManager } from "@/components/dashboard/links-manager";
import { ServiceExpiryBanner } from "@/components/dashboard/service-expiry-banner";
import { createClient } from "@/lib/supabase/server";
import { getLinksForProfile, getProfileForUser } from "@/lib/profile";

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
      <main className="min-h-dvh bg-gradient-to-b from-violet-50 to-white px-4 py-12">
        <div className="mx-auto max-w-lg rounded-xl border border-violet-100 bg-white p-8 text-center shadow-sm">
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

  return (
    <main className="min-h-dvh bg-gradient-to-b from-violet-50 to-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              ← QRit Jewelry
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900">대시보드</h1>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
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

        <BraceletModeSetting profile={profile} links={links} />

        <section className="mb-8 rounded-xl border border-violet-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">공개 프로필</h2>
          <p className="mt-2 break-all text-sm text-zinc-600">{publicUrl}</p>
          <Link
            href={`/${profile.username}`}
            target="_blank"
            className="mt-3 inline-block text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            프로필 미리보기 →
          </Link>
        </section>

        <section className="mb-8 rounded-xl border border-violet-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">프로필 설정</h2>
          <ProfileForm profile={profile} />
        </section>

        <section className="rounded-xl border border-violet-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">링크 관리</h2>
          <LinksManager links={links} />
        </section>
      </div>
    </main>
  );
}
