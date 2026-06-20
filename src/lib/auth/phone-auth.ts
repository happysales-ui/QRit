/**
 * Supabase Auth uses email/password internally. We map normalized phone numbers
 * to synthetic emails so users sign in with phone + password in the UI.
 *
 * Mapping: `{digitsOnlyPhone}@phone.qrit.app`
 * Example: `01012345678@phone.qrit.app`
 *
 * Display phone lives in `profiles.phone`. Disable "Confirm email" in the
 * Supabase Dashboard (Auth → Providers → Email) so synthetic addresses
 * do not require verification.
 *
 * Password reset roadmap (SMS OTP):
 * - Enable Supabase Auth → Phone provider + SMS vendor (Twilio / MessageBird).
 * - Implement verify-OTP server action, then admin/service-role password update.
 * - Until then, /forgot-password documents the manual Kakao admin flow.
 * - Never expose synthetic emails or raw phone on public profile pages.
 */
export const PHONE_AUTH_EMAIL_DOMAIN = "phone.qrit.app";

export function phoneToAuthEmail(phone: string): string {
  return `${phone}@${PHONE_AUTH_EMAIL_DOMAIN}`;
}

export function authEmailToPhone(
  email: string | undefined | null,
): string | null {
  if (!email) {
    return null;
  }

  const suffix = `@${PHONE_AUTH_EMAIL_DOMAIN}`;
  if (!email.endsWith(suffix)) {
    return null;
  }

  return email.slice(0, -suffix.length);
}
