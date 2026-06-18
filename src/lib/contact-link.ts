import { parseMecard, type MecardContact } from "@/lib/contact-vcf";
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
  return parseMecard(link.url);
}

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
