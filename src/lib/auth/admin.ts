import {
  hasValidAdminGateCookie,
  isAdminPasswordConfigured,
} from "@/lib/auth/admin-gate";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getProfileForUser } from "@/lib/profile";
import type { Profile } from "@/types";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export function isAdmin(
  profile: Pick<Profile, "is_admin"> | null | undefined,
): boolean {
  return profile?.is_admin === true;
}

export type AdminAccess =
  | { via: "gate"; supabase: SupabaseClient }
  | {
      via: "profile";
      supabase: SupabaseClient;
      user: User;
      profile: Profile;
    };

export async function hasAdminAccess(): Promise<boolean> {
  if (await hasValidAdminGateCookie()) {
    return true;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const profile = await getProfileForUser(user.id);
  return isAdmin(profile);
}

export async function requireAdminAccess(): Promise<AdminAccess> {
  if (await hasValidAdminGateCookie()) {
    return { via: "gate", supabase: createServiceClient() };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const profile = await getProfileForUser(user.id);

  if (!profile || !isAdmin(profile)) {
    throw new Error("FORBIDDEN");
  }

  return { via: "profile", supabase, user, profile };
}

/** Dashboard admin tools: logged-in profile admin only (no env password). */
export async function requireAdminProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const profile = await getProfileForUser(user.id);

  if (!profile || !isAdmin(profile)) {
    throw new Error("FORBIDDEN");
  }

  return { supabase, user, profile };
}

export function getAdminAccessErrorMessage(error: unknown): string {
  if (!isAdminPasswordConfigured()) {
    return "ADMIN_PAGE_PASSWORD 환경변수가 설정되지 않았습니다.";
  }

  if (error instanceof Error && error.message === "FORBIDDEN") {
    return "관리자 인증이 필요합니다. 비밀번호를 입력하거나 is_admin 계정으로 로그인해 주세요.";
  }

  return "관리자 인증이 필요합니다. 페이지를 새로고침한 뒤 비밀번호를 입력해 주세요.";
}
