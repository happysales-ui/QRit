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
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">관리자</h2>
        <p className="mt-1 text-sm text-zinc-600">
          인증코드 발급, 회원 목록, QR 제작, 만료일 연장
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/invite-codes"
          className="rounded-xl border border-[#d4e8ea] bg-white p-4 transition-colors hover:border-[#147278]/40 hover:bg-[#faf8f3]/60"
        >
          <span className="block text-sm font-semibold text-zinc-900">
            인증코드 발급
          </span>
          <span className="mt-1 block text-xs text-zinc-500">
            가입 전 코드 생성 · 회원 조회 불필요
          </span>
        </Link>
        <Link
          href="/admin/users"
          className="rounded-xl border border-[#d4e8ea] bg-white p-4 transition-colors hover:border-[#147278]/40 hover:bg-[#faf8f3]/60"
        >
          <span className="block text-sm font-semibold text-zinc-900">
            가입 회원 목록
          </span>
          <span className="mt-1 block text-xs text-zinc-500">
            전체 회원 구독·가입일 확인
          </span>
        </Link>
        <Link
          href="/admin/maker"
          className="rounded-xl border border-[#F5C518]/40 bg-[#F5C518]/15 p-4 transition-colors hover:border-[#F5C518]/60 hover:bg-[#F5C518]/25"
        >
          <span className="block text-sm font-semibold text-zinc-900">
            QR 제작
          </span>
          <span className="mt-1 block text-xs text-zinc-600">
            고객 QR 코드 제작 도구
          </span>
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-900">
          회원 조회 · 만료일 연장
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          이미 가입한 회원의 서비스 만료일을 연장할 때 사용합니다. 인증코드
          발급과 별도 기능입니다.
        </p>

        <form action={lookupFormAction} className="mt-4 flex flex-wrap gap-3">
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
          <div className="mt-4 rounded-xl border border-[#F5C518]/20 bg-[#faf8f3]/40 p-4">
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
      </div>
    </section>
  );
}
