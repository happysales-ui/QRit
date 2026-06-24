/** Safe charset: A–Z minus O, I, L plus digits 2–9. */
export const INVITE_CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const INVITE_CODE_LENGTH = 6;

export type InviteCodeVerifyStatus =
  | "valid"
  | "invalid_format"
  | "not_found"
  | "already_used";

export const INVITE_CODE_INVALID_MESSAGE =
  "유효하지 않은 인증코드입니다. 구매 시 안내받은 코드를 다시 확인해주세요.";

export const INVITE_CODE_NOT_FOUND_MESSAGE =
  "인증코드를 찾을 수 없습니다. 입력한 코드를 다시 확인하거나 판매처에 문의해 주세요.";

export const INVITE_CODE_ALREADY_USED_MESSAGE =
  "이미 사용된 인증코드입니다. 새 코드가 필요하면 판매처에 문의해 주세요.";

export const INVITE_CODE_VERIFY_SETUP_MESSAGE =
  "인증코드 기능이 아직 설정되지 않았습니다. Supabase SQL 편집기에서 015_invite_codes.sql 마이그레이션을 실행해 주세요.";

export const CONSUME_INVITE_CODE_SETUP_MESSAGE =
  "초대 코드 사용 처리 기능이 아직 설정되지 않았습니다. Supabase SQL 편집기에서 022_consume_invite_code_atomic.sql(또는 024_consume_invite_code_setup.sql) 마이그레이션을 실행해 주세요.";

const INVITE_CODE_REGEX = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidInviteCodeFormat(code: string): boolean {
  return INVITE_CODE_REGEX.test(normalizeInviteCode(code));
}

export function generateInviteCode(): string {
  let result = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * INVITE_CODE_CHARSET.length);
    result += INVITE_CODE_CHARSET[index];
  }
  return result;
}
