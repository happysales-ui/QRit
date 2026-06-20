"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/app/(auth)/actions";
import { PhoneInput } from "@/components/auth/phone-input";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

const initialState: AuthActionState = {};

interface LoginFormProps {
  authError?: string;
}

export function LoginForm({ authError }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">로그인</h1>
      <p className="mt-1 text-sm text-zinc-500">계정에 로그인하여 프로필을 관리하세요.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-zinc-700">
            휴대폰 번호
          </label>
          <PhoneInput id="phone" name="phone" required className={qritBrand.input} />
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
            autoComplete="current-password"
            className={qritBrand.input}
            placeholder="••••••••"
          />
        </div>

        {authError ? (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {authError}
          </p>
        ) : null}

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
          {isPending ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-500">
        비밀번호를 잊으셨나요?{" "}
        <Link href="/forgot-password" className={qritBrand.linkLg}>
          비밀번호 찾기
        </Link>
      </p>

      <p className="mt-6 text-center text-sm text-zinc-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className={qritBrand.linkLg}>
          회원가입
        </Link>
      </p>
    </div>
  );
}
