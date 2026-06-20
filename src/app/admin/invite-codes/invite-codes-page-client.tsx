"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  verifyAdminPasswordAction,
  type AdminPasswordActionState,
} from "@/app/admin/invite-codes/actions";
import {
  InviteCodesPanel,
  type InviteCodeRow,
} from "@/app/admin/invite-codes/invite-codes-panel";
import { AdminEnvMissingMessage } from "@/components/admin/admin-gate-shell";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

const passwordInitialState: AdminPasswordActionState = {};

type InviteCodesPageClientProps = {
  initialAuthenticated: boolean;
  passwordConfigured: boolean;
  initialCodes: InviteCodeRow[];
};

function InviteCodesPasswordGate({
  onAuthenticated,
}: {
  onAuthenticated: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    verifyAdminPasswordAction,
    passwordInitialState,
  );

  useEffect(() => {
    if (state.success) {
      onAuthenticated();
    }
  }, [state.success, onAuthenticated]);

  return (
    <section className="mx-auto mt-10 max-w-4xl">
      <div className={qritBrand.cardLg}>
        <h2 className="text-lg font-semibold text-zinc-900">관리자 인증</h2>
        <p className="mt-1 text-sm text-zinc-500">
          인증코드를 생성하려면 관리자 비밀번호를 입력하세요.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="invite-codes-admin-password"
              className="block text-sm font-medium text-zinc-700"
            >
              관리자 비밀번호
            </label>
            <input
              id="invite-codes-admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={qritBrand.input}
              placeholder="관리자 비밀번호"
            />
          </div>

          {state.error ? (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600" role="alert">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className={cn("w-full sm:w-auto", qritBrand.primaryButton)}
          >
            {isPending ? "확인 중…" : "확인"}
          </button>
        </form>
      </div>
    </section>
  );
}

export function InviteCodesPageClient({
  initialAuthenticated,
  passwordConfigured,
  initialCodes,
}: InviteCodesPageClientProps) {
  const router = useRouter();
  const [authenticatedOverride, setAuthenticatedOverride] = useState(false);
  const authenticated = initialAuthenticated || authenticatedOverride;

  function handleAuthenticated() {
    setAuthenticatedOverride(true);
    router.refresh();
  }

  if (!passwordConfigured) {
    return (
      <section className="mx-auto mt-10 max-w-4xl">
        <AdminEnvMissingMessage />
      </section>
    );
  }

  if (!authenticated) {
    return <InviteCodesPasswordGate onAuthenticated={handleAuthenticated} />;
  }

  return <InviteCodesPanel codes={initialCodes} />;
}
