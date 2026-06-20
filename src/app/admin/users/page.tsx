import { requireAdminAccess } from "@/lib/auth/admin";
import { UsersPanel, type UserSubscriptionRow } from "@/app/admin/users/users-panel";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdminAccess();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("username, created_at, free_until, subscription_status")
    .order("free_until", { ascending: true });

  if (error) {
    return (
      <section className="mx-auto mt-10 max-w-5xl rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
        사용자 목록을 불러오지 못했습니다. Supabase SQL 편집기에서{" "}
        <code className="font-mono text-xs">016_subscription_tracking.sql</code>{" "}
        마이그레이션을 실행했는지 확인해 주세요.
      </section>
    );
  }

  return <UsersPanel users={(users ?? []) as UserSubscriptionRow[]} />;
}
