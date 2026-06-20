import Link from "next/link";
import Image from "next/image";
import { qritBrand } from "@/lib/qrit-brand-theme";

export default function AdminMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={qritBrand.pageBg + " min-h-screen px-4 py-16"}>
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <Link href="/dashboard" className={qritBrand.link}>
          ← 대시보드
        </Link>
        <span className="rounded-full bg-[#F5C518]/20 px-3 py-1 text-xs font-semibold text-[#094347]">
          관리자
        </span>
      </header>
      <div className="mx-auto max-w-3xl text-center">
        <div className="mt-8 flex items-center justify-center gap-3">
          <Image
            src="/qrit-logo.png"
            alt=""
            width={56}
            height={56}
            className="rounded-full"
            aria-hidden
          />
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            QRit Jewelry
          </h1>
        </div>
        <p className="mt-4 text-lg text-zinc-600">
          링크나 텍스트를 입력하면 바로 QR 코드를 만들 수 있어요.
        </p>
      </div>
      {children}
    </main>
  );
}
