import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminGateForm } from "@/components/admin/admin-gate-form";
import { hasAdminAccess, isAdmin } from "@/lib/auth/admin";
import { isAdminPasswordConfigured } from "@/lib/auth/admin-gate";
import { getProfileForUser } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { qritBrand } from "@/lib/qrit-brand-theme";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await hasAdminAccess()) {
    return children;
  }

  if (isAdminPasswordConfigured()) {
    return (
      <main className={qritBrand.authPageBg}>
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <Image
              src="/qrit-logo.png"
              alt=""
              width={64}
              height={64}
              className="rounded-full"
              aria-hidden
            />
            <p className="text-sm font-medium text-zinc-600">QRit 관리자</p>
          </div>
          <AdminGateForm />
          <p className="mt-6 text-center text-sm text-zinc-500">
            <Link href="/dashboard" className={qritBrand.linkLg}>
              ← 대시보드로 돌아가기
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const profile = await getProfileForUser(user.id);

  if (!isAdmin(profile)) {
    redirect("/dashboard");
  }

  return children;
}
