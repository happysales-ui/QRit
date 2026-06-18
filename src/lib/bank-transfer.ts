export const BANK_TRANSFER_LINK_TITLE = "계좌 송금" as const;

export type KoreanBank = {
  code: string;
  name: string;
  shortName: string;
};

/** Standard Korean financial institution codes (금융결제원). */
export const KOREAN_BANKS: KoreanBank[] = [
  { code: "004", name: "KB국민은행", shortName: "국민" },
  { code: "088", name: "신한은행", shortName: "신한" },
  { code: "011", name: "NH농협은행", shortName: "농협" },
  { code: "081", name: "하나은행", shortName: "하나" },
  { code: "020", name: "우리은행", shortName: "우리" },
  { code: "090", name: "카카오뱅크", shortName: "카카오" },
  { code: "092", name: "토스뱅크", shortName: "토스" },
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

export function normalizeAccountNo(accountNo: string): string {
  return accountNo.replace(/\D/g, "");
}

export function getBankByCode(code: string): KoreanBank | undefined {
  return KOREAN_BANKS.find((bank) => bank.code === code);
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

  const normalized = normalizeAccountNo(accountNo);
  if (!normalized) {
    return "계좌번호를 입력해 주세요.";
  }

  if (normalized.length < 10 || normalized.length > 16) {
    return "올바른 계좌번호를 입력해 주세요.";
  }

  return null;
}

/**
 * Builds a Toss Universal Link wrapping a supertoss://send deep link.
 * Opens the recipient's Toss app with bank and account pre-filled on mobile.
 */
export function buildTransferUrl(bankCode: string, accountNo: string): string {
  const bankError = validateBankAccount(bankCode, accountNo);
  if (bankError) {
    throw new Error(bankError);
  }

  const normalizedAccount = normalizeAccountNo(accountNo);
  const params = new URLSearchParams({
    bankCode: bankCode.trim(),
    accountNo: normalizedAccount,
  });

  const deepLink = `supertoss://send?${params.toString()}`;
  return `https://ul.toss.im?scheme=${encodeURIComponent(deepLink)}`;
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
