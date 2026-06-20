import { LinkTypeIcon } from "@/components/dashboard/link-type-icon";
import { cn } from "@/lib/utils";
import { qritBrand } from "@/lib/qrit-brand-theme";
import type { LinkBlock } from "@/types";

interface ProfileLinkButtonProps {
  link: Pick<LinkBlock, "title" | "url" | "bank_code">;
  href?: string;
  className?: string;
}

export function ProfileLinkButton({
  link,
  href,
  className,
}: ProfileLinkButtonProps) {
  const isExternal = !href;

  return (
    <a
      href={href ?? link.url}
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
