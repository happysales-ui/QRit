import { cn } from "@/lib/utils";
import { qritBrand } from "@/lib/qrit-brand-theme";
import {
  InstagramIcon,
  LinkIcon,
  YouTubeIcon,
} from "@/components/profile/social-icons";

export type LinkVariant = "instagram" | "youtube" | "link" | "transfer";

interface ProfileLinkButtonProps {
  title: string;
  url: string;
  href?: string;
  variant?: LinkVariant;
  className?: string;
}

export function detectLinkVariant(url: string, href?: string): LinkVariant {
  if (href?.includes("/transfer/")) {
    return "transfer";
  }

  if (href) {
    return "link";
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("instagram.com")) return "instagram";
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "youtube";
    }
  } catch {
    // fall through to generic link
  }
  return "link";
}

const variantStyles: Record<
  LinkVariant,
  { button: string; icon: string; Icon: typeof LinkIcon }
> = {
  instagram: {
    button:
      "border-pink-200/80 bg-gradient-to-r from-white to-pink-50/80 hover:border-pink-300 hover:shadow-pink-100/80",
    icon: "text-pink-600",
    Icon: InstagramIcon,
  },
  youtube: {
    button:
      "border-red-200/80 bg-gradient-to-r from-white to-red-50/80 hover:border-red-300 hover:shadow-red-100/80",
    icon: "text-red-600",
    Icon: YouTubeIcon,
  },
  transfer: {
    button: qritBrand.profileLinkTransfer,
    icon: qritBrand.profileLinkIcon,
    Icon: LinkIcon,
  },
  link: {
    button: qritBrand.profileLinkDefault,
    icon: qritBrand.profileLinkIcon,
    Icon: LinkIcon,
  },
};

export function ProfileLinkButton({
  title,
  url,
  href,
  variant,
  className,
}: ProfileLinkButtonProps) {
  const resolvedVariant = variant ?? detectLinkVariant(url, href);
  const { button, icon, Icon } = variantStyles[resolvedVariant];
  const isExternal = !href;

  return (
    <a
      href={href ?? url}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cn(
        "group relative flex w-full items-center rounded-xl border px-4 py-3.5 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
        button,
        className,
      )}
    >
      <span className={cn("absolute left-4", icon)}>
        <Icon />
      </span>
      <span className="w-full text-center text-[15px] font-semibold text-zinc-800">
        {title}
      </span>
    </a>
  );
}
