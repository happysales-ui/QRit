import { normalizePhone, validatePhone } from "@/lib/auth/validation";

export type MecardContact = {
  name: string;
  tel: string;
};

const MECARD_PREFIX_REGEX = /^mecard:/i;
const CORRUPTED_MECARD_PREFIX_REGEX = /^https?:\/\/mecard:/i;
const TEL_URL_REGEX = /^tel:([^?#]+)/i;
const MECARD_FIELD_PLACEHOLDERS = new Set(["이름", "연락처", "전화번호"]);
const KOREAN_MOBILE_REGEX = /^01\d{8,9}$/;

function escapeVcardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function isPlaceholderValue(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || MECARD_FIELD_PLACEHOLDERS.has(trimmed);
}

function normalizeMecardTel(raw: string): string {
  if (isPlaceholderValue(raw)) {
    return "";
  }

  return normalizePhone(raw);
}

/** Fixes legacy rows saved as `https://MECARD:...` and URL-encoded payloads. */
export function sanitizeContactUrl(url: string): string {
  let trimmed = url.trim();

  try {
    trimmed = decodeURIComponent(trimmed);
  } catch {
    // Keep the original string when decoding fails.
  }

  if (CORRUPTED_MECARD_PREFIX_REGEX.test(trimmed)) {
    return trimmed.replace(/^https?:\/\//i, "");
  }

  return trimmed;
}

function findFieldSeparatorIndex(part: string): number {
  let separatorIndex = -1;

  for (const separator of [":", "="]) {
    const index = part.indexOf(separator);
    if (index !== -1 && (separatorIndex === -1 || index < separatorIndex)) {
      separatorIndex = index;
    }
  }

  return separatorIndex;
}

function parseMecardBody(body: string): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const part of body.split(";")) {
    const trimmedPart = part.trim();
    if (!trimmedPart) {
      continue;
    }

    const separatorIndex = findFieldSeparatorIndex(trimmedPart);
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedPart.slice(0, separatorIndex).trim().toUpperCase();
    const value = trimmedPart.slice(separatorIndex + 1).trim();
    if (key && value && !(key in fields)) {
      fields[key] = value;
    }
  }

  if (!fields.TEL) {
    const telMatch = body.match(/TEL[:=]\s*([^;]+)/i);
    if (telMatch?.[1]) {
      fields.TEL = telMatch[1].trim();
    }
  }

  return fields;
}

/** Builds the canonical MECARD string stored in `links.url`. */
export function buildMecardUrl(name: string, tel: string): string {
  const trimmedName = name.trim();
  const normalizedTel = normalizePhone(tel);
  return `MECARD:N:${trimmedName};TEL:${normalizedTel};`;
}

/** Parses a MECARD payload (e.g. `MECARD:N:이름;TEL:01012345678;`). */
export function parseMecard(url: string): MecardContact | null {
  const sanitized = sanitizeContactUrl(url);
  if (!MECARD_PREFIX_REGEX.test(sanitized)) {
    return null;
  }

  const body = sanitized.replace(MECARD_PREFIX_REGEX, "");
  const fields = parseMecardBody(body);

  const name = isPlaceholderValue(fields.N ?? "") ? "" : fields.N.trim();
  const tel = normalizeMecardTel(fields.TEL ?? "");

  if (!name && !tel) {
    return null;
  }

  return { name, tel };
}

/** Parses contact links, including bare `tel:` URLs and digit-only phone numbers. */
export function resolveContactFromUrl(url: string): MecardContact | null {
  const sanitized = sanitizeContactUrl(url);
  const fromMecard = parseMecard(sanitized);

  if (fromMecard?.tel) {
    return fromMecard;
  }

  const telUrlMatch = sanitized.match(TEL_URL_REGEX);
  if (telUrlMatch?.[1]) {
    const tel = normalizeMecardTel(telUrlMatch[1]);
    if (tel) {
      return { name: fromMecard?.name ?? "", tel };
    }
  }

  const bareTel = normalizeMecardTel(sanitized);
  if (KOREAN_MOBILE_REGEX.test(bareTel)) {
    return { name: fromMecard?.name ?? "", tel: bareTel };
  }

  return fromMecard;
}

export function parseContactFieldsFromUrl(url: string): {
  name: string;
  tel: string;
} {
  const contact = resolveContactFromUrl(url) ?? parseMecard(url);
  if (!contact) {
    return { name: "", tel: "" };
  }

  return {
    name: isPlaceholderValue(contact.name) ? "" : contact.name,
    tel: contact.tel,
  };
}

export function validateContactFields(
  name: string,
  tel: string,
): string | null {
  const trimmedName = name.trim();
  const trimmedTel = tel.trim();

  if (!trimmedName || isPlaceholderValue(trimmedName)) {
    return "이름을 입력해 주세요.";
  }

  if (!trimmedTel || isPlaceholderValue(trimmedTel)) {
    return "연락처를 입력해 주세요.";
  }

  return validatePhone(trimmedTel);
}

export function validateMecardContactUrl(url: string): string | null {
  const contact = parseMecard(url);
  if (!contact) {
    return "MECARD:N:이름;TEL:전화번호; 형태로 입력해 주세요.";
  }

  return validateContactFields(contact.name, contact.tel);
}

export function buildContactLinkPayload(formData: FormData): { url: string } {
  const name = String(formData.get("contact_name") ?? "").trim();
  const tel = String(formData.get("contact_tel") ?? "").trim();

  return { url: buildMecardUrl(name, tel) };
}

/** Builds a vCard 3.0 document from name and phone. */
export function buildVcf(contact: MecardContact): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  if (contact.name) {
    const escapedName = escapeVcardValue(contact.name);
    lines.push(`FN:${escapedName}`);
    lines.push(`N:${escapedName};;;`);
  }

  if (contact.tel) {
    lines.push(`TEL;TYPE=CELL:${escapeVcardValue(contact.tel)}`);
  }

  lines.push("END:VCARD");
  return `${lines.join("\r\n")}\r\n`;
}

export function buildVcfFilename(name: string): string {
  const sanitized = name
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50);

  return sanitized ? `${sanitized}.vcf` : "contact.vcf";
}

/** Client-side fallback: trigger a `.vcf` download from generated content.
 *  On iOS Safari this may open an "Add to Contacts" sheet instead of a file save dialog.
 *  Programmatic downloads without user gesture are best-effort only. */
export function downloadVcf(vcfContent: string, filename: string): void {
  const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
