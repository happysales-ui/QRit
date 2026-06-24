export const BANK_TRANSFER_LINK_TITLE = "계좌 송금" as const;

export type KoreanBank = {
  code: string;
  name: string;
  shortName: string;
  /** Toss `supertoss://send?bank=` label when it differs from shortName. */
  tossName?: string;
};

/** Standard Korean financial institution codes (금융결제원). */
export const KOREAN_BANKS: KoreanBank[] = [
  { code: "004", name: "KB국민은행", shortName: "국민" },
  { code: "088", name: "신한은행", shortName: "신한" },
  { code: "011", name: "NH농협은행", shortName: "농협" },
  { code: "081", name: "하나은행", shortName: "하나" },
  { code: "020", name: "우리은행", shortName: "우리" },
  { code: "090", name: "카카오뱅크", shortName: "카카오" },
  { code: "092", name: "토스뱅크", shortName: "토스", tossName: "토스뱅크" },
  { code: "089", name: "케이뱅크", shortName: "케이" },
  { code: "003", name: "IBK기업은행", shortName: "기업" },
  { code: "023", name: "SC제일은행", shortName: "SC" },
  { code: "027", name: "한국씨티은행", shortName: "씨티" },
  { code: "032", name: "부산은행", shortName: "부산" },
  { code: "031", name: "iM뱅크(대구)", shortName: "대구" },
  { code: "037", name: "전북은행", shortName: "전북" },
  { code: "039", name: "경남은행", shortName: "경남" },
  { code: "035", name: "제주은행", shortName: "제주" },
  { code: "034", name: "광주은행", shortName: "광주" },
  { code: "007", name: "수협은행", shortName: "수협" },
  { code: "045", name: "새마을금고", shortName: "새마을" },
  { code: "048", name: "신협", shortName: "신협" },
  { code: "071", name: "우체국", shortName: "우체국" },
  { code: "050", name: "저축은행", shortName: "저축" },
];

const TRANSFER_URL_PATTERNS = [
  /^supertoss:\/\/send\?/i,
  /^kakaopay:\/\/money\/to\/bank/i,
  /^https:\/\/ul\.toss\.im\?/i,
];

export const MIN_ACCOUNT_NO_LENGTH = 10;
export const MAX_ACCOUNT_NO_LENGTH = 16;

export const INVALID_ACCOUNT_NO_MESSAGE =
  "올바른 계좌번호를 입력해 주세요 (숫자 10~14자리)" as const;

const PLACEHOLDER_ACCOUNT_NUMBERS = new Set([
  "0000000000",
  "00000000000",
  "000000000000",
  "0000000000000",
  "00000000000000",
  "1111111111",
  "11111111111",
  "1234567890",
  "0123456789",
  "12345678901",
  "123456789012",
  "9876543210",
  "9999999999",
]);

export function normalizeAccountNo(accountNo: string): string {
  return accountNo.replace(/\D/g, "");
}

export function getBankByCode(code: string): KoreanBank | undefined {
  return KOREAN_BANKS.find((bank) => bank.code === code);
}

/** Allows digits, hyphens, and spaces; rejects letters and other symbols. */
export function hasInvalidAccountNoChars(accountNo: string): boolean {
  const trimmed = accountNo.trim();
  if (!trimmed) {
    return false;
  }

  return !/^[\d\s-]+$/.test(trimmed);
}

function isSequentialDigits(digits: string): boolean {
  if (digits.length < 3) {
    return false;
  }

  let ascending = true;
  let descending = true;

  for (let index = 1; index < digits.length; index += 1) {
    const previous = Number(digits[index - 1]);
    const current = Number(digits[index]);

    if (current !== (previous + 1) % 10) {
      ascending = false;
    }

    if (current !== (previous + 9) % 10) {
      descending = false;
    }
  }

  return ascending || descending;
}

export function isPlaceholderAccountNo(normalized: string): boolean {
  if (!normalized) {
    return false;
  }

  if (PLACEHOLDER_ACCOUNT_NUMBERS.has(normalized)) {
    return true;
  }

  if (/^(\d)\1+$/.test(normalized)) {
    return true;
  }

  return isSequentialDigits(normalized);
}

