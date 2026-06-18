import Link from "next/link";
import { QrGenerator } from "@/components/qr/qr-generator";

export default function AdminMakerPage() {
  return (
    <>
      <section className="mt-12">
        <QrGenerator />
      </section>
      <footer className="mt-16 text-center">
        <Link
          href="/demo"
          className="text-sm font-medium text-violet-600 transition-colors hover:text-violet-700"
        >
          데모 프로필 보기 → /demo
        </Link>
      </footer>
    </>
  );
}
