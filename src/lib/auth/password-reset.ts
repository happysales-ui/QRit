import { createServiceClient } from "@/lib/supabase/service";
import {
  getSupabaseServiceRoleConfigErrorMessage,
  isSupabaseServiceRoleConfigured,
} from "@/lib/supabase/env";
import { hashRateLimitBucket } from "@/lib/auth/request-ip";

export const PASSWORD_RESET_SUCCESS_MESSAGE =
  "입력하신 정보가 일치하면 비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해 주세요.";

export const PASSWORD_RESET_RATE_LIMIT_MESSAGE =
  "비밀번호 재설정 시도가 너무 많습니다. 15분 후 다시 시도해 주세요.";

export const PASSWORD_MIN_LENGTH = 6;

export const PASSWORD_RESET_MAX_ATTEMPTS = 5;
export const PASSWORD_RESET_WINDOW_MINUTES = 15;

export function validateNewPasswordPair(
  password: string,
  passwordConfirm: string,
): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }

  if (password !== passwordConfirm) {
    return "비밀번호가 일치하지 않습니다.";
  }

  return null;
}

export function buildPasswordResetRateLimitKey(
  clientIp: string,
  phone: string,
): string {
  return hashRateLimitBucket(["password-reset", clientIp, phone]);
}

export async function consumePasswordResetAttempt(
  bucketKey: string,
): Promise<boolean> {
  const service = createServiceClient();
  const { data, error } = await service.rpc("check_password_reset_rate_limit", {
    p_bucket_key: bucketKey,
    p_max_attempts: PASSWORD_RESET_MAX_ATTEMPTS,
    p_window_minutes: PASSWORD_RESET_WINDOW_MINUTES,
  });

  if (error) {
    throw error;
  }

  return data === true;
}

export async function findUserIdForPasswordReset(
  phone: string,
  username: string,
): Promise<string | null> {
  const service = createServiceClient();
  const { data, error } = await service.rpc("verify_profile_for_password_reset", {
    p_phone: phone,
    p_username: username,
  });

  if (error) {
    throw error;
  }

  return typeof data === "string" && data.length > 0 ? data : null;
}

export async function updateUserPasswordById(
  userId: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSupabaseServiceRoleConfigured()) {
    return { ok: false, message: getSupabaseServiceRoleConfigErrorMessage() };
  }

  const service = createServiceClient();
  const { error } = await service.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) {
    return { ok: false, message: "비밀번호 재설정에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true };
}
