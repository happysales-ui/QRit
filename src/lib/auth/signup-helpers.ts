import type { AuthError, AuthResponse } from "@supabase/supabase-js";

export type SignupActionResult = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

export function devSignupLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.error("[signupAction]", ...args);
  }
}

export function isMissingPhoneColumnError(error: { code: string; message: string }): boolean {
  const message = error.message.toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    (message.includes("phone") && message.includes("does not exist"))
  );
}

export function mapProfileQueryError(error: { code: string; message: string }): string {
  if (isMissingPhoneColumnError(error)) {
    return "데이터베이스 설정이 완료되지 않았습니다. Supabase에서 008_profiles_phone.sql 마이그레이션을 실행해 주세요.";
  }

  devSignupLog("profile query error", error);
  return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export function mapSignUpError(error: AuthError): string {
  const message = error.message.toLowerCase();

  if (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already exists")
  ) {
    return "이미 가입된 휴대폰 번호입니다.";
  }

  if (message.includes("password")) {
    return "비밀번호 형식이 올바르지 않습니다. 6자 이상 입력해 주세요.";
  }

  if (message.includes("database error") || message.includes("trigger")) {
    devSignupLog("signUp database/trigger error", error);
    return "가입 처리 중 서버 오류가 발생했습니다. Supabase 마이그레이션(008) 적용 여부를 확인해 주세요.";
  }

  devSignupLog("signUp error", error);
  return error.message || "회원가입에 실패했습니다. 다시 시도해 주세요.";
}

export function resolveSignUpResult(
  data: AuthResponse["data"],
): SignupActionResult {
  if (data.session) {
    return { redirectTo: "/dashboard" };
  }

  if (data.user) {
    return {
      success:
        "가입이 완료되었습니다. 로그인 페이지에서 로그인해 주세요. 로그인이 되지 않으면 Supabase 대시보드에서 이메일 확인(Confirm email)을 비활성화했는지 확인해 주세요.",
    };
  }

  return {
    error: "회원가입에 실패했습니다. 입력 정보를 확인하고 다시 시도해 주세요.",
  };
}
