import { LinkTypeIcon } from "@/components/dashboard/link-type-icon";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { safeExternalHref } from "@/lib/safe-url";
import { cn } from "@/lib/utils";
import type { LinkBlock } from "@/types";

interface ProfileLinkButtonProps {
  link: Pick<LinkBlock, "title" | "url" | "bank_code" | "account_no">;
  href?: string;
  className?: string;
}

export function ProfileLinkButton({
  link,
  href,
  className,
}: ProfileLinkButtonProps) {
  const externalHref = safeExternalHref(link.url);
  const resolvedHref = href ?? externalHref ?? "#";
  const isExternal = !href && externalHref !== null;

  return (
    <a
      href={resolvedHref}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cn(qritBrand.profileLinkCard, className)}
    >
      <LinkTypeIcon link={link} className="size-12 rounded-xl sm:size-10" />
      <span className={qritBrand.profileLinkTitle}>{link.title}</span>
      <span className={qritBrand.profileLinkChevron} aria-hidden>
        →
      </span>
    </a>
  );
}
