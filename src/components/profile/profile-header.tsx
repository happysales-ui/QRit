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
    <header className={cn("flex flex-col items-center text-center", className)}>
      <div className="relative">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={`${displayName} 프로필 사진`}
            className="size-24 rounded-full object-cover shadow-lg ring-4 ring-white/80"
          />
        ) : (
          <div aria-hidden="true" className={qritBrand.avatarFallback}>
            {initials}
          </div>
        )}
      </div>

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900">
        {displayName}
      </h1>
      <p className={qritBrand.username}>@{profile.username}</p>

      {profile.bio ? (
        <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-zinc-600">
          {profile.bio}
        </p>
      ) : null}
    </header>
  );
}
