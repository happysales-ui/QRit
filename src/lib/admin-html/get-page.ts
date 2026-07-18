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

  // Bundled pages ship with the app — prefer them so deploys update /s/[slug]
  // even when an older DB seed still exists.
  const bundled = getBundledHtmlPage(slug);
  if (bundled) {
    return {
      slug: bundled.slug,
      title: bundled.title,
      html: bundled.html,
      source: "bundled",
    };
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
      // No DB page for this slug.
    }
  }

  return null;
}
