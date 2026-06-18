/**
 * Contact dialer helpers — tel-first UX (native dialer with number pre-filled).
 *
 * Platform notes:
 * - iOS / Android: `tel:` opens the native Phone app with the number filled in;
 *   the user taps the green call button to place the call. Contact name cannot
 *   be passed via `tel:` — show it on our landing page instead.
 * - Programmatic `tel:` navigation on page load may be blocked; always keep
 *   a visible "전화 걸기" button as fallback.
 * - Optional `.vcf` save remains available for users who want address-book import.
 */

import { normalizePhone } from "@/lib/auth/validation";
import {
  buildVcf,
  buildVcfFilename,
  downloadVcf,
  type MecardContact,
} from "@/lib/contact-vcf";
import { isIOSUserAgent, isMobileUserAgent } from "@/lib/transfer-gateway";

const TEL_REDIRECT_DELAY_MS = 400;

export function normalizeContactTel(tel: string): string {
  return normalizePhone(tel);
}

/** Builds a `tel:` href from raw phone text (digits-only in URI). */
export function buildTelHref(tel: string): string | null {
  const normalized = normalizeContactTel(tel);
  if (!normalized) {
    return null;
  }

  return `tel:${normalized}`;
}

/** Formats a Korean mobile number for display (e.g. 010-1234-5678). */
export function formatContactTelDisplay(tel: string): string {
  const digits = normalizeContactTel(tel);

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const trimmed = tel.trim();
  return trimmed || digits;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Opens the native dialer with the number pre-filled (user confirms the call). */
export function openContactDialer(telHref: string): void {
  window.location.href = telHref;
}

/**
 * On mobile only, soft-open the dialer shortly after mount.
 * Returns true when a redirect was attempted.
 */
export async function autoOpenContactDialerOnMobile(
  telHref: string,
): Promise<boolean> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (!isMobileUserAgent(ua)) {
    return false;
  }

  await wait(TEL_REDIRECT_DELAY_MS);
  openContactDialer(telHref);
  return true;
}

/** Client-side `.vcf` blob download (optional secondary action). */
export function triggerVcfBlobSave(contact: MecardContact): void {
  const vcf = buildVcf(contact);
  const filename = buildVcfFilename(contact.name);
  downloadVcf(vcf, filename);
}

/** Server `.vcf` route via hidden iframe — useful when blob downloads are ignored on iOS. */
export function triggerVcfIframeSave(downloadUrl: string): void {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.src = downloadUrl;
  document.body.appendChild(iframe);
}

/** Optional address-book save — user-initiated only. */
export function saveContactToAddressBook(options: {
  contact: MecardContact;
  downloadUrl: string;
}): void {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (isIOSUserAgent(ua)) {
    triggerVcfIframeSave(options.downloadUrl);
    return;
  }

  triggerVcfBlobSave(options.contact);
}
