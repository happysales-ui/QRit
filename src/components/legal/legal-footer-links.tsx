import Link from "next/link";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

interface LegalFooterLinksProps {
  className?: string;
  linkClassName?: string;
}

export function LegalFooterLinks({
  className,
  linkClassName,
}: LegalFooterLinksProps) {
  const linkClass = cn(qritBrand.link, "text-xs", linkClassName);

  return (
    <p className={cn("text-xs text-zinc-400", className)}>
      <Link href="/terms" className={linkClass}>
        이용약관
      </Link>
      <span className="mx-1.5" aria-hidden>
        ·
      </span>
      <Link href="/privacy" className={linkClass}>
        개인정보처리방침
      </Link>
    </p>
  );
}
