/**
 * Contact auto-save helpers (best-effort, not zero-click on every device).
 *
 * Platform notes:
 * - Android: `mecard:` may open the Contacts app on some OEM browsers; after a short
 *   timeout we fall back to `.vcf` if the page is still visible.
 * - iOS Safari: `mecard:` is largely blocked; auto `.vcf` via iframe/download is the
 *   main path and may show an "Add to Contacts" sheet rather than a file download.
 * - Desktop: behavior varies; users may get a `.vcf` file or a contacts import prompt.
 *
 * True zero-click contact save is impossible on all browsers due to security sandboxes.
 */

import {
  buildVcf,
  buildVcfFilename,
  downloadVcf,
  type MecardContact,
} from "@/lib/contact-vcf";
import { isAndroidUserAgent, isIOSUserAgent } from "@/lib/transfer-gateway";

const MECARD_TIMEOUT_MS = 300;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Client-side `.vcf` blob download (avoids an extra network round trip). */
export function triggerVcfBlobSave(contact: MecardContact): void {
  const vcf = buildVcf(contact);
  const filename = buildVcfFilename(contact.name);
  downloadVcf(vcf, filename);
}

/** Server `.vcf` route via hidden iframe — useful when blob downloads are ignored. */
export function triggerVcfIframeSave(downloadUrl: string): void {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.src = downloadUrl;
  document.body.appendChild(iframe);
}

function triggerVcfSave(contact: MecardContact, downloadUrl: string): void {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (isIOSUserAgent(ua)) {
    triggerVcfIframeSave(downloadUrl);
    return;
  }

  triggerVcfBlobSave(contact);
}

/**
 * Auto-save on page load:
 * 1) Android → try stored MECARD URL, then `.vcf` if still on page after 300ms.
 * 2) iOS / others → `.vcf` immediately (MECARD skipped on iOS).
 */
export async function attemptContactAutoSave(options: {
  contact: MecardContact;
  mecardUrl: string;
  downloadUrl: string;
}): Promise<void> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isAndroid = isAndroidUserAgent(ua);

  if (isAndroid && options.mecardUrl) {
    window.location.href = options.mecardUrl;
    await wait(MECARD_TIMEOUT_MS);

    if (document.visibilityState === "visible") {
      triggerVcfSave(options.contact, options.downloadUrl);
    }

    return;
  }

  triggerVcfSave(options.contact, options.downloadUrl);
}

/** Manual fallback — same strategy as auto-save but always user-gesture friendly. */
export function manualContactSave(options: {
  contact: MecardContact;
  mecardUrl: string;
  downloadUrl: string;
}): void {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  if (isAndroidUserAgent(ua) && options.mecardUrl) {
    window.location.href = options.mecardUrl;
    return;
  }

  triggerVcfSave(options.contact, options.downloadUrl);
}
