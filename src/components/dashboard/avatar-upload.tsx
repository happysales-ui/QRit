"use client";

import { useActionState, useRef, useState } from "react";
import {
  uploadAvatarAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp";
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const initialState: ActionState = {};

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  displayName: string;
  updatedAt: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function avatarSrc(url: string, updatedAt: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(updatedAt)}`;
}

export function AvatarUpload({
  currentAvatarUrl,
  displayName,
  updatedAt,
}: AvatarUploadProps) {
  const [state, formAction, isPending] = useActionState(
    uploadAvatarAction,
    initialState,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const avatarUrl = state.avatarUrl ?? previewUrl ?? currentAvatarUrl;
  const cacheKey = state.updatedAt ?? updatedAt;
  const error = clientError ?? state.error;
  const success = state.success;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      setClientError("JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      setClientError("파일 크기는 2MB 이하여야 합니다.");
      event.target.value = "";
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    formRef.current?.requestSubmit();
  }

  return (
    <div>
      <span className="block text-sm font-medium text-zinc-700">
        프로필 이미지
      </span>

      <div className="mt-2 flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarSrc(avatarUrl, cacheKey)}
            alt="프로필 미리보기"
            className={cn(qritBrand.avatarImage, "size-20")}
          />
        ) : (
          <div
            aria-hidden="true"
            className={cn(qritBrand.avatarFallback, "size-20 text-lg")}
          >
            {getInitials(displayName)}
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-2">
          <form ref={formRef} action={formAction}>
            <input
              ref={inputRef}
              type="file"
              name="avatar"
              accept={ACCEPT}
              className="sr-only"
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => inputRef.current?.click()}
              className={qritBrand.primaryButton}
            >
              {isPending ? "업로드 중..." : "사진 선택"}
            </button>
          </form>
          <p className="text-xs text-zinc-400">JPEG, PNG, WebP · 최대 2MB</p>
        </div>
      </div>

      {error ? (
        <p className="mt-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}
    </div>
  );
}
