/**
 * Contact dialer helpers — tel-first UX (native dialer with number pre-filled).
 *
 * Platform notes:
 * - iOS / Android: `tel:` opens the native Phone app with the number filled in;
 *   the user taps the green call button to place the call. Contact name cannot
 *   be passed via `tel:` — show it on our landing page instead.
 * - Programmatic `tel:` navigation on page load may be blocked; always keep
 *   a visible "전화 걸기" button as fallback.
 * - Optional contact save via Web Share API (vCard file) opens the native share
 *   sheet with "Contacts" / "연락처에 추가" on mobile; blob/server `.vcf` fallbacks
 *   remain for browsers without file sharing.
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

export type SaveContactToPhoneResult =
  | "shared"
  | "ios-download"
  | "blob-download"
  | "cancelled";

/**
 * Saves a contact via the native share sheet when possible (vCard file).
 * Falls back to server `.vcf` route on iOS, then blob download.
 */
export async function saveContactToPhone(
  vcf: string,
  name: string,
  options?: { downloadUrl?: string },
): Promise<SaveContactToPhoneResult> {
  const filename = buildVcfFilename(name);
  const title = name.trim() || "연락처";

  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      const file = new File([vcf], filename, { type: "text/vcard" });
      const shareData: ShareData = { files: [file], title };

      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return "shared";
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
  }

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (isIOSUserAgent(ua) && options?.downloadUrl) {
    window.location.href = options.downloadUrl;
    return "ios-download";
  }

  downloadVcf(vcf, filename);
  return "blob-download";
}

/** Builds vCard content and opens the native save flow. */
export async function saveContactFromMecard(
  contact: MecardContact,
  options?: { downloadUrl?: string },
): Promise<SaveContactToPhoneResult> {
  return saveContactToPhone(buildVcf(contact), contact.name, options);
}
