"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resetPasswordAction,
  type PasswordResetActionState,
} from "@/app/(auth)/password-reset-actions";
import { PhoneInput } from "@/components/auth/phone-input";
import { USERNAME_HELPER_TEXT } from "@/lib/auth/validation";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

const initialState: PasswordResetActionState = {};

interface ForgotPasswordFormProps {
  kakaoChatUrl: string;
}

export function ForgotPasswordForm({ kakaoChatUrl }: ForgotPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">비밀번호 찾기</h1>
      <p className="mt-1 text-sm text-zinc-500">
        가입 시 사용한 휴대폰 번호와 사용자명으로 본인 확인 후 새 비밀번호를 설정할 수
        있습니다.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-zinc-700">
            휴대폰 번호
          </label>
          <PhoneInput id="phone" name="phone" required className={qritBrand.input} />
        </div>

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
            className={qritBrand.input}
            placeholder="myprofile"
          />
          <p className="mt-1 text-xs text-zinc-400">{USERNAME_HELPER_TEXT}</p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
            새 비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className={qritBrand.input}
            placeholder="6자 이상"
          />
        </div>

        <div>
          <label
            htmlFor="passwordConfirm"
            className="block text-sm font-medium text-zinc-700"
          >
            새 비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className={qritBrand.input}
            placeholder="비밀번호 다시 입력"
          />
        </div>

        {state.error ? (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className={cn("w-full", qritBrand.primaryButton)}
        >
          {isPending ? "재설정 중..." : "비밀번호 재설정"}
        </button>
      </form>

      <section className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        <h2 className="font-semibold text-zinc-900">도움이 필요하신가요?</h2>
        <p className="mt-2 leading-relaxed">
          사용자명을 잊으셨거나 재설정이 되지 않으면 관리자 카카오톡 1:1 채팅으로
          문의해 주세요.
        </p>
        <a
          href={kakaoChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 inline-block ${qritBrand.kakaoLink}`}
        >
          관리자 카카오톡 1:1 채팅 열기 →
        </a>
      </section>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/login" className={qritBrand.linkLg}>
          ← 로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
