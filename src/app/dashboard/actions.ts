"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  isUsernameAvailable,
} from "@/lib/profile";
import { normalizeUsername, validateUsername } from "@/lib/auth/validation";
import { buildLinkDbPayload, validateLinkUrl } from "@/lib/link-presets";

export type ActionState = {
  error?: string;
  success?: string;
  avatarUrl?: string;
  updatedAt?: string;
};

const AVATAR_MAX_SIZE = 2 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getAvatarExtension(mimeType: string): string | null {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function formatDevSupabaseDetail(error: SupabaseLikeError): string {
  const parts = [
    error.code ? `code=${error.code}` : "",
    error.message ?? "",
    error.details ? `details=${error.details}` : "",
    error.hint ? `hint=${error.hint}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

function formatLinkActionError(
  action: "add" | "update" | "delete" | "move" | "hide" | "unhide",
  error: SupabaseLikeError,
): string {
  const fallback =
    action === "add"
      ? "링크 추가에 실패했습니다."
      : action === "update"
        ? "링크 수정에 실패했습니다."
        : action === "delete"
          ? "링크 삭제에 실패했습니다."
          : action === "move"
            ? "링크 순서 변경에 실패했습니다."
            : action === "hide"
              ? "링크 숨기기에 실패했습니다."
              : "링크 표시에 실패했습니다.";

  if (process.env.NODE_ENV === "development") {
    console.error(`[${action}LinkAction]`, error);
  }

  const message = error.message ?? "";
  const code = error.code ?? "";
  const devDetail =
    process.env.NODE_ENV === "development"
      ? formatDevSupabaseDetail(error)
      : "";

  if (
    message.includes("bank_code") ||
    message.includes("account_no") ||
    message.includes("is_hidden") ||
    message.includes("schema cache")
  ) {
    const hint =
      action === "hide" || action === "unhide"
        ? "데이터베이스 마이그레이션 013_links_is_hidden.sql 적용이 필요할 수 있습니다."
        : "데이터베이스 마이그레이션 010_links_complete.sql 적용이 필요할 수 있습니다.";
    return devDetail ? `${fallback} (${hint} — ${devDetail})` : `${fallback} (${hint})`;
  }

  if (code === "23514" || message.includes("check constraint")) {
    const hint =
      "제목/URL 제한 조건 위반 — Supabase에서 010_links_complete.sql 실행 필요";
    return devDetail ? `${fallback} (${hint} — ${devDetail})` : `${fallback} (${hint})`;
  }

  if (devDetail) {
    return `${fallback} (${devDetail})`;
  }

  return fallback;
}

function formatAvatarUploadError(error: SupabaseLikeError): string {
  const fallback = "프로필 이미지 업로드에 실패했습니다.";

  if (process.env.NODE_ENV === "development") {
    console.error("[uploadAvatarAction]", error);
  }

  const message = error.message ?? "";
  const code = error.code ?? "";
  const devDetail =
    process.env.NODE_ENV === "development"
      ? formatDevSupabaseDetail(error)
      : "";

  if (
    message.includes("Bucket not found") ||
    (message.includes("bucket") && message.includes("not found"))
  ) {
    const hint =
      "Supabase Storage에 avatars 버킷이 없습니다. supabase/migrations/012_avatars_storage.sql을 실행해 주세요.";
    return devDetail ? `${fallback} (${hint} — ${devDetail})` : `${fallback} (${hint})`;
  }

  if (
    message.includes("row-level security") ||
    message.includes("RLS") ||
    code === "42501"
  ) {
    const hint =
      "Storage 권한(RLS) 오류입니다. 012_avatars_storage.sql의 정책이 적용됐는지 확인해 주세요.";
    return devDetail ? `${fallback} (${hint} — ${devDetail})` : `${fallback} (${hint})`;
  }

  if (
    message.includes("file size") ||
    message.includes("Payload too large") ||
    message.includes("maximum allowed size")
  ) {
    const hint = "파일 크기가 2MB를 초과합니다. 더 작은 이미지를 선택해 주세요.";
    return devDetail ? `${hint} (${devDetail})` : hint;
  }

  if (message.includes("mime type") || message.includes("not allowed")) {
    const hint = "JPEG, PNG, WebP 형식만 업로드할 수 있습니다.";
    return devDetail ? `${hint} (${devDetail})` : hint;
  }

  if (devDetail) {
    return `${fallback} (${devDetail})`;
  }

  return `${fallback} Supabase Storage(avatars 버킷) 설정을 확인해 주세요.`;
}

function formatDefaultLinkActionError(error: SupabaseLikeError): string {
  const fallback = "작동 모드 저장에 실패했습니다.";

  if (process.env.NODE_ENV === "development") {
    console.error("[updateDefaultLinkAction]", error);
  }

  const message = error.message ?? "";
  const code = error.code ?? "";

  if (
    message.includes("default_link_id") ||
    message.includes("schema cache")
  ) {
    return `${fallback} (데이터베이스 마이그레이션 004/006 적용이 필요합니다.)`;
  }

  if (code === "23503") {
    return `${fallback} (선택한 링크가 유효하지 않습니다.)`;
  }

  if (process.env.NODE_ENV === "development" && message) {
    return `${fallback} (${message})`;
  }

  return fallback;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  return { supabase, user };
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();

    const displayName = String(formData.get("display_name") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const usernameInput = String(formData.get("username") ?? "").trim();

    const updates: Record<string, string | null> = {
      display_name: displayName || null,
      bio: bio || null,
    };

    if (usernameInput) {
      const username = normalizeUsername(usernameInput);
      const usernameError = validateUsername(username);

      if (usernameError) {
        return { error: usernameError };
      }

      const available = await isUsernameAvailable(username, user.id);
      if (!available) {
        return { error: "이미 사용 중인 사용자명입니다." };
      }

      updates.username = username;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      return { error: "프로필 저장에 실패했습니다." };
    }

    revalidatePath("/dashboard");
    if (typeof updates.username === "string") {
      revalidatePath(`/${updates.username}`);
    }

    return { success: "프로필이 저장되었습니다." };
  } catch {
    return { error: "로그인이 필요합니다." };
  }
}

export async function uploadAvatarAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();

    const file = formData.get("avatar");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "업로드할 이미지를 선택해 주세요." };
    }

    if (!AVATAR_ALLOWED_TYPES.has(file.type)) {
      return { error: "JPEG, PNG, WebP 이미지만 업로드할 수 있습니다." };
    }

    if (file.size > AVATAR_MAX_SIZE) {
      return { error: "파일 크기는 2MB 이하여야 합니다." };
    }

    const ext = getAvatarExtension(file.type);
    if (!ext) {
      return { error: "지원하지 않는 이미지 형식입니다." };
    }

    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return { error: formatAvatarUploadError(uploadError) };
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id)
      .select("username, updated_at")
      .maybeSingle();

    if (updateError || !profile) {
      if (process.env.NODE_ENV === "development" && updateError) {
        console.error("[uploadAvatarAction] profile update failed", updateError);
      }
      const detail =
        process.env.NODE_ENV === "development" && updateError
          ? ` (${formatDevSupabaseDetail(updateError)})`
          : "";
      return { error: `프로필 이미지 URL 저장에 실패했습니다.${detail}` };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/${profile.username}`);

    return {
      success: "프로필 이미지가 업로드되었습니다.",
      avatarUrl,
      updatedAt: profile.updated_at as string,
    };
  } catch {
    return { error: "로그인이 필요합니다." };
  }
}

