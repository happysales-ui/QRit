import {
  InviteCodesPageClient,
} from "@/app/admin/invite-codes/invite-codes-page-client";
import type { InviteCodeRow } from "@/app/admin/invite-codes/invite-codes-panel";
import {
  getInviteCodesAuthStatus,
  requireInviteCodesAccess,
} from "@/lib/auth/admin";
import {
  getSupabaseServiceRoleConfigErrorMessage,
  isSupabaseServiceRoleConfigured,
  SUPABASE_SERVICE_ROLE_NOT_CONFIGURED,
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

function AdminConfigError({ message }: { message: string }) {
  return (
    <section className="mx-auto mt-10 max-w-4xl rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
      {message}
    </section>
  );
}

function isMissingInviteCodesTable(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (error.message?.includes("invite_codes") ?? false)
  );
}

export default async function AdminInviteCodesPage() {
  const { isAuthenticated, passwordConfigured } = await getInviteCodesAuthStatus();

  let codes: InviteCodeRow[] = [];
  let configError: string | null = null;
  let loadError: string | null = null;

  if (isAuthenticated) {
    if (!isSupabaseServiceRoleConfigured()) {
      configError = getSupabaseServiceRoleConfigErrorMessage();
    } else {
      try {
        const supabase = await requireInviteCodesAccess();

        const { data, error } = await supabase
          .from("invite_codes")
          .select("id, code, status, created_at, used_at, note")
          .order("created_at", { ascending: false });

        if (error) {
          if (isMissingInviteCodesTable(error)) {
            loadError =
              "인증코드 목록을 불러오지 못했습니다. Supabase SQL 편집기에서 015_invite_codes.sql 마이그레이션을 실행했는지 확인해 주세요.";
          } else {
            loadError = `인증코드 목록을 불러오지 못했습니다. (${error.message})`;
          }
        } else {
          codes = (data ?? []) as InviteCodeRow[];
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === SUPABASE_SERVICE_ROLE_NOT_CONFIGURED
        ) {
          configError = getSupabaseServiceRoleConfigErrorMessage();
        } else if (error instanceof Error && error.message === "FORBIDDEN") {
          configError = "관리자 인증이 필요합니다. 비밀번호를 입력해 주세요.";
        } else {
          throw error;
        }
      }
    }
  }

  if (loadError) {
    return <AdminConfigError message={loadError} />;
  }

  return (
    <>
      {configError ? <AdminConfigError message={configError} /> : null}
      <InviteCodesPageClient
        initialAuthenticated={isAuthenticated}
        passwordConfigured={passwordConfigured}
        initialCodes={codes}
        serviceRoleConfigured={isSupabaseServiceRoleConfigured()}
      />
    </>
  );
}
