import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function ManageProfileLink() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const href = user ? "/dashboard" : "/login";

  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg border border-violet-200/50 bg-white/50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-violet-400/90 transition-colors hover:border-violet-300/60 hover:bg-violet-50/60 hover:text-violet-600"
    >
      내 QRit 페이지 관리하기
    </Link>
  );
}
