import { isMecardUrl } from "@/lib/link-presets";
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

  const url = link.url.trim();
  if (!url) {
    return null;
  }

  if (isMecardUrl(url)) {
    return { type: "external", url };
  }

  return { type: "external", url };
}
