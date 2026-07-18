import { readFileSync } from "node:fs";
import { join } from "node:path";

export type BundledHtmlPage = {
  slug: string;
  title: string;
  html: string;
};

const BUNDLED_META: Record<string, { title: string; file: string }> = {
  fireworks: {
    title: "8월의 첫눈",
    file: "fireworks-seed.html",
  },
};

const cache = new Map<string, BundledHtmlPage>();

function loadSeedHtml(filename: string): string {
  return readFileSync(
    join(process.cwd(), "src", "lib", "admin-html", filename),
    "utf8",
  );
}

/** Pages shipped with the app; used before/without a DB row. */
export function getBundledHtmlPage(slug: string): BundledHtmlPage | null {
  const meta = BUNDLED_META[slug];
  if (!meta) {
    return null;
  }

  const cached = cache.get(slug);
  if (cached) {
    return cached;
  }

  const page: BundledHtmlPage = {
    slug,
    title: meta.title,
    html: loadSeedHtml(meta.file),
  };
  cache.set(slug, page);
  return page;
}

export function listBundledHtmlPages(): BundledHtmlPage[] {
  return Object.keys(BUNDLED_META)
    .map((slug) => getBundledHtmlPage(slug))
    .filter((page): page is BundledHtmlPage => page !== null);
}
