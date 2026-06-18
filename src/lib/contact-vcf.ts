export type MecardContact = {
  name: string;
  tel: string;
};

const MECARD_PREFIX_REGEX = /^mecard:/i;

function escapeVcardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Parses a MECARD payload (e.g. `MECARD:N:이름;TEL:01012345678;`). */
export function parseMecard(url: string): MecardContact | null {
  const trimmed = url.trim();
  if (!MECARD_PREFIX_REGEX.test(trimmed)) {
    return null;
  }

  const body = trimmed.replace(MECARD_PREFIX_REGEX, "");
  const fields: Record<string, string> = {};

  for (const part of body.split(";")) {
    const colonIndex = part.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }

    const key = part.slice(0, colonIndex).trim().toUpperCase();
    const value = part.slice(colonIndex + 1).trim();
    if (key && value) {
      fields[key] = value;
    }
  }

  const name = fields.N ?? "";
  const tel = fields.TEL ?? "";

  if (!name && !tel) {
    return null;
  }

  return { name, tel };
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

/** Client-side fallback: trigger a `.vcf` download from generated content. */
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
