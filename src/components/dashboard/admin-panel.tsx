"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  extendExpiryAction,
  lookupUserAction,
  type AdminActionState,
} from "@/app/dashboard/admin-actions";
import { qritBrand } from "@/lib/qrit-brand-theme";

const initialState: AdminActionState = {};

export function AdminPanel() {
  const [lookupState, lookupFormAction, lookupPending] = useActionState(
    lookupUserAction,
    initialState,
  );
  const [extendState, extendFormAction, extendPending] = useActionState(
    extendExpiryAction,
    initialState,
  );

  const user = extendState.user ?? lookupState.user;
  const error = extendState.error ?? lookupState.error;
  const success = extendState.success;

  return (
    <section className="mb-8 rounded-xl border border-[#F5C518]/30 bg-[#F5C518]/10 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">관리자</h2>
          <p className="mt-1 text-sm text-zinc-600">
            고객 조회, 서비스 만료일 연장, QR 제작 도구
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/admin/users"
            className={qritBrand.secondaryButton + " !w-auto px-4 py-2.5 text-sm"}
          >
            사용자 →
          </Link>
          <Link
            href="/admin/invite-codes"
            className={qritBrand.secondaryButton + " !w-auto px-4 py-2.5 text-sm"}
          >
            인증코드 →
          </Link>
          <Link
            href="/admin/maker"
            className={`shrink-0 ${qritBrand.primaryButton}`}
          >
            QR 제작 →
          </Link>
        </div>
      </div>

      <form action={lookupFormAction} className="flex flex-wrap gap-3">
        <input
          type="text"
          name="username"
          placeholder="사용자명 (예: hyun1016)"
          defaultValue={user?.username ?? ""}
          className={`min-w-0 flex-1 ${qritBrand.inputDashboard}`}
        />
        <button
          type="submit"
          disabled={lookupPending}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
        >
          {lookupPending ? "조회 중…" : "조회"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-3 text-sm text-emerald-700" role="status">
          {success}
        </p>
      ) : null}

      {user ? (
        <div className="mt-4 rounded-xl border border-[#F5C518]/20 bg-white p-4">
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">사용자명</dt>
              <dd className="font-medium text-zinc-900">{user.username}</dd>
            </div>
            {user.displayName ? (
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">표시 이름</dt>
                <dd className="text-zinc-900">{user.displayName}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">무료 이용 종료</dt>
              <dd className="font-medium text-zinc-900">
                {user.freeUntilFormatted}
              </dd>
            </div>
          </dl>

          <form action={extendFormAction} className="mt-4 flex flex-wrap gap-3">
            <input type="hidden" name="username" value={user.username} />
            <input
              type="number"
              name="days"
              min={1}
              max={3650}
              defaultValue={365}
              className={`w-28 ${qritBrand.inputDashboard}`}
            />
            <span className="self-center text-sm text-zinc-500">일 연장</span>
            <button
              type="submit"
              disabled={extendPending}
              className={`${qritBrand.yellowButton} disabled:opacity-50`}
            >
              {extendPending ? "처리 중…" : "만료일 연장"}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
