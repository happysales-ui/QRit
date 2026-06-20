import { cn } from "@/lib/utils";
import { qritBrand } from "@/lib/qrit-brand-theme";
import type { Profile } from "@/types";

interface ProfileHeaderProps {
  profile: Profile;
  className?: string;
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase();
}

export function ProfileHeader({ profile, className }: ProfileHeaderProps) {
  const displayName = profile.display_name ?? profile.username;
  const initials = getInitials(displayName);

  return (
    <header className={cn(qritBrand.profileHeaderCard, className)}>
      <div className="relative mx-auto flex flex-col items-center">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${profile.avatar_url}?v=${encodeURIComponent(profile.updated_at)}`}
            alt={`${displayName} 프로필 사진`}
            className={qritBrand.avatarImage}
          />
        ) : (
          <div aria-hidden="true" className={qritBrand.avatarFallback}>
            {initials}
          </div>
        )}
      </div>

      <h1 className={qritBrand.profileHeaderName}>{displayName}</h1>
      <p className={qritBrand.profileHeaderUsername}>@{profile.username}</p>

      {profile.bio ? (
        <p className={cn(qritBrand.profileHeaderBio, "mx-auto")}>{profile.bio}</p>
      ) : null}
    </header>
  );
}
