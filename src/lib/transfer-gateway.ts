import {
  getBankByCode,
  normalizeAccountNo,
  type KoreanBank,
} from "@/lib/bank-transfer";

export const TRANSFER_URL_MARKER = "qrit://transfer" as const;

export type TransferAppId = "toss" | "kakaopay" | "naverpay";

export type TransferDeepLink = {
  id: TransferAppId;
  label: string;
  description: string;
  /** Primary href (universal link, intent URL, or custom scheme). */
  href: string;
  /** Optional fallback when the app is not installed. */
  fallbackHref?: string;
  /** When true, open via script instead of default anchor navigation. */
  openViaScript?: boolean;
  accentClass: string;
};

export const KAKAO_PAY_ANDROID_PACKAGE = "com.kakaopay.app";
export const NAVER_PAY_ANDROID_PACKAGE = "com.nhn.android.search";
export const NAVER_PAY_MOBILE_WEB_BASE =
  "https://new-m.pay.naver.com/send/sendMoney/account";
export const NAVER_PAY_MOBILE_FALLBACK =
  "https://new-m.pay.naver.com/send/sendMoney";
export const KAKAO_PAY_WEB_FALLBACK = "https://www.kakaopay.com";

export type TransferAccount = {
  bankCode: string;
  accountNo: string;
  bank: KoreanBank;
};

function buildTossDeepLink(bankCode: string, accountNo: string): string {
  const params = new URLSearchParams({
    bankCode,
    accountNo,
  });
  const scheme = `supertoss://send?${params.toString()}`;
  return `https://ul.toss.im?scheme=${encodeURIComponent(scheme)}`;
}

/** Official Kakao Pay account remittance scheme (see Kakao Pay app-link guide). */
export function buildKakaoPaySchemeUrl(
  bankCode: string,
  accountNo: string,
): string {
  const params = new URLSearchParams({
    bank_code: bankCode,
    bank_account_number: accountNo,
  });
  return `kakaopay://money/to/bank?${params.toString()}`;
}

/** Naver Pay in-app scheme for account remittance (falls back to mobile web). */
export function buildNaverPaySchemeUrl(
  bankCode: string,
  accountNo: string,
): string {
  const params = new URLSearchParams({
    bankCorpCode: bankCode,
    accountNo,
  });
  return `naverpay://send/sendMoney/account?${params.toString()}`;
}

/**
 * Naver Pay mobile web URL with pre-filled bank and account.
 * The Npay app may intercept this on device when installed.
 */
export function buildNaverPayWebUrl(bankCode: string, accountNo: string): string {
  const params = new URLSearchParams({
    bankCorpCode: bankCode,
    accountNo,
  });
  return `${NAVER_PAY_MOBILE_WEB_BASE}?${params.toString()}`;
}

export function buildAndroidCustomSchemeIntent(
  schemeUrl: string,
  options: {
    androidPackage?: string;
    fallbackUrl?: string;
  } = {},
): string {
  const schemeMatch = /^([a-z][a-z0-9+.-]*):\/\/(.*)$/i.exec(schemeUrl);
  if (!schemeMatch) {
    return schemeUrl;
  }

  const [, schemeName, pathAndQuery] = schemeMatch;
  const parts = [
    `intent://${pathAndQuery}`,
    "#Intent",
    `scheme=${schemeName}`,
  ];

  if (options.androidPackage) {
    parts.push(`package=${options.androidPackage}`);
  }

  if (options.fallbackUrl) {
    parts.push(
      `S.browser_fallback_url=${encodeURIComponent(options.fallbackUrl)}`,
    );
  }

  parts.push("end");
  return parts.join(";");
}

export function resolveTransferLaunchUrl(
  appId: TransferAppId,
  bankCode: string,
  accountNo: string,
  userAgent = "",
): Pick<TransferDeepLink, "href" | "fallbackHref" | "openViaScript"> {
  const normalizedCode = bankCode.trim();
  const normalizedAccount = normalizeAccountNo(accountNo);

  if (appId === "toss") {
    return {
      href: buildTossDeepLink(normalizedCode, normalizedAccount),
      openViaScript: false,
    };
  }

  if (appId === "kakaopay") {
    const schemeUrl = buildKakaoPaySchemeUrl(normalizedCode, normalizedAccount);

    if (isAndroidUserAgent(userAgent)) {
      return {
        href: buildAndroidCustomSchemeIntent(schemeUrl, {
          androidPackage: KAKAO_PAY_ANDROID_PACKAGE,
          fallbackUrl: KAKAO_PAY_WEB_FALLBACK,
        }),
        fallbackHref: KAKAO_PAY_WEB_FALLBACK,
        openViaScript: true,
      };
    }

    if (isMobileUserAgent(userAgent)) {
      return {
        href: schemeUrl,
        fallbackHref: KAKAO_PAY_WEB_FALLBACK,
        openViaScript: true,
      };
    }

    return {
      href: KAKAO_PAY_WEB_FALLBACK,
      fallbackHref: schemeUrl,
      openViaScript: false,
    };
  }

  const webUrl = buildNaverPayWebUrl(normalizedCode, normalizedAccount);
  const schemeUrl = buildNaverPaySchemeUrl(normalizedCode, normalizedAccount);

  if (isAndroidUserAgent(userAgent)) {
    return {
      href: buildAndroidCustomSchemeIntent(schemeUrl, {
        androidPackage: NAVER_PAY_ANDROID_PACKAGE,
        fallbackUrl: webUrl,
      }),
      fallbackHref: webUrl,
      openViaScript: true,
    };
  }

  if (isIOSUserAgent(userAgent)) {
    return {
      href: schemeUrl,
      fallbackHref: webUrl,
      openViaScript: true,
    };
  }

  return {
    href: webUrl,
    fallbackHref: NAVER_PAY_MOBILE_FALLBACK,
    openViaScript: false,
  };
}

