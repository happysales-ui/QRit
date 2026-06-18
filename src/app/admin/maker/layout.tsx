import Link from "next/link";

export default function AdminMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-16">
      <header className="mx-auto flex max-w-3xl items-center justify-end gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-violet-700"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          회원가입
        </Link>
      </header>
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          QRit Jewelry
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          링크나 텍스트를 입력하면 바로 QR 코드를 만들 수 있어요.
        </p>
      </div>
      {children}
    </main>
  );
}
