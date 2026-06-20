import Image from "next/image";
import Link from "next/link";
import { qritBrand } from "@/lib/qrit-brand-theme";

export function AdminGateShell({ children }: { children: React.ReactNode }) {
  return (
    <main className={qritBrand.authPageBg}>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/qrit-logo.png"
            alt=""
            width={64}
            height={64}
            className="rounded-full"
            aria-hidden
          />
          <p className="text-sm font-medium text-zinc-600">QRit 관리자</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/dashboard" className={qritBrand.linkLg}>
            ← 대시보드로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}

export function AdminEnvMissingMessage() {
  return (
    <div className={qritBrand.cardLg}>
      <h1 className="text-xl font-bold text-zinc-900">관리자 페이지 사용 불가</h1>
      <p className="mt-3 text-sm text-red-600">
        ADMIN_PAGE_PASSWORD 환경변수가 설정되지 않았습니다.
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Vercel 프로젝트 설정 → Environment Variables에서{" "}
        <code className="font-mono text-xs">ADMIN_PAGE_PASSWORD</code>를 추가한 뒤
        다시 배포해 주세요.
      </p>
    </div>
  );
}
