"use server";

import { revalidatePath } from "next/cache";
import { requireAdminProfile } from "@/lib/auth/admin";
import { normalizeUsername } from "@/lib/auth/validation";
import { formatExpiryDate } from "@/lib/service-expiry";

export type AdminActionState = {
  error?: string;
  success?: string;
  user?: {
    username: string;
    displayName: string | null;
    expiredAt: string;
    expiredAtFormatted: string;
  };
};

export async function lookupUserAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdminProfile();

    const username = normalizeUsername(String(formData.get("username") ?? ""));

    if (!username) {
      return { error: "사용자명을 입력해 주세요." };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("username, display_name, expired_at")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      return { error: "사용자 조회에 실패했습니다." };
    }

    if (!data) {
      return { error: `'${username}' 사용자를 찾을 수 없습니다.` };
    }

    return {
      user: {
        username: data.username,
        displayName: data.display_name,
        expiredAt: data.expired_at,
        expiredAtFormatted: formatExpiryDate(data.expired_at),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { error: "관리자 권한이 필요합니다." };
    }
    return { error: "로그인이 필요합니다." };
  }
}

export async function extendExpiryAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdminProfile();

    const username = normalizeUsername(String(formData.get("username") ?? ""));
    const days = Number(formData.get("days") ?? 0);

    if (!username) {
      return { error: "사용자명을 입력해 주세요." };
    }

    if (!Number.isFinite(days) || days < 1 || days > 3650) {
      return { error: "연장 일수는 1~3650 사이여야 합니다." };
    }

    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("username, display_name, expired_at")
      .eq("username", username)
      .maybeSingle();

    if (fetchError) {
      return { error: "사용자 조회에 실패했습니다." };
    }

    if (!existing) {
      return { error: `'${username}' 사용자를 찾을 수 없습니다.` };
    }

    const currentExpiry = new Date(existing.expired_at);
    const now = new Date();
    const base = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
    const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ expired_at: newExpiry.toISOString() })
      .eq("username", username);

    if (updateError) {
      return { error: "만료일 연장에 실패했습니다." };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/${username}`);

    return {
      success: `${username}님의 서비스 만료일을 ${days}일 연장했습니다.`,
      user: {
        username: existing.username,
        displayName: existing.display_name,
        expiredAt: newExpiry.toISOString(),
        expiredAtFormatted: formatExpiryDate(newExpiry.toISOString()),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { error: "관리자 권한이 필요합니다." };
    }
    return { error: "로그인이 필요합니다." };
  }
}
