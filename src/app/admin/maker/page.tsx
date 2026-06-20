import Link from "next/link";
import { QrGenerator } from "@/components/qr/qr-generator";
import { requireAdminAccess } from "@/lib/auth/admin";
import { qritBrand } from "@/lib/qrit-brand-theme";

export const dynamic = "force-dynamic";

export default async function AdminMakerPage() {
  await requireAdminAccess();
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