export async function updateDefaultLinkAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();

    const defaultLinkId = String(formData.get("default_link_id") ?? "").trim();
    const value = defaultLinkId || null;

    if (value) {
      const { data: link } = await supabase
        .from("links")
        .select("id")
        .eq("id", value)
        .eq("profile_id", user.id)
        .eq("is_active", true)
        .eq("is_hidden", false)
        .maybeSingle();

      if (!link) {
        return { error: "선택한 링크를 찾을 수 없습니다." };
      }
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({ default_link_id: value })
      .eq("id", user.id)
      .select("username")
      .maybeSingle();

    if (error) {
      return { error: formatDefaultLinkActionError(error) };
    }

    if (!profile) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[updateDefaultLinkAction] update returned no rows for user",
          user.id,
        );
      }
      return {
        error:
          "작동 모드 저장에 실패했습니다. 프로필을 찾을 수 없거나 권한이 없습니다.",
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/${profile.username}`);

    return { success: "QRit 작동 모드가 저장되었습니다." };
  } catch {
    return { error: "로그인이 필요합니다." };
  }
}

export async function addLinkAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();

    const title = String(formData.get("title") ?? "").trim();
    const urlInput = String(formData.get("url") ?? "").trim();

    if (!title) {
      return { error: "링크 제목을 입력해 주세요." };
    }

    const urlError = validateLinkUrl(title, urlInput, formData);
    if (urlError) {
      return { error: urlError };
    }

    const { data: existingLinks } = await supabase
      .from("links")
      .select("sort_order")
      .eq("profile_id", user.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder =
      existingLinks && existingLinks.length > 0
        ? (existingLinks[0].sort_order as number) + 1
        : 0;

    const { error } = await supabase.from("links").insert({
      profile_id: user.id,
      ...buildLinkDbPayload(title, urlInput, formData),
      sort_order: nextOrder,
      is_active: true,
    });

    if (error) {
      return { error: formatLinkActionError("add", error) };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    revalidatePath("/dashboard");
    if (profile?.username) {
      revalidatePath(`/${profile.username}`);
    }

    return { success: "링크가 추가되었습니다." };
  } catch {
    return { error: "로그인이 필요합니다." };
  }
}

export async function updateLinkAction(
  linkId: string,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();

    const title = String(formData.get("title") ?? "").trim();
    const urlInput = String(formData.get("url") ?? "").trim();

    if (!title) {
      return { error: "링크 제목을 입력해 주세요." };
    }

    const urlError = validateLinkUrl(title, urlInput, formData);
    if (urlError) {
      return { error: urlError };
    }

    const { error } = await supabase
      .from("links")
      .update(buildLinkDbPayload(title, urlInput, formData, { clearTransferWhenAbsent: true }))
      .eq("id", linkId)
      .eq("profile_id", user.id);

    if (error) {
      return { error: formatLinkActionError("update", error) };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    revalidatePath("/dashboard");
    if (profile?.username) {
      revalidatePath(`/${profile.username}`);
      revalidatePath(`/${profile.username}/transfer/${linkId}`);
    }

    return { success: "링크가 수정되었습니다." };
  } catch {
    return { error: "로그인이 필요합니다." };
  }
}

export async function deleteLinkAction(linkId: string): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();

    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", linkId)
      .eq("profile_id", user.id);

    if (error) {
      return { error: "링크 삭제에 실패했습니다." };
    }

    revalidatePath("/dashboard");
    return { success: "링크가 삭제되었습니다." };
  } catch {
    return { error: "로그인이 필요합니다." };
  }
}

async function setLinkHiddenAction(
  linkId: string,
  isHidden: boolean,
): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();

    const { error } = await supabase
      .from("links")
      .update({ is_hidden: isHidden })
      .eq("id", linkId)
      .eq("profile_id", user.id);

    if (error) {
      return {
        error: formatLinkActionError(isHidden ? "hide" : "unhide", error),
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    revalidatePath("/dashboard");
    if (profile?.username) {
      revalidatePath(`/${profile.username}`);
    }

    return {
      success: isHidden
        ? "링크가 공개 프로필에서 숨겨졌습니다."
        : "링크가 다시 공개되었습니다.",
    };
  } catch {
    return { error: "로그인이 필요합니다." };
  }
}

export async function hideLinkAction(linkId: string): Promise<ActionState> {
  return setLinkHiddenAction(linkId, true);
}

export async function unhideLinkAction(linkId: string): Promise<ActionState> {
  return setLinkHiddenAction(linkId, false);
}

export async function moveLinkAction(
  linkId: string,
  direction: "up" | "down",
): Promise<ActionState> {
  try {
    const { supabase, user } = await requireUser();

    const { data: links, error: fetchError } = await supabase
      .from("links")
      .select("id, sort_order")
      .eq("profile_id", user.id)
      .order("sort_order", { ascending: true });

    if (fetchError || !links) {
      return { error: "링크 순서 변경에 실패했습니다." };
    }

    const index = links.findIndex((link) => link.id === linkId);
    if (index === -1) {
      return { error: "링크를 찾을 수 없습니다." };
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= links.length) {
      return {};
    }

    const current = links[index];
    const target = links[swapIndex];

    const { error: updateCurrentError } = await supabase
      .from("links")
      .update({ sort_order: target.sort_order })
      .eq("id", current.id)
      .eq("profile_id", user.id);

    if (updateCurrentError) {
      return { error: "링크 순서 변경에 실패했습니다." };
    }

    const { error: updateTargetError } = await supabase
      .from("links")
      .update({ sort_order: current.sort_order })
      .eq("id", target.id)
      .eq("profile_id", user.id);

    if (updateTargetError) {
      return { error: "링크 순서 변경에 실패했습니다." };
    }

    revalidatePath("/dashboard");
    return { success: "링크 순서가 변경되었습니다." };
  } catch {
    return { error: "로그인이 필요합니다." };
  }
}
