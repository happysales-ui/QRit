import { getBundledHtmlPage } from "@/lib/admin-html/bundled";
import { normalizeHtmlPageSlug } from "@/lib/admin-html/slug";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export type HtmlPagePayload = {
  slug: string;
  title: string;
  html: string;
  source: "database" | "bundled";
};

export async function getHtmlPageBySlug(
  rawSlug: string,
): Promise<HtmlPagePayload | null> {
  const slug = normalizeHtmlPageSlug(rawSlug);

  if (!slug) {
    return null;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("admin_html_pages")
        .select("slug, title, html")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data?.html) {
        return {
          slug: data.slug,
          title: data.title || slug,
          html: data.html,
          source: "database",
        };
      }
    } catch {
      // Fall through to bundled pages when DB is unavailable.
    }
  }

  const bundled = getBundledHtmlPage(slug);
  if (!bundled) {
    return null;
  }

  return {
    slug: bundled.slug,
    title: bundled.title,
    html: bundled.html,
    source: "bundled",
  };
}
