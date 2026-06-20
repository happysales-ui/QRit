"use client";

import { useActionState } from "react";
import {
  updateProfileAction,
  type ActionState,
} from "@/app/dashboard/actions";
import type { Profile } from "@/types";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

const initialState: ActionState = {};

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
          사용자명
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={profile.username}
          pattern="[a-z0-9]{3,30}"
          className={qritBrand.inputDashboard}
        />
        <p className="mt-1 text-xs text-zinc-400">소문자, 숫자 · 3~30자</p>
        <p className="mt-0.5 text-xs text-zinc-400">프로필 URL: /{profile.username}</p>
      </div>

      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-zinc-700">
          표시 이름
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile.display_name ?? ""}
          className={qritBrand.inputDashboard}
          placeholder="홍길동"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-zinc-700">
          소개
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ""}
          className={cn(qritBrand.inputDashboard, "resize-none")}
          placeholder="간단한 자기소개를 입력하세요"
        />
      </div>

      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-zinc-700">
          프로필 이미지 URL
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="url"
          defaultValue={profile.avatar_url ?? ""}
          className={qritBrand.inputDashboard}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      {state.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {state.error}
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
        className={qritBrand.primaryButton}
      >
        {isPending ? "저장 중..." : "프로필 저장"}
      </button>
    </form>
  );
}
