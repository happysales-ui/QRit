import { getBundledHtmlPage } from "@/lib/admin-html/bundled";
import { requireInviteCodesAccess } from "@/lib/auth/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

/** Sync bundled fireworks into DB so admin list and public route stay in sync. */
export async function ensureBundledPagesSeeded(): Promise<void> {
  if (!isSupabaseServiceRoleConfigured()) {
    return;
  }

  try {
    const supabase = await requireInviteCodesAccess();
    const fireworks = getBundledHtmlPage("fireworks");
    if (!fireworks) {
      return;
    }

    await supabase.from("admin_html_pages").upsert(
      {
        slug: fireworks.slug,
        title: fireworks.title,
        html: fireworks.html,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    );
  } catch {
    // Table may not exist yet; public route still serves the bundled file.
  }
}
