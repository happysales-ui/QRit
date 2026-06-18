import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TransferGateway } from "@/components/profile/transfer-gateway";
import { RESERVED_USERNAMES } from "@/lib/auth/validation";
import { getMockProfileByUsername } from "@/lib/mock-profile";
import { getProfileByUsername } from "@/lib/profile";
import {
  isTransferLink,
  resolveLinkTransferAccount,
} from "@/lib/transfer-link";
import { isProfileExpired } from "@/lib/service-expiry";

interface TransferRouteProps {
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
}: TransferRouteProps): Promise<Metadata> {
  const { username } = await params;
  const data = await resolveProfile(username);

  if (!data) {
    return {
      title: "송금 | QRit Jewelry",
    };
  }

  const displayName = data.profile.display_name ?? data.profile.username;

  return {
    title: `${displayName} 계좌 송금 | QRit Jewelry`,
    description: `${displayName}에게 계좌 송금하기`,
  };
}

export default async function TransferPage({ params }: TransferRouteProps) {
  const { username, linkId } = await params;
  const data = await resolveProfile(username);

  if (!data) {
    notFound();
  }

  if (isProfileExpired(data.profile.expired_at)) {
    redirect(`/${data.profile.username}/expired`);
  }

  const link = data.links.find((item) => item.id === linkId);

  if (!link || !link.is_active || !isTransferLink(link)) {
    notFound();
  }

  const account = resolveLinkTransferAccount(link);

  if (!account) {
    notFound();
  }

  const ownerName = data.profile.display_name ?? data.profile.username;

  return (
    <TransferGateway
      ownerName={ownerName}
      username={data.profile.username}
      account={account}
    />
  );
}
