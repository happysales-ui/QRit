import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QritBrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { img: 28, text: "text-sm" },
  md: { img: 40, text: "text-2xl" },
  lg: { img: 48, text: "text-2xl" },
} as const;

export function QritBrandLogo({
  href = "/",
  size = "md",
  showText = true,
  className,
}: QritBrandLogoProps) {
  const { img, text } = sizeMap[size];

  const content = (
    <>
      <Image
        src="/qrit-logo.png"
        alt=""
        width={img}
        height={img}
        className="shrink-0 rounded-full"
        aria-hidden={showText}
      />
      {showText ? (
        <span
          className={cn(
            "font-bold tracking-tight text-[#171717] transition-colors group-hover:text-[#0d5c63]",
            text,
          )}
        >
          QRit Jewelry
        </span>
      ) : null}
    </>
  );

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        className,
      )}
    >
      {content}
    </Link>
  );
}
