import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getProfileForUser } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/maker");
  }

  const profile = await getProfileForUser(user.id);

  if (!isAdmin(profile)) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-16">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-violet-700"
        >
          ← 대시보드
        </Link>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          관리자
        </span>
      </header>
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          QRit Jewelry
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          링크나 텍스트를 입력하면 바로 QR 코드를 만들 수 있어요.
        </p>
      </div>
      {children}
    </main>
  );
}
