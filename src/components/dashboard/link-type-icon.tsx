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
        "flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
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
      className={cn("size-5", className)}
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
      className={cn("size-5", className)}
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
      className={cn("size-5", className)}
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
        <IconShell bgClassName="bg-[#d8f3dc] text-[#1b4332]" className={className}>
          <PhoneIcon />
        </IconShell>
      );

    case BANK_TRANSFER_LINK_TITLE:
      return (
        <IconShell bgClassName="bg-[#e8f5e9] text-[#2d6a4f]" className={className}>
          {bank ? (
            <span className="text-[11px] font-bold leading-none">{bank.shortName}</span>
          ) : (
            <BankIcon />
          )}
        </IconShell>
      );

    case "1:1 상담":
      return (
        <IconShell bgClassName="bg-[#fef9c3] text-[#854d0e]" className={className}>
          <span className="text-lg leading-none" aria-hidden>
            💬
          </span>
        </IconShell>
      );

    case "인스타그램":
      return (
        <IconShell bgClassName="bg-[#fce7f3] text-[#be185d]" className={className}>
          <InstagramIcon className="size-5" />
        </IconShell>
      );

    case "유튜브":
      return (
        <IconShell bgClassName="bg-[#fee2e2] text-[#dc2626]" className={className}>
          <YouTubeIcon className="size-5" />
        </IconShell>
      );

    case "블로그/카페":
      return (
        <IconShell bgClassName="bg-[#dcfce7] text-[#15803d]" className={className}>
          <span className="text-[11px] font-extrabold tracking-tight">N</span>
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
        <IconShell bgClassName="bg-[#f0f7f2] text-[#2d6a4f]" className={className}>
          <LinkIcon className="size-5" />
        </IconShell>
      );
  }
}
