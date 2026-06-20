"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  uploadAvatarAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { resizeImageForAvatar } from "@/lib/resize-image";
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

function formatClientResizeError(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case "IMAGE_LOAD_FAILED":
        return "이미지를 불러올 수 없습니다. 다른 파일을 선택해 주세요.";
      case "CANVAS_EXPORT_FAILED":
      case "CANVAS_CONTEXT_FAILED":
        return "이미지 처리에 실패했습니다. 브라우저를 새로고침한 뒤 다시 시도해 주세요.";
      default:
        break;
    }
  }

  return "이미지 처리 중 오류가 발생했습니다. 다시 시도해 주세요.";
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
  const [isResizing, setIsResizing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const avatarUrl = state.avatarUrl ?? previewUrl ?? currentAvatarUrl;
  const cacheKey = state.updatedAt ?? updatedAt;
  const error = clientError ?? state.error;
  const success = state.success;
  const isBusy = isPending || isResizing;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      setClientError("JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.");
      return;
    }

    setIsResizing(true);

    try {
      const resizedFile = await resizeImageForAvatar(file, "jpeg");

      if (resizedFile.size > MAX_SIZE) {
        setClientError(
          "이미지를 줄였지만 파일이 여전히 2MB를 초과합니다. 더 작은 사진을 선택해 주세요.",
        );
        return;
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const nextPreviewUrl = URL.createObjectURL(resizedFile);
      previewUrlRef.current = nextPreviewUrl;
      setPreviewUrl(nextPreviewUrl);

      const formData = new FormData();
      formData.set("avatar", resizedFile);

      await formAction(formData);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[avatar-upload] resize or upload failed", error);
      }
      setClientError(formatClientResizeError(error));
    } finally {
      setIsResizing(false);
    }
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
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
            className={qritBrand.primaryButton}
          >
            {isResizing
              ? "이미지 처리 중..."
              : isPending
                ? "업로드 중..."
                : "사진 선택"}
          </button>
          <p className="text-xs text-zinc-400">
            JPEG, PNG, WebP · 최대 800px로 자동 조정 · 2MB 이하
          </p>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600"
        >
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
