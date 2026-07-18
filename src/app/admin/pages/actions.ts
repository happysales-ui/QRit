"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  getAdminAccessErrorMessage,
  requireInviteCodesAccess,
} from "@/lib/auth/admin";
import {
  ADMIN_GATE_COOKIE,
  adminGateCookieOptions,
  createAdminGateCookieValue,
  verifyAdminPagePassword,
} from "@/lib/auth/admin-gate";
import {
  normalizeHtmlPageSlug,
  validateHtmlPageSlug,
} from "@/lib/admin-html/slug";

export type AdminPasswordActionState = {
  error?: string;
  success?: boolean;
};

export type HtmlPagesActionState = {
  error?: string;
  success?: string;
};

const MAX_HTML_CHARS = 3_500_000;

export async function verifyAdminPasswordAction(
  _prevState: AdminPasswordActionState,
  formData: FormData,
): Promise<AdminPasswordActionState> {
  const password = String(formData.get("password") ?? "");
  const cookieValue = createAdminGateCookieValue();

  if (!cookieValue) {
    return { error: "ADMIN_PAGE_PASSWORD 환경변수가 설정되지 않았습니다." };
  }

  if (!verifyAdminPagePassword(password)) {
    return { error: "관리자 비밀번호가 올바르지 않습니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_GATE_COOKIE, cookieValue, adminGateCookieOptions);

  revalidatePath("/admin/pages");

  return { success: true };
}

export async function upsertHtmlPageAction(
  _prevState: HtmlPagesActionState,
  formData: FormData,
): Promise<HtmlPagesActionState> {
  try {
    const supabase = await requireInviteCodesAccess();

    const slug = normalizeHtmlPageSlug(String(formData.get("slug") ?? ""));
    const title = String(formData.get("title") ?? "").trim();
    const html = String(formData.get("html") ?? "");
    const slugError = validateHtmlPageSlug(slug);

    if (slugError) {
      return { error: slugError };
    }

    if (!html.trim()) {
      return { error: "HTML 내용을 붙여넣어 주세요." };
    }

    if (html.length > MAX_HTML_CHARS) {
      return { error: "HTML이 너무 큽니다. 약 3.5MB 이하로 올려 주세요." };
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("admin_html_pages").upsert(
      {
        slug,
        title: title || slug,
        html,
        updated_at: now,
      },
      { onConflict: "slug" },
    );

    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message.includes("admin_html_pages")
      ) {
        return {
          error:
            "페이지를 저장하지 못했습니다. Supabase SQL 편집기에서 026_admin_html_pages.sql 마이그레이션을 실행해 주세요.",
        };
      }

      return { error: `저장에 실패했습니다. (${error.message})` };
    }

    revalidatePath("/admin/pages");
    revalidatePath(`/s/${slug}`);

    return {
      success: `저장했습니다. 공유 링크: /s/${slug}`,
    };
  } catch (error) {
    return { error: getAdminAccessErrorMessage(error) };
  }
}

export async function deleteHtmlPageAction(
  _prevState: HtmlPagesActionState,
  formData: FormData,
): Promise<HtmlPagesActionState> {
  try {
    const supabase = await requireInviteCodesAccess();
    const slug = normalizeHtmlPageSlug(String(formData.get("slug") ?? ""));
    const slugError = validateHtmlPageSlug(slug);

    if (slugError) {
      return { error: slugError };
    }

    const { error } = await supabase
      .from("admin_html_pages")
      .delete()
      .eq("slug", slug);

    if (error) {
      return { error: `삭제에 실패했습니다. (${error.message})` };
    }

    revalidatePath("/admin/pages");
    revalidatePath(`/s/${slug}`);

    return { success: `'${slug}' 페이지를 삭제했습니다.` };
  } catch (error) {
    return { error: getAdminAccessErrorMessage(error) };
  }
}
