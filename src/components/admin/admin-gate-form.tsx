"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  unlockAdminGateAction,
  type AdminGateActionState,
} from "@/app/admin/actions";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

const initialState: AdminGateActionState = {};

export function AdminGateForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    unlockAdminGateAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className={qritBrand.cardLg}>
      <h1 className="text-xl font-bold text-zinc-900">관리자 인증</h1>
      <p className="mt-1 text-sm text-zinc-500">
        관리자 페이지에 접근하려면 비밀번호를 입력하세요. Supabase 로그인 없이도
        사용할 수 있습니다.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="admin-password"
            className="block text-sm font-medium text-zinc-700"
          >
            관리자 비밀번호
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={qritBrand.input}
            placeholder="ADMIN_PAGE_PASSWORD 값"
          />
        </div>

        {state.error ? (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className={cn("w-full", qritBrand.primaryButton)}
        >
          {isPending ? "확인 중…" : "관리자 페이지 입장"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500">
        또는{" "}
        <Link href="/login?next=/dashboard" className={qritBrand.linkLg}>
          is_admin 계정으로 로그인
        </Link>
      </p>
    </div>
  );
}
