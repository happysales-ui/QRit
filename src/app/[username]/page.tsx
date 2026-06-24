import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProfilePage } from "@/components/profile/profile-page";
import { RESERVED_USERNAMES } from "@/lib/auth/validation";
import { getMockProfileByUsername } from "@/lib/mock-profile";
import { getProfileByUsername } from "@/lib/profile";
import { isProfileHubView } from "@/lib/profile-hub";
import { resolveLinkRedirect } from "@/lib/resolve-link-redirect";
import { isProfileExpired } from "@/lib/service-expiry";

interface ProfileRouteProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ hub?: string }>;
}

async function resolveProfile(username: string) {
  const normalized = username.toLowerCase();

  if (RESERVED_USERNAMES.has(normalized)) {
    return null;
  }

  if (normalized === "demo") {
    return getMockProfileByUsername("demo");
  }

  const supabaseData = await getProfileByUsername(normalized);
  if (supabaseData) {
    return supabaseData;
  }

  return null;
}

export async function generateMetadata({
  params,
}: ProfileRouteProps): Promise<Metadata> {
  const { username } = await params;
  const data = await resolveProfile(username);

  if (!data) {
    return {
      title: "프로필을 찾을 수 없습니다 | QRit Jewelry",
    };
  }

  const displayName = data.profile.display_name ?? data.profile.username;

  return {
    title: `${displayName} | QRit Jewelry`,
    description: data.profile.bio ?? `${displayName}의 링크 모음`,
  };
}

export default async function UserProfilePage({
  params,
  searchParams,
}: ProfileRouteProps) {
  const { username } = await params;
  const query = await searchParams;
  const showFullHub = isProfileHubView(query);
  const data = await resolveProfile(username);

  if (!data) {
    notFound();
  }

  const { profile, links } = data;

  if (isProfileExpired(profile.expired_at)) {
    redirect(`/${profile.username}/expired`);
  }

  if (profile.default_link_id && !showFullHub) {
    const defaultLink = links.find(
      (link) => link.id === profile.default_link_id && link.is_active,
    );

    if (defaultLink) {
      const destination = resolveLinkRedirect(defaultLink, profile.username);
      if (destination) {
        if (destination.type === "internal") {
          redirect(destination.path);
        }
        redirect(destination.url);
      }
    }
  }

  return (
    <ProfilePage
      profile={profile}
      links={links}
      showDefaultLinkNote={showFullHub && !!profile.default_link_id}
    />
  );
}
