import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-violet-50 to-white px-4 py-12">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-zinc-900 transition-colors hover:text-violet-700"
        >
          QRit Jewelry
        </Link>
        <p className="mt-2 text-sm text-zinc-500">나만의 링크 프로필을 만들어 보세요</p>
      </div>
      <div className="w-full max-w-md rounded-xl border border-violet-100 bg-white p-8 shadow-sm shadow-violet-100/50">
        {children}
      </div>
    </div>
  );
}
