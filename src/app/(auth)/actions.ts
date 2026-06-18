"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { phoneToAuthEmail } from "@/lib/auth/phone-auth";
import {
  normalizePhone,
  normalizeUsername,
  validatePhone,
  validateUsername,
} from "@/lib/auth/validation";

export type AuthActionState = {
  error?: string;
  success?: string;
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

  const supabase = await createClient();

  const { data: existingUsername } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUsername) {
    return { error: "이미 사용 중인 사용자명입니다." };
  }

  const { data: existingPhone } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existingPhone) {
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
    return { error: error.message };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    success: "가입이 완료되었습니다. 로그인해 주세요.",
  };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
