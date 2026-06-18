import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ContactGateway } from "@/components/profile/contact-gateway";
import { RESERVED_USERNAMES } from "@/lib/auth/validation";
import {
  getContactDownloadPath,
  isContactLink,
  resolveLinkContact,
} from "@/lib/contact-link";
import { getMockProfileByUsername } from "@/lib/mock-profile";
import { getProfileByUsername } from "@/lib/profile";
import { isProfileExpired } from "@/lib/service-expiry";

interface ContactPageProps {
  params: Promise<{ username: string; linkId: string }>;
}

async function resolveProfile(username: string) {
  const normalized = username.toLowerCase();

  if (RESERVED_USERNAMES.has(normalized)) {
    return null;
  }

  if (normalized === "demo") {
    return getMockProfileByUsername("demo");
  }

  return getProfileByUsername(normalized);
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await resolveProfile(username);

  if (!data) {
    return {
      title: "연락처 | QRit Jewelry",
    };
  }

  const displayName = data.profile.display_name ?? data.profile.username;

  return {
    title: `${displayName} 연락처 저장 | QRit Jewelry`,
    description: `${displayName}의 연락처를 저장합니다`,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { username, linkId } = await params;
  const data = await resolveProfile(username);

  if (!data) {
    notFound();
  }

  if (isProfileExpired(data.profile.expired_at)) {
    redirect(`/${data.profile.username}/expired`);
  }

  const link = data.links.find((item) => item.id === linkId);

  if (!link || !link.is_active || !isContactLink(link)) {
    notFound();
  }

  const contact = resolveLinkContact(link);

  if (!contact) {
    notFound();
  }

  const ownerName = data.profile.display_name ?? data.profile.username;
  const downloadUrl = getContactDownloadPath(data.profile.username, linkId);

  return (
    <ContactGateway
      ownerName={ownerName}
      username={data.profile.username}
      contact={contact}
      mecardUrl={link.url.trim()}
      downloadUrl={downloadUrl}
    />
  );
}
