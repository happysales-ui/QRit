import { getBundledHtmlPage } from "@/lib/admin-html/bundled";
import { requireInviteCodesAccess } from "@/lib/auth/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

/** Ensure bundled fireworks exists in DB so admin list and public route stay in sync. */
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

    const { data } = await supabase
      .from("admin_html_pages")
      .select("slug")
      .eq("slug", "fireworks")
      .maybeSingle();

    if (data) {
      return;
    }

    await supabase.from("admin_html_pages").insert({
      slug: fireworks.slug,
      title: fireworks.title,
      html: fireworks.html,
    });
  } catch {
    // Table may not exist yet; public route still serves the bundled file.
  }
}
