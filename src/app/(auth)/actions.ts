"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getSupabaseConfigErrorMessage,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import { phoneToAuthEmail } from "@/lib/auth/phone-auth";
import {
  devSignupLog,
  mapProfileQueryError,
  mapSignUpError,
  resolveSignUpResult,
} from "@/lib/auth/signup-helpers";
import {
  normalizePhone,
  normalizeUsername,
  validatePhone,
  validateUsername,
} from "@/lib/auth/validation";

export type AuthActionState = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!phone || !password) {
    return { error: "휴대폰 번호와 비밀번호를 입력해 주세요." };
  }

  const phoneError = validatePhone(phone);
  if (phoneError) {
    return { error: phoneError };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: phoneToAuthEmail(phone),
    password,
  });

  if (error) {
    return { error: "휴대폰 번호 또는 비밀번호가 올바르지 않습니다." };
  }

  redirect("/dashboard");
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    const phone = normalizePhone(String(formData.get("phone") ?? ""));
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
    const username = normalizeUsername(String(formData.get("username") ?? ""));

    if (!phone || !password || !passwordConfirm || !username) {
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

    if (password.length < 6) {
      return { error: "비밀번호는 6자 이상이어야 합니다." };
    }

    if (password !== passwordConfirm) {
      return { error: "비밀번호가 일치하지 않습니다." };
    }

    if (!isSupabaseConfigured()) {
      return { error: getSupabaseConfigErrorMessage() };
    }

    const supabase = await createClient();

    const { data: usernameTaken, error: usernameQueryError } = await supabase.rpc(
      "is_username_taken",
      { p_username: username },
    );

    if (usernameQueryError) {
      return { error: mapProfileQueryError(usernameQueryError) };
    }

    if (usernameTaken) {
      return { error: "이미 사용 중인 사용자명입니다." };
    }

    const { data: phoneTaken, error: phoneQueryError } = await supabase.rpc(
      "is_phone_taken",
      { p_phone: phone },
    );

    if (phoneQueryError) {
      return { error: mapProfileQueryError(phoneQueryError) };
    }

    if (phoneTaken) {
      return { error: "이미 가입된 휴대폰 번호입니다." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: phoneToAuthEmail(phone),
      password,
      options: {
        data: { username, phone },
      },
    });

    if (error) {
      return { error: mapSignUpError(error) };
    }

    return resolveSignUpResult(data);
  } catch (error) {
    devSignupLog("unexpected error", error);
    return {
      error: "회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