export function buildDeepLinks(
  bankCode: string,
  accountNo: string,
  userAgent = "",
): TransferDeepLink[] {
  const normalizedCode = bankCode.trim();
  const normalizedAccount = normalizeAccountNo(accountNo);

  const appMeta: Array<
    Pick<TransferDeepLink, "id" | "label" | "description" | "accentClass">
  > = [
    {
      id: "toss",
      label: "토스 앱으로 송금",
      description: "토스 앱에서 계좌 정보가 자동 입력됩니다",
      accentClass:
        "border-blue-200/80 bg-gradient-to-r from-white to-blue-50/90 hover:border-blue-300 hover:shadow-blue-100/70",
    },
    {
      id: "kakaopay",
      label: "카카오페이로 송금",
      description: "카카오페이 앱에서 계좌 정보가 자동 입력됩니다",
      accentClass:
        "border-yellow-200/80 bg-gradient-to-r from-white to-yellow-50/90 hover:border-yellow-300 hover:shadow-yellow-100/70",
    },
    {
      id: "naverpay",
      label: "네이버페이로 송금",
      description: "네이버페이 송금 화면으로 이동합니다",
      accentClass:
        "border-emerald-200/80 bg-gradient-to-r from-white to-emerald-50/90 hover:border-emerald-300 hover:shadow-emerald-100/70",
    },
  ];

  return appMeta.map((meta) => ({
    ...meta,
    ...resolveTransferLaunchUrl(
      meta.id,
      normalizedCode,
      normalizedAccount,
      userAgent,
    ),
  }));
}

export function formatAccountNo(accountNo: string): string {
  const digits = normalizeAccountNo(accountNo);
  if (digits.length <= 4) {
    return digits;
  }

  const head = digits.slice(0, -4);
  const tail = digits.slice(-4);
  return `${head}-${tail}`;
}

export function getTransferCopyText(account: TransferAccount): string {
  return getFormattedTransferCopyText(account);
}

/** Bank name + hyphenated account number for clipboard and share payloads. */
export function getFormattedTransferCopyText(account: TransferAccount): string {
  return `${account.bank.name} ${formatAccountNo(account.accountNo)}`;
}

export type BankAppScheme = {
  bankCode: string;
  label: string;
  /** Custom URL scheme that launches the bank's mobile app. */
  scheme: string;
  /** Android package name for intent:// fallbacks. */
  androidPackage?: string;
};

/**
 * Known custom schemes for major Korean bank apps.
 * Most do not support public account pre-fill; schemes launch the app only.
 */
export const BANK_APP_SCHEMES: BankAppScheme[] = [
  {
    bankCode: "011",
    label: "NH농협",
    scheme: "nhappbankansimclick://",
    androidPackage: "com.nh.cashbankapp",
  },
  {
    bankCode: "004",
    label: "KB국민",
    scheme: "kb-acp://",
    androidPackage: "com.kbstar.kbbank",
  },
  {
    bankCode: "088",
    label: "신한",
    scheme: "sbank://",
    androidPackage: "com.shinhan.sbanking",
  },
  {
    bankCode: "081",
    label: "하나",
    scheme: "hanaansim://",
    androidPackage: "com.kebhana.hanaapush",
  },
  {
    bankCode: "020",
    label: "우리",
    scheme: "wooribank://",
    androidPackage: "com.wooribank.smart.npib",
  },
  {
    bankCode: "003",
    label: "IBK기업",
    scheme: "ibkapp://",
    androidPackage: "com.ibk.android.ionebank",
  },
  {
    bankCode: "090",
    label: "카카오뱅크",
    scheme: "kakaobank://",
    androidPackage: "com.kakaobank.channel",
  },
  {
    bankCode: "089",
    label: "케이뱅크",
    scheme: "ukbanksmartbanknonloginpay://",
    androidPackage: "com.kbankwith.smartbank",
  },
  {
    bankCode: "023",
    label: "SC제일",
    scheme: "scbankapp://",
    androidPackage: "com.scbank.maepay",
  },
  {
    bankCode: "032",
    label: "부산",
    scheme: "busanbank://",
    androidPackage: "com.busanbank.mbp",
  },
  {
    bankCode: "031",
    label: "iM뱅크",
    scheme: "dgbbank://",
    androidPackage: "com.dgb.android.smartbank",
  },
  {
    bankCode: "037",
    label: "전북",
    scheme: "jbbank://",
    androidPackage: "com.jbbank.smartbank",
  },
  {
    bankCode: "039",
    label: "경남",
    scheme: "knbank://",
    androidPackage: "com.knbank.smartbank",
  },
  {
    bankCode: "007",
    label: "수협",
    scheme: "suhyupbank://",
    androidPackage: "com.suhyupbank.mobile",
  },
];

