/** Safe charset: A–Z minus O, I, L plus digits 2–9. */
export const INVITE_CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const INVITE_CODE_LENGTH = 6;

export const INVITE_CODE_INVALID_MESSAGE =
  "유효하지 않은 인증코드입니다. 구매 시 안내받은 코드를 다시 확인해주세요.";

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
