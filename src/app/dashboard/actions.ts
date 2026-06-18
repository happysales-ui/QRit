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
};

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
  action: "add" | "update" | "delete" | "move",
  error: SupabaseLikeError,
): string {
  const fallback =
    action === "add"
      ? "링크 추가에 실패했습니다."
      : action === "update"
        ? "링크 수정에 실패했습니다."
        : action === "delete"
          ? "링크 삭제에 실패했습니다."
          : "링크 순서 변경에 실패했습니다.";

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
    message.includes("schema cache")
  ) {
    const hint =
      "데이터베이스 마이그레이션 010_links_complete.sql 적용이 필요할 수 있습니다.";
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
    const avatarUrl = String(formData.get("avatar_url") ?? "").trim();
    const usernameInput = String(formData.get("username") ?? "").trim();

    const updates: Record<string, string | null> = {
      display_name: displayName || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
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

    return { success: "팔찌 작동 모드가 저장되었습니다." };
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
