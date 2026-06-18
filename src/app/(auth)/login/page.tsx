import { LoginForm } from "@/app/(auth)/login/login-form";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const authError =
    params.error === "auth_callback"
      ? "인증 링크가 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요."
      : undefined;

  return <LoginForm authError={authError} />;
}
