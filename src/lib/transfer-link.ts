import {
  BANK_TRANSFER_LINK_TITLE,
  parseTransferUrl,
} from "@/lib/bank-transfer";
import {
  isTransferUrlMarker,
  resolveTransferAccount,
  TRANSFER_URL_MARKER,
  getTransferGatewayPath,
} from "@/lib/transfer-gateway";
import {
  isBankTransferLinkTitle,
  inferPresetFromTitle,
  type LinkTitlePreset,
} from "@/lib/link-presets";
import type { LinkBlock } from "@/types";

export { TRANSFER_URL_MARKER };

export function inferTransferLinkFormState(
  link: Pick<LinkBlock, "title" | "url" | "bank_code" | "account_no">,
): { preset: LinkTitlePreset; transferAlias: string } {
  if (isTransferLink(link)) {
    return {
      preset: BANK_TRANSFER_LINK_TITLE,
      transferAlias: isBankTransferLinkTitle(link.title) ? "" : link.title,
    };
  }

  const inferred = inferPresetFromTitle(link.title);
  return { preset: inferred.preset, transferAlias: inferred.customTitle };
}

export function isTransferLink(
  link: Pick<LinkBlock, "title" | "url" | "bank_code" | "account_no">,
): boolean {
  if (resolveTransferAccount(link.bank_code, link.account_no)) {
    return true;
  }

  if (isTransferUrlMarker(link.url)) {
    return true;
  }

  if (parseTransferUrl(link.url) !== null) {
    return true;
  }

  if (isBankTransferLinkTitle(link.title)) {
    return true;
  }

  return false;
}

export function resolveLinkTransferAccount(
  link: Pick<LinkBlock, "url" | "bank_code" | "account_no">,
) {
  const fromColumns = resolveTransferAccount(link.bank_code, link.account_no);
  if (fromColumns) {
    return fromColumns;
  }

  const parsed = parseTransferUrl(link.url);
  if (!parsed) {
    return null;
  }

  return resolveTransferAccount(parsed.bankCode, parsed.accountNo);
}

export function getTransferLinkHref(
  username: string,
  link: Pick<LinkBlock, "id" | "title" | "url" | "bank_code" | "account_no">,
): string | null {
  if (!isTransferLink(link)) {
    return null;
  }

  return getTransferGatewayPath(username, link.id);
}

export function getTransferLinkFullUrl(
  siteUrl: string,
  username: string,
  linkId: string,
): string {
  const base = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;
  return `${base}${getTransferGatewayPath(username, linkId)}`;
}

export function formatTransferLinkSummary(
  link: Pick<LinkBlock, "title" | "url" | "bank_code" | "account_no">,
): string {
  const account = resolveLinkTransferAccount(link);
  if (account) {
    return `${account.bank.name} · ${account.accountNo}`;
  }

  if (isTransferUrlMarker(link.url)) {
    return "계좌 송금 (설정 필요)";
  }

  return link.url;
}

export function buildTransferLinkPayload(formData: FormData): {
  url: string;
  bank_code: string;
  account_no: string;
} {
  const bankCode = String(formData.get("bank_code") ?? "").trim();
  const accountNo = String(formData.get("account_no") ?? "").trim();

  return {
    url: TRANSFER_URL_MARKER,
    bank_code: bankCode,
    account_no: accountNo.replace(/\D/g, ""),
  };
}

export { BANK_TRANSFER_LINK_TITLE };
