import {
  parseContactFieldsFromUrl,
  resolveContactFromUrl,
  type MecardContact,
} from "@/lib/contact-vcf";
import { isContactLinkTitle, isMecardUrl } from "@/lib/link-presets";
import type { LinkBlock } from "@/types";

export function isContactLink(
  link: Pick<LinkBlock, "title" | "url">,
): boolean {
  return isContactLinkTitle(link.title) || isMecardUrl(link.url);
}

export function resolveLinkContact(
  link: Pick<LinkBlock, "url">,
): MecardContact | null {
  return resolveContactFromUrl(link.url);
}

export function formatContactLinkSummary(
  link: Pick<LinkBlock, "title" | "url">,
): string | null {
  if (!isContactLink(link)) {
    return null;
  }

  const contact = resolveLinkContact(link);
  if (!contact) {
    return link.url;
  }

  if (contact.name && contact.tel) {
    const digits = contact.tel;
    const formattedTel =
      digits.length === 11
        ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
        : digits.length === 10
          ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
          : digits;
    return `${contact.name} · ${formattedTel}`;
  }

  if (contact.name) {
    return contact.name;
  }

  if (contact.tel) {
    return contact.tel;
  }

  return link.url;
}

export { parseContactFieldsFromUrl };

export function getContactLinkPath(username: string, linkId: string): string {
  return `/${username}/contact/${linkId}`;
}

export function getContactDownloadPath(
  username: string,
  linkId: string,
): string {
  return `/${username}/contact/${linkId}/download`;
}

export function getContactLinkHref(
  username: string,
  link: Pick<LinkBlock, "id" | "title" | "url">,
): string | null {
  if (!isContactLink(link)) {
    return null;
  }

  if (!resolveLinkContact(link)) {
    return null;
  }

  return getContactLinkPath(username, link.id);
}
