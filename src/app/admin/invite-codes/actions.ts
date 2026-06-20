"use server";

import { revalidatePath } from "next/cache";
import {
  getAdminAccessErrorMessage,
  requireAdminAccess,
} from "@/lib/auth/admin";
import { generateInviteCode } from "@/lib/auth/invite-codes";
import { createServiceClient } from "@/lib/supabase/service";

export type InviteCodesActionState = {
  error?: string;
  success?: string;
};

const BATCH_OPTIONS = new Set([1, 5, 10]);

async function insertUniqueCodes(
  count: number,
  note: string | null,
): Promise<{ created: number; error?: string }> {
  const supabase = createServiceClient();
  let created = 0;

  for (let i = 0; i < count; i += 1) {
    let inserted = false;

    for (let attempt = 0; attempt < 8 && !inserted; attempt += 1) {
      const code = generateInviteCode();
      const { error } = await supabase.from("invite_codes").insert({
        code,
        note,
      });

      if (!error) {
        created += 1;
        inserted = true;
        continue;
      }

      if (error.code !== "23505") {
        return { created, error: "인증코드 생성에 실패했습니다." };
      }
    }

    if (!inserted) {
      return { created, error: "고유한 인증코드를 생성하지 못했습니다. 다시 시도해 주세요." };
    }
  }

  return { created };
}

export async function createInviteCodesAction(
  _prevState: InviteCodesActionState,
  formData: FormData,
): Promise<InviteCodesActionState> {
  try {
    await requireAdminAccess();

    const count = Number(formData.get("count") ?? 1);
    const noteRaw = String(formData.get("note") ?? "").trim();
    const note = noteRaw.length > 0 ? noteRaw : null;

    if (!BATCH_OPTIONS.has(count)) {
      return { error: "생성 수량은 1, 5, 10 중에서 선택해 주세요." };
    }

    const { created, error } = await insertUniqueCodes(count, note);

    if (error) {
      return { error };
    }

    revalidatePath("/admin/invite-codes");

    return {
      success:
        created === 1
          ? "인증코드 1개를 생성했습니다."
          : `인증코드 ${created}개를 생성했습니다.`,
    };
  } catch (error) {
    return { error: getAdminAccessErrorMessage(error) };
  }
}
