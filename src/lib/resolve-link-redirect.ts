import { getContactLinkHref } from "@/lib/contact-link";
import { getTransferLinkHref } from "@/lib/transfer-link";
import type { LinkBlock } from "@/types";

export type LinkRedirect =
  | { type: "internal"; path: string }
  | { type: "external"; url: string };

export function resolveLinkRedirect(
  link: LinkBlock,
  username: string,
): LinkRedirect | null {
  const transferPath = getTransferLinkHref(username, link);
  if (transferPath) {
    return { type: "internal", path: transferPath };
  }

  const contactPath = getContactLinkHref(username, link);
  if (contactPath) {
    return { type: "internal", path: contactPath };
  }

  const url = link.url.trim();
  if (!url) {
    return null;
  }

  return { type: "external", url };
}
