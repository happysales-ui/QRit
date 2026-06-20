import Link from "next/link";
import Image from "next/image";
import { qritBrand } from "@/lib/qrit-brand-theme";

export default function AdminInviteCodesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={qritBrand.pageBg + " min-h-screen px-4 py-16"}>
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <Link href="/dashboard" className={qritBrand.link}>
          ← 대시보드
        </Link>
        <span className="rounded-full bg-[#F5C518]/20 px-3 py-1 text-xs font-semibold text-[#094347]">
          관리자
        </span>
      </header>
      <div className="mx-auto max-w-4xl text-center">
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
            인증코드 관리
          </h1>
        </div>
        <p className="mt-4 text-lg text-zinc-600">
          오프라인 판매 후 바로 코드를 생성하세요. 회원 정보 없이 메모만
          추가하면 됩니다.
        </p>
      </div>
      {children}
    </main>
  );
}
