import { QritBrandLogo } from "@/components/qrit-brand-logo";
import { qritBrand } from "@/lib/qrit-brand-theme";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={qritBrand.authPageBg}>
      <div className="mb-8 text-center">
        <QritBrandLogo href="/" size="lg" className="justify-center" />
        <p className="mt-2 text-sm text-zinc-500">나만의 링크 프로필을 만들어 보세요</p>
      </div>
      <div className={qritBrand.authCard}>{children}</div>
    </div>
  );
}
