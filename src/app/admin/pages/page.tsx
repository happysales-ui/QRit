import { PagesPageClient } from "@/app/admin/pages/pages-page-client";
import type { HtmlPageRow } from "@/app/admin/pages/pages-panel";
import {
  getInviteCodesAuthStatus,
  requireInviteCodesAccess,
} from "@/lib/auth/admin";
import { listBundledHtmlPages } from "@/lib/admin-html/bundled";
import { ensureBundledPagesSeeded } from "@/lib/admin-html/seed";
import {
  getSupabaseServiceRoleConfigErrorMessage,
  isSupabaseServiceRoleConfigured,
  SUPABASE_SERVICE_ROLE_NOT_CONFIGURED,
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

function AdminConfigError({ message }: { message: string }) {
  return (
    <section className="mx-auto mt-10 max-w-4xl rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-sm text-amber-900">
      {message}
    </section>
  );
}

function isMissingTable(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (error.message?.includes("admin_html_pages") ?? false)
  );
}

function siteOriginFromEnv(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (fromEnv) {
    return fromEnv.startsWith("http")
      ? fromEnv.replace(/\/$/, "")
      : `https://${fromEnv.replace(/\/$/, "")}`;
  }

  return "https://q-rit-beige.vercel.app";
}

function bundledPageRows(): HtmlPageRow[] {
  return listBundledHtmlPages().map((page) => ({
    slug: page.slug,
    title: page.title,
    updated_at: null,
    source: "bundled" as const,
    htmlPreviewLength: page.html.length,
  }));
}

export default async function AdminPagesPage() {
  const { isAuthenticated, passwordConfigured } = await getInviteCodesAuthStatus();

  let pages: HtmlPageRow[] = [];
  let configError: string | null = null;
  let loadError: string | null = null;

  if (isAuthenticated) {
    if (!isSupabaseServiceRoleConfigured()) {
      configError = getSupabaseServiceRoleConfigErrorMessage();
      pages = bundledPageRows();
    } else {
      try {
        await ensureBundledPagesSeeded();
        const supabase = await requireInviteCodesAccess();

        const { data, error } = await supabase
          .from("admin_html_pages")
          .select("slug, title, html, updated_at")
          .order("updated_at", { ascending: false });

        if (error) {
          if (isMissingTable(error)) {
            pages = bundledPageRows();
            configError =
              "DB 테이블이 아직 없습니다. Supabase SQL 편집기에서 supabase/migrations/026_admin_html_pages.sql 을 실행하면 추가·수정·삭제가 가능합니다. 번들 페이지는 /s/fireworks, /s/water 로 이미 공유할 수 있습니다.";
          } else {
            loadError = `페이지 목록을 불러오지 못했습니다. (${error.message})`;
          }
        } else {
          const dbRows = (data ?? []).map((row) => ({
            slug: row.slug,
            title: row.title,
            updated_at: row.updated_at,
            source: "database" as const,
            htmlPreviewLength: row.html.length,
          }));

          const dbSlugs = new Set(dbRows.map((row) => row.slug));
          const bundledOnly = bundledPageRows().filter(
            (page) => !dbSlugs.has(page.slug),
          );

          pages = [...dbRows, ...bundledOnly];
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === SUPABASE_SERVICE_ROLE_NOT_CONFIGURED
        ) {
          configError = getSupabaseServiceRoleConfigErrorMessage();
          pages = bundledPageRows();
        } else if (error instanceof Error && error.message === "FORBIDDEN") {
          configError = "관리자 인증이 필요합니다. 비밀번호를 입력해 주세요.";
        } else {
          throw error;
        }
      }
    }
  }

  if (loadError) {
    return (
      <section className="mx-auto mt-10 max-w-4xl rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
        {loadError}
      </section>
    );
  }

  return (
    <>
      {configError ? <AdminConfigError message={configError} /> : null}
      <PagesPageClient
        initialAuthenticated={isAuthenticated}
        passwordConfigured={passwordConfigured}
        initialPages={pages}
        serviceRoleConfigured={isSupabaseServiceRoleConfigured()}
        siteOrigin={siteOriginFromEnv()}
      />
    </>
  );
}
