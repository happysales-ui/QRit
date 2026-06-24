import { normalizeUrl, validateUrl } from "@/lib/auth/validation";
import { validateSafeUrlScheme } from "@/lib/safe-url";
import {
  buildContactLinkPayload,
  sanitizeContactUrl,
  validateContactFields,
  validateMecardContactUrl,
} from "@/lib/contact-vcf";
import {
  BANK_TRANSFER_LINK_TITLE,
  isTransferUrl,
  parseTransferUrl,
  validateBankAccount,
} from "@/lib/bank-transfer";
import {
  buildTransferLinkPayload,
  TRANSFER_URL_MARKER,
} from "@/lib/transfer-link";

export { BANK_TRANSFER_LINK_TITLE };

export const CONTACT_LINK_TITLE = "연락처 저장" as const;

export const CONTACT_MECARD_URL_TEMPLATE = "MECARD:N:이름;TEL:연락처;" as const;

const MECARD_PREFIX_REGEX = /^mecard:/i;

/** @deprecated Legacy combined preset title; kept for inferPresetFromTitle */
export const LEGACY_BLOG_HOMEPAGE_TITLE = "블로그/홈페이지" as const;

export const LINK_TITLE_PRESETS = [
  CONTACT_LINK_TITLE,
  "계좌 송금",
  "1:1 상담",
  "인스타그램",
  "유튜브",
  "블로그/카페",
  "회사 홈페이지",
  "직접 입력",
] as const;

export const CUSTOM_LINK_TITLE = "직접 입력" as const;

export type LinkTitlePreset = (typeof LINK_TITLE_PRESETS)[number];

export const LINK_URL_PLACEHOLDERS: Record<
  Exclude<LinkTitlePreset, typeof CUSTOM_LINK_TITLE>,
  string
> = {
  [CONTACT_LINK_TITLE]: "MECARD:N:이름;TEL:전화번호; 형태로 입력하세요",
  "계좌 송금": "송금 링크 주소를 입력하세요",
  "1:1 상담": "상담 링크 주소를 입력하세요",
  인스타그램: "인스타그램 프로필 URL을 입력하세요",
  유튜브: "유튜브 채널 또는 영상 URL을 입력하세요",
  "블로그/카페": "네이버 블로그나 카페 주소를 입력하세요",
  "회사 홈페이지": "공식 웹사이트나 쇼핑몰 주소를 입력하세요",
};

export function getLinkUrlPlaceholder(preset: LinkTitlePreset): string {
  if (preset === CUSTOM_LINK_TITLE) {
    return "링크 URL을 입력하세요";
  }
  return LINK_URL_PLACEHOLDERS[preset];
}

export function resolveLinkTitle(
  preset: LinkTitlePreset,
  customTitle: string,
): string {
  if (preset === CUSTOM_LINK_TITLE) {
    return customTitle.trim();
  }
  return preset;
}

export function inferPresetFromTitle(title: string): {
  preset: LinkTitlePreset;
  customTitle: string;
} {
  if (title === LEGACY_BLOG_HOMEPAGE_TITLE) {
    return { preset: CUSTOM_LINK_TITLE, customTitle: LEGACY_BLOG_HOMEPAGE_TITLE };
  }

  if (
    (LINK_TITLE_PRESETS as readonly string[]).includes(title) &&
    title !== CUSTOM_LINK_TITLE
  ) {
    return { preset: title as LinkTitlePreset, customTitle: "" };
  }
  return { preset: CUSTOM_LINK_TITLE, customTitle: title };
}

export function isContactLinkTitle(title: string): boolean {
  return title === CONTACT_LINK_TITLE;
}

export function isBankTransferLinkTitle(title: string): boolean {
  return title === BANK_TRANSFER_LINK_TITLE;
}

export function isTransferLinkSubmission(
  title: string,
  url: string,
  formData?: FormData,
): boolean {
  if (isTransferLinkSubmission(title, url, formData)) {
    return true;
  }

  if (formData?.has("bank_code")) {
    return true;
  }

  return url.trim() === TRANSFER_URL_MARKER;
}

export function resolveTransferDisplayTitle(alias: string): string {
  const trimmed = alias.trim();
  return trimmed || BANK_TRANSFER_LINK_TITLE;
}

export function isMecardUrl(url: string): boolean {
  return MECARD_PREFIX_REGEX.test(sanitizeContactUrl(url));
}

export function isContactMecardTemplate(url: string): boolean {
  return url.trim() === CONTACT_MECARD_URL_TEMPLATE;
}

export function getInitialLinkUrl(
  preset: LinkTitlePreset,
  initialUrl?: string,
): string {
  if (preset === CONTACT_LINK_TITLE) {
    return initialUrl ?? CONTACT_MECARD_URL_TEMPLATE;
  }
  return initialUrl ?? "";
}

