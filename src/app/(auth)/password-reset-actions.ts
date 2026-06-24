"use server";

import {
  buildPasswordResetRateLimitKey,
  consumePasswordResetAttempt,
  findUserIdForPasswordReset,
  PASSWORD_RESET_RATE_LIMIT_MESSAGE,
  PASSWORD_RESET_SUCCESS_MESSAGE,
  updateUserPasswordById,
  validateNewPasswordPair,
} from "@/lib/auth/password-reset";
import { getRequestClientIp } from "@/lib/auth/request-ip";
import {
  normalizePhone,
  normalizeUsername,
  validatePhone,
  validateUsername,
} from "@/lib/auth/validation";
import {
  getSupabaseConfigErrorMessage,
  isSupabaseConfigured,
  isSupabaseServiceRoleConfigured,
} from "@/lib/supabase/env";

export type PasswordResetActionState = {
  error?: string;
  success?: string;
};

export async function resetPasswordAction(
  _prevState: PasswordResetActionState,
  formData: FormData,
): Promise<PasswordResetActionState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!phone || !username || !password || !passwordConfirm) {
    return { error: "모든 필드를 입력해 주세요." };
  }

  const phoneError = validatePhone(phone);
  if (phoneError) {
    return { error: phoneError };
  }

  const usernameError = validateUsername(username);
  if (usernameError) {
    return { error: usernameError };
  }

  const passwordError = validateNewPasswordPair(password, passwordConfirm);
  if (passwordError) {
    return { error: passwordError };
  }

  if (!isSupabaseConfigured()) {
    return { error: getSupabaseConfigErrorMessage() };
  }

  if (!isSupabaseServiceRoleConfigured()) {
    return {
      error:
        "비밀번호 재설정 기능을 사용할 수 없습니다. 관리자에게 문의해 주세요.",
    };
  }

  try {
    const clientIp = await getRequestClientIp();
    const bucketKey = buildPasswordResetRateLimitKey(clientIp, phone);
    const allowed = await consumePasswordResetAttempt(bucketKey);

    if (!allowed) {
      return { error: PASSWORD_RESET_RATE_LIMIT_MESSAGE };
    }

    const userId = await findUserIdForPasswordReset(phone, username);

    if (userId) {
      const result = await updateUserPasswordById(userId, password);
      if (!result.ok) {
        return { error: result.message };
      }
    }

    return { success: PASSWORD_RESET_SUCCESS_MESSAGE };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[resetPasswordAction]", error);
    }

    return {
      error: "비밀번호 재설정 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}
