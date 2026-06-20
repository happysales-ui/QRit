"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  ADMIN_GATE_COOKIE,
  adminGateCookieOptions,
  createAdminGateCookieValue,
  verifyAdminPagePassword,
} from "@/lib/auth/admin-gate";

export type AdminGateActionState = {
  error?: string;
  success?: boolean;
};

export async function unlockAdminGateAction(
  _prevState: AdminGateActionState,
  formData: FormData,
): Promise<AdminGateActionState> {
  const password = String(formData.get("password") ?? "");
  const cookieValue = createAdminGateCookieValue();

  if (!cookieValue) {
    return { error: "ADMIN_PAGE_PASSWORD 환경 변수가 설정되지 않았습니다." };
  }

  if (!verifyAdminPagePassword(password)) {
    return { error: "관리자 비밀번호가 올바르지 않습니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_GATE_COOKIE, cookieValue, adminGateCookieOptions);

  revalidatePath("/admin", "layout");

  return { success: true };
}
