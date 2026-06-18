"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, type FormEvent } from "react";
import { signupAction, type AuthActionState } from "@/app/(auth)/actions";
import {
  getSupabaseConfigErrorMessageForClient,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

const initialState: AuthActionState = {};
const SUBMIT_TIMEOUT_MS = 30_000;

export function SignupForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signupAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [state.redirectTo, router]);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setTimedOut(true);
      if (process.env.NODE_ENV === "development") {
        console.error("[signup] request timed out after", SUBMIT_TIMEOUT_MS, "ms");
      }
    }, SUBMIT_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isPending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    setTimedOut(false);

    const formData = new FormData(event.currentTarget);

    try {
      await formAction(formData);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[signup] uncaught action error", error);
      }
      setClientError("요청 처리 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.");
    }
  }

  const displayError = clientError ?? state.error;
  const supabaseMissing = !isSupabaseConfigured();

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">회원가입</h1>
      <p className="mt-1 text-sm text-zinc-500">프로필 URL에 사용할 사용자명을 함께 설정하세요.</p>

      {supabaseMissing ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          {getSupabaseConfigErrorMessageForClient()}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
            사용자명
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            pattern="[a-z0-9]{3,30}"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="myprofile"
          />
          <p className="mt-1 text-xs text-zinc-400">
            소문자, 숫자 · 3~30자
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-zinc-700">
            휴대폰 번호
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="numeric"
            pattern="[0-9\-+\s]{10,13}"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="01012345678"
          />
          <p className="mt-1 text-xs text-zinc-400">
            숫자만 입력 (하이픈 없이 10~11자리)
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="6자 이상"
          />
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-zinc-700">
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="비밀번호 다시 입력"
          />
        </div>

        {displayError ? (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {displayError}
          </p>
        ) : null}

        {timedOut && isPending ? (
          <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            요청 시간이 초과되었습니다. Supabase 연결 및 이메일 확인 설정을 확인한 뒤 페이지를 새로고침하고 다시 시도해 주세요.
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors",
            "hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isPending ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-violet-600 hover:text-violet-700">
          로그인
        </Link>
      </p>
    </div>
  );
}
