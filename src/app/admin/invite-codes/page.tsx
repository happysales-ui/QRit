import { InviteCodesPanel } from "@/app/admin/invite-codes/invite-codes-panel";
import { requireAdminAccess } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminInviteCodesPage() {
  const { supabase } = await requireAdminAccess();

  const { data: codes, error } = await supabase
    .from("invite_codes")
    .select("id, code, status, created_at, used_at, note")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="mx-auto mt-10 max-w-4xl rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
        인증코드 목록을 불러오지 못했습니다. Supabase SQL 편집기에서{" "}
        <code className="font-mono text-xs">015_invite_codes.sql</code> 마이그레이션을 실행했는지
        확인해 주세요.
      </section>
    );
  }

  return <InviteCodesPanel codes={codes ?? []} />;
}