export function resolveUrlOnPresetChange(
  prevPreset: LinkTitlePreset,
  newPreset: LinkTitlePreset,
  currentUrl: string,
): string {
  if (newPreset === CONTACT_LINK_TITLE) {
    if (prevPreset !== CONTACT_LINK_TITLE || !currentUrl.trim()) {
      return CONTACT_MECARD_URL_TEMPLATE;
    }
    return currentUrl;
  }

  if (
    prevPreset === CONTACT_LINK_TITLE &&
    isContactMecardTemplate(currentUrl)
  ) {
    return "";
  }

  return currentUrl;
}

export function validateLinkUrl(
  title: string,
  url: string,
  formData?: FormData,
): string | null {
  if (isTransferLinkSubmission(title, url, formData)) {
    if (formData) {
      const bankCode = String(formData.get("bank_code") ?? "").trim();
      const accountNo = String(formData.get("account_no") ?? "").trim();
      return validateBankAccount(bankCode, accountNo);
    }

    const trimmed = url.trim();
    if (!trimmed || trimmed === TRANSFER_URL_MARKER) {
      return "은행과 계좌번호를 입력해 주세요.";
    }

    if (isTransferUrl(trimmed)) {
      const parsed = parseTransferUrl(trimmed);
      if (!parsed) {
        return "올바른 송금 링크 형식이 아닙니다.";
      }

      return validateBankAccount(parsed.bankCode, parsed.accountNo);
    }

    return "올바른 송금 링크 형식이 아닙니다.";
  }

  const trimmed = url.trim();

  if (isContactLinkTitle(title)) {
    const contactName = String(formData?.get("contact_name") ?? "").trim();
    const contactTel = String(formData?.get("contact_tel") ?? "").trim();

    if (contactName || contactTel) {
      return validateContactFields(contactName, contactTel);
    }
  }

  if (!trimmed) {
    return "URL을 입력해 주세요.";
  }

  const schemeError = validateSafeUrlScheme(trimmed);
  if (schemeError) {
    return schemeError;
  }

  if (isMecardUrl(trimmed)) {
    return validateMecardContactUrl(sanitizeContactUrl(trimmed));
  }

  return validateUrl(url);
}

export function normalizeLinkUrl(
  title: string,
  url: string,
  formData?: FormData,
): string {
  if (isTransferLinkSubmission(title, url, formData)) {
    if (formData) {
      return buildTransferLinkPayload(formData).url;
    }

    const trimmed = url.trim();
    if (isTransferUrl(trimmed) && parseTransferUrl(trimmed)) {
      return TRANSFER_URL_MARKER;
    }

    if (trimmed === TRANSFER_URL_MARKER) {
      return TRANSFER_URL_MARKER;
    }

    return trimmed;
  }

  const trimmed = url.trim();

  if (isContactLinkTitle(title)) {
    if (formData) {
      const contactName = String(formData.get("contact_name") ?? "").trim();
      const contactTel = String(formData.get("contact_tel") ?? "").trim();

      if (contactName || contactTel) {
        return buildContactLinkPayload(formData).url;
      }
    }

    const sanitized = sanitizeContactUrl(trimmed);
    if (isMecardUrl(sanitized)) {
      return sanitized;
    }
  }

  return normalizeUrl(url);
}

export function normalizeLinkTransferFields(
  title: string,
  urlInput: string,
  formData?: FormData,
): { bank_code: string | null; account_no: string | null } {
  if (!isTransferLinkSubmission(title, urlInput, formData) || !formData) {
    return { bank_code: null, account_no: null };
  }

  const payload = buildTransferLinkPayload(formData);
  return {
    bank_code: payload.bank_code || null,
    account_no: payload.account_no || null,
  };
}

export type LinkDbPayload = {
  title: string;
  url: string;
  bank_code?: string | null;
  account_no?: string | null;
};

/** Builds the links row fields sent to Supabase (title, url, optional bank columns). */
export function buildLinkDbPayload(
  title: string,
  urlInput: string,
  formData?: FormData,
  options: { clearTransferWhenAbsent?: boolean } = {},
): LinkDbPayload {
  const payload: LinkDbPayload = {
    title,
    url: normalizeLinkUrl(title, urlInput, formData),
  };

  if (isTransferLinkSubmission(title, urlInput, formData)) {
    return { ...payload, ...normalizeLinkTransferFields(title, urlInput, formData) };
  }

  if (options.clearTransferWhenAbsent) {
    return { ...payload, bank_code: null, account_no: null };
  }

  return payload;
}
