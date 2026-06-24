import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password-form";
import { getAdminKakaoChatUrl } from "@/lib/admin-kakao-url";

export default async function ForgotPasswordPage() {
  const kakaoChatUrl = await getAdminKakaoChatUrl();

  return <ForgotPasswordForm kakaoChatUrl={kakaoChatUrl} />;
}
