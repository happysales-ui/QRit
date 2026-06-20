import {
  InstagramIcon,
  LinkIcon,
  YouTubeIcon,
} from "@/components/profile/social-icons";
import { getBankByCode } from "@/lib/bank-transfer";
import {
  BANK_TRANSFER_LINK_TITLE,
  CONTACT_LINK_TITLE,
  inferPresetFromTitle,
} from "@/lib/link-presets";
import { cn } from "@/lib/utils";
import type { LinkBlock } from "@/types";
import type { ReactNode } from "react";

type LinkTypeIconProps = {
  link: Pick<LinkBlock, "title" | "url" | "bank_code">;
  className?: string;
};

/** Large glyph size — fills the rounded square container for weak-eyesight accessibility. */
const ICON_GLYPH = "size-9";

function IconShell({
  children,
  bgClassName,
  className,
}: {
  children: ReactNode;
  bgClassName: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl p-0.5 shadow-sm",
        bgClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(ICON_GLYPH, className)}
    >
      <path
        d="M6.5 3h3l1.2 4.8a1 1 0 0 1-.24.92l-2.1 2.1a13 13 0 0 0 6.52 6.52l2.1-2.1a1 1 0 0 1 .92-.24L19 15.5V18.5a1 1 0 0 1-1 1C10.6 19.5 4.5 13.4 4.5 5.5A1 1 0 0 1 5.5 4.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(ICON_GLYPH, className)}
    >
      <path
        d="M3 10h18M5 10V19M9 10V19M15 10V19M19 10V19M2 19h20M12 3l9 5H3l9-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(ICON_GLYPH, className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9c-2.5-2.8-4-6-4-9s1.5-6.2 4-9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn(ICON_GLYPH, className)}
    >
      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3l3.5 4.5L14 18h6c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z" />
    </svg>
  );
}

function NaverMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "select-none text-[1.75rem] font-black leading-none tracking-tighter",
        className,
      )}
      aria-hidden
    >
      N
    </span>
  );
}

export function getLinkTypeKey(title: string): string {
  const { preset } = inferPresetFromTitle(title);
  return preset;
}

export function LinkTypeIcon({ link, className }: LinkTypeIconProps) {
  const preset = getLinkTypeKey(link.title);
  const bank = link.bank_code ? getBankByCode(link.bank_code) : undefined;

  switch (preset) {
    case CONTACT_LINK_TITLE:
      return (
        <IconShell bgClassName="bg-[#e8f4f5] text-[#0d5c63]" className={className}>
          <PhoneIcon />
        </IconShell>
      );

    case BANK_TRANSFER_LINK_TITLE:
      return (
        <IconShell bgClassName="bg-[#FEE500] text-[#191919]" className={className}>
          {bank ? (
            <span className="text-base font-extrabold leading-none">
              {bank.shortName}
            </span>
          ) : (
            <BankIcon />
          )}
        </IconShell>
      );

    case "1:1 상담":
      return (
        <IconShell bgClassName="bg-[#F5C518]/25 text-[#094347]" className={className}>
          <ChatIcon />
        </IconShell>
      );

    case "인스타그램":
      return (
        <IconShell bgClassName="bg-[#fce7f3] text-[#be185d]" className={className}>
          <InstagramIcon className={ICON_GLYPH} />
        </IconShell>
      );

    case "유튜브":
      return (
        <IconShell bgClassName="bg-[#fee2e2] text-[#dc2626]" className={className}>
          <YouTubeIcon className={ICON_GLYPH} />
        </IconShell>
      );

    case "블로그/카페":
      return (
        <IconShell bgClassName="bg-[#dcfce7] text-[#15803d]" className={className}>
          <NaverMark />
        </IconShell>
      );

    case "회사 홈페이지":
      return (
        <IconShell bgClassName="bg-[#e0f2fe] text-[#0369a1]" className={className}>
          <GlobeIcon />
        </IconShell>
      );

    default:
      return (
        <IconShell bgClassName="bg-[#e8f4f5] text-[#3d7a80]" className={className}>
          <LinkIcon className={ICON_GLYPH} />
        </IconShell>
      );
  }
}