export function validateBankAccount(
  bankCode: string,
  accountNo: string,
): string | null {
  if (!bankCode.trim()) {
    return "은행을 선택해 주세요.";
  }

  if (!getBankByCode(bankCode.trim())) {
    return "지원하지 않는 은행입니다.";
  }

  const trimmedAccount = accountNo.trim();
  if (!trimmedAccount) {
    return "계좌번호를 입력해 주세요.";
  }

  if (hasInvalidAccountNoChars(trimmedAccount)) {
    return INVALID_ACCOUNT_NO_MESSAGE;
  }

  const normalized = normalizeAccountNo(trimmedAccount);
  if (!normalized) {
    return "계좌번호를 입력해 주세요.";
  }

  if (
    normalized.length < MIN_ACCOUNT_NO_LENGTH ||
    normalized.length > MAX_ACCOUNT_NO_LENGTH
  ) {
    return INVALID_ACCOUNT_NO_MESSAGE;
  }

  if (isPlaceholderAccountNo(normalized)) {
    return INVALID_ACCOUNT_NO_MESSAGE;
  }

  return null;
}

/** Bank label for Toss `supertoss://send?bank=` (human-readable, not 금융결제원 code). */
export function getTossBankName(bankCode: string): string | undefined {
  const bank = getBankByCode(bankCode.trim());
  if (!bank) {
    return undefined;
  }

  return bank.tossName ?? bank.shortName;
}

/**
 * Builds a Toss Universal Link wrapping a supertoss://send deep link.
 * Opens the recipient's Toss app with bank and account pre-filled on mobile.
 *
 * Toss expects `bank` (e.g. "국민", "신한") — not numeric `bankCode` ("004", "088").
 */
export function buildTossSendDeepLink(bankCode: string, accountNo: string): string {
  const bankError = validateBankAccount(bankCode, accountNo);
  if (bankError) {
    throw new Error(bankError);
  }

  const bank = getBankByCode(bankCode.trim())!;
  const params = new URLSearchParams({
    bank: bank.tossName ?? bank.shortName,
    accountNo: normalizeAccountNo(accountNo),
  });

  const deepLink = `supertoss://send?${params.toString()}`;
  return `https://ul.toss.im?scheme=${encodeURIComponent(deepLink)}`;
}

/** Dashboard transfer URL field helper; wraps {@link buildTossSendDeepLink}. */
export function buildTransferUrl(bankCode: string, accountNo: string): string {
  return buildTossSendDeepLink(bankCode, accountNo);
}

export function isTransferUrl(url: string): boolean {
  const trimmed = url.trim();
  return TRANSFER_URL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function parseSupertossSendUrl(url: URL): { bankCode: string; accountNo: string } | null {
  const bankCode =
    url.searchParams.get("bankCode") ??
    resolveBankCodeFromShortName(url.searchParams.get("bank") ?? "");
  const accountNo = normalizeAccountNo(
    url.searchParams.get("accountNo") ??
      url.searchParams.get("account") ??
      "",
  );

  if (!bankCode || !accountNo) {
    return null;
  }

  if (validateBankAccount(bankCode, accountNo)) {
    return null;
  }

  return { bankCode, accountNo };
}

function resolveBankCodeFromShortName(shortName: string): string {
  const trimmed = shortName.trim();
  if (!trimmed) {
    return "";
  }

  const byCode = getBankByCode(trimmed);
  if (byCode) {
    return byCode.code;
  }

  const byShortName = KOREAN_BANKS.find(
    (bank) =>
      bank.shortName === trimmed ||
      bank.tossName === trimmed ||
      bank.name.includes(trimmed) ||
      trimmed.includes(bank.shortName),
  );

  return byShortName?.code ?? "";
}

export function parseTransferUrl(
  url: string,
): { bankCode: string; accountNo: string } | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    if (/^supertoss:\/\/send/i.test(trimmed)) {
      const parsed = new URL(trimmed.replace(/^supertoss:/i, "https:"));
      return parseSupertossSendUrl(parsed);
    }

    if (/^kakaopay:\/\/money\/to\/bank/i.test(trimmed)) {
      const parsed = new URL(trimmed.replace(/^kakaopay:/i, "https:"));
      const bankCode = parsed.searchParams.get("bank_code") ?? "";
      const accountNo = normalizeAccountNo(
        parsed.searchParams.get("bank_account_number") ?? "",
      );

      if (!bankCode || !accountNo) {
        return null;
      }

      return { bankCode, accountNo };
    }

    const parsed = new URL(trimmed);
    if (parsed.hostname === "ul.toss.im") {
      const scheme = parsed.searchParams.get("scheme");
      if (scheme?.startsWith("supertoss://send")) {
        const deepLink = new URL(scheme.replace(/^supertoss:/i, "https:"));
        return parseSupertossSendUrl(deepLink);
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function resolveTransferUrlFromForm(formData: FormData): string {
  const bankCode = String(formData.get("bank_code") ?? "").trim();
  const accountNo = String(formData.get("account_no") ?? "").trim();
  const urlInput = String(formData.get("url") ?? "").trim();

  if (bankCode && accountNo) {
    return buildTransferUrl(bankCode, accountNo);
  }

  return urlInput;
}
