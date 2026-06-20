import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { qritBrand } from "@/lib/qrit-brand-theme";

export async function ManageProfileLink() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const href = user ? "/dashboard" : "/login";

  return (
    <Link href={href} className={qritBrand.manageLink}>
      내 QRit 페이지 관리하기
    </Link>
  );
}
