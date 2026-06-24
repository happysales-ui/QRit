import { getProfileByUsername } from "@/lib/profile";
import { QRIT_ADMIN_KAKAO_CHAT_URL_FALLBACK } from "@/lib/qrit-config";
import type { LinkBlock } from "@/types";

const CONSULTATION_LINK_TITLE = "1:1 상담";
const KAKAO_URL_PATTERN = /kakao\.com/i;

/** Admin profile whose public "1:1 상담" link powers legal / forgot-password Kakao buttons. */
function resolveAdminUsername(): string {
  return process.env.QRIT_ADMIN_USERNAME?.trim().toLowerCase() || "hyun1016";
}

function findConsultationLink(links: LinkBlock[]): LinkBlock | undefined {
  const byTitle = links.find((link) => link.title.trim() === CONSULTATION_LINK_TITLE);
  if (byTitle?.url?.trim()) {
    return byTitle;
  }

  return links.find((link) => KAKAO_URL_PATTERN.test(link.url));
}

function isPublicHttpsUrl(url: string): boolean {
  return /^https:\/\/.+/i.test(url.trim());
}

/**
 * Kakao consultation URL for admin-facing pages (privacy, terms, forgot-password).
 * Reads the admin profile's public "1:1 상담" link — same source as their QR profile.
 */
export async function getAdminKakaoChatUrl(): Promise<string> {
  const profileData = await getProfileByUsername(resolveAdminUsername());
  const link = profileData ? findConsultationLink(profileData.links) : undefined;
  const url = link?.url?.trim();

  if (url && isPublicHttpsUrl(url)) {
    return url;
  }

  return QRIT_ADMIN_KAKAO_CHAT_URL_FALLBACK;
}
