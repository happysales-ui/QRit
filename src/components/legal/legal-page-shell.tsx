import Link from "next/link";
import { QritBrandLogo } from "@/components/qrit-brand-logo";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

interface LegalPageShellProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <div className={qritBrand.authPageBg}>
      <div className="mb-6 text-center">
        <QritBrandLogo href="/" size="lg" className="justify-center" />
      </div>

      <article
        className={cn(
          "mx-auto w-full max-w-2xl rounded-xl border border-[#d4e8ea] bg-white p-8 shadow-sm shadow-[#0d5c63]/5",
        )}
      >
        <header className="border-b border-[#d4e8ea] pb-6">
          <Link href="/login" className={qritBrand.link}>
            ← 돌아가기
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">{title}</h1>
          <p className="mt-2 text-sm text-zinc-500">시행일: {lastUpdated}</p>
        </header>

        <div className="prose-legal mt-8 space-y-8 text-sm leading-relaxed text-zinc-700">
          {children}
        </div>
      </article>

      <footer className="mt-8 text-center">
        <LegalFooterLinks />
        <p className="mt-3 text-xs text-zinc-400">© QRit Jewelry</p>
      </footer>
    </div>
  );
}
