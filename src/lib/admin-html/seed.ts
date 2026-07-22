import { listBundledHtmlPages } from "@/lib/admin-html/bundled";
import { requireInviteCodesAccess } from "@/lib/auth/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

/** Sync bundled HTML pages into DB so admin list and public route stay in sync. */
export async function ensureBundledPagesSeeded(): Promise<void> {
  if (!isSupabaseServiceRoleConfigured()) {
    return;
  }

  try {
    const supabase = await requireInviteCodesAccess();
    const pages = listBundledHtmlPages();
    if (pages.length === 0) {
      return;
    }

    const now = new Date().toISOString();
    await supabase.from("admin_html_pages").upsert(
      pages.map((page) => ({
        slug: page.slug,
        title: page.title,
        html: page.html,
        updated_at: now,
      })),
      { onConflict: "slug" },
    );
  } catch {
    // Table may not exist yet; public route still serves the bundled file.
  }
}
