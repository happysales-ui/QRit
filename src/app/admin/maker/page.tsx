import Link from "next/link";
import { QrGenerator } from "@/components/qr/qr-generator";
import { qritBrand } from "@/lib/qrit-brand-theme";

export default function AdminMakerPage() {
  return (
    <>
      <section className="mt-12">
        <QrGenerator />
      </section>
      <footer className="mt-16 text-center">
        <Link
          href="/demo"
          className={qritBrand.link}
        >
          데모 프로필 보기 → /demo
        </Link>
      </footer>
    </>
  );
}
