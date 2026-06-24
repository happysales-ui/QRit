"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

const initialState: ActionState = {};

export function PasswordChangeForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <section className={qritBrand.card}>
      <h2 className="text-lg font-semibold text-zinc-900">비밀번호 변경</h2>
      <p className="mt-1 text-sm text-zinc-500">
        현재 비밀번호를 확인한 뒤 새 비밀번호로 변경할 수 있습니다.
      </p>

      <form
        key={state.success ? "reset" : "form"}
        action={formAction}
        className="mt-4 space-y-4"
      >
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-zinc-700"
          >
            현재 비밀번호
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={qritBrand.inputDashboard}
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-zinc-700"
          >
            새 비밀번호
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className={qritBrand.inputDashboard}
            placeholder="6자 이상"
          />
        </div>

        <div>
          <label
            htmlFor="newPasswordConfirm"
            className="block text-sm font-medium text-zinc-700"
          >
            새 비밀번호 확인
          </label>
          <input
            id="newPasswordConfirm"
            name="newPasswordConfirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className={qritBrand.inputDashboard}
            placeholder="비밀번호 다시 입력"
          />
        </div>

        {state.error ? (
          <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className={cn(qritBrand.primaryButton, "w-full sm:w-auto")}
        >
          {isPending ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </section>
  );
}