export function getBankAppScheme(bankCode: string): BankAppScheme | undefined {
  const normalized = bankCode.trim();
  return BANK_APP_SCHEMES.find((entry) => entry.bankCode === normalized);
}

export function getMajorBankAppSchemes(): BankAppScheme[] {
  return BANK_APP_SCHEMES;
}

export function isAndroidUserAgent(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

export function isIOSUserAgent(userAgent: string): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent);
}

export function isMobileUserAgent(userAgent: string): boolean {
  return isAndroidUserAgent(userAgent) || isIOSUserAgent(userAgent);
}

export function buildAndroidTextShareIntent(text: string): string {
  const encoded = encodeURIComponent(text);
  return `intent:#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${encoded};end`;
}

export function buildAndroidBankAppIntent(scheme: BankAppScheme): string {
  const schemeHost = scheme.scheme.replace(/:\/\/$/, "");
  const parts = [
    "intent:#Intent",
    `scheme=${schemeHost}`,
  ];

  if (scheme.androidPackage) {
    parts.push(`package=${scheme.androidPackage}`);
  }

  parts.push("end");
  return parts.join(";");
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function tryWebShareTransfer(
  text: string,
  title: string,
): Promise<boolean> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  try {
    await navigator.share({ title, text });
    return true;
  } catch {
    return false;
  }
}

/** Attempt to open a custom scheme via transient anchor click (mobile-friendly). */
export function tryOpenCustomScheme(url: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/** Open a deep link and fall back to web when the native app does not launch. */
export function tryOpenWithFallback(primaryUrl: string, fallbackUrl?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!fallbackUrl) {
    tryOpenCustomScheme(primaryUrl);
    return;
  }

  let didHide = false;

  const onVisibilityChange = () => {
    if (document.hidden) {
      didHide = true;
    }
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  tryOpenCustomScheme(primaryUrl);

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    if (!didHide) {
      window.location.assign(fallbackUrl);
    }
  }, 1200);
}

export type OtherBankTransferOptions = {
  userAgent?: string;
  preferWebShare?: boolean;
};

export type OtherBankTransferResult = {
  copied: boolean;
  shared: boolean;
  openedRegisteredBank: boolean;
  openedAndroidChooser: boolean;
  registeredBankScheme?: BankAppScheme;
};

/**
 * Clipboard copy + optional mobile helpers for traditional bank apps.
 * Registered bank app is opened first; Android falls back to text-share chooser.
 */
export async function launchOtherBankTransfer(
  account: TransferAccount,
  options: OtherBankTransferOptions = {},
): Promise<OtherBankTransferResult> {
  const userAgent = options.userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  const copyText = getFormattedTransferCopyText(account);
  const copied = await copyTextToClipboard(copyText);
  const registeredBankScheme = getBankAppScheme(account.bankCode);

  const result: OtherBankTransferResult = {
    copied,
    shared: false,
    openedRegisteredBank: false,
    openedAndroidChooser: false,
    registeredBankScheme,
  };

  if (!isMobileUserAgent(userAgent)) {
    return result;
  }

  if (options.preferWebShare !== false) {
    result.shared = await tryWebShareTransfer(copyText, `${account.bank.name} 송금`);
    if (result.shared) {
      return result;
    }
  }

  if (registeredBankScheme) {
    const intentUrl = isAndroidUserAgent(userAgent)
      ? buildAndroidBankAppIntent(registeredBankScheme)
      : registeredBankScheme.scheme;

    tryOpenCustomScheme(intentUrl);
    result.openedRegisteredBank = true;
    return result;
  }

  if (isAndroidUserAgent(userAgent)) {
    tryOpenCustomScheme(buildAndroidTextShareIntent(copyText));
    result.openedAndroidChooser = true;
  }

  return result;
}

export function resolveTransferAccount(
  bankCode: string | null | undefined,
  accountNo: string | null | undefined,
): TransferAccount | null {
  const code = bankCode?.trim();
  const normalizedAccount = normalizeAccountNo(accountNo ?? "");

  if (!code || !normalizedAccount) {
    return null;
  }

  const bank = getBankByCode(code);
  if (!bank) {
    return null;
  }

  return {
    bankCode: code,
    accountNo: normalizedAccount,
    bank,
  };
}

export function getTransferGatewayPath(username: string, linkId: string): string {
  return `/${username}/transfer/${linkId}`;
}

export function isTransferUrlMarker(url: string): boolean {
  return url.trim() === TRANSFER_URL_MARKER;
}
