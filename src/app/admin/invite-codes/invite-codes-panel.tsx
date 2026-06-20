"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createInviteCodesAction,
  type InviteCodesActionState,
} from "@/app/admin/invite-codes/actions";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

export type InviteCodeRow = {
  id: string;
  code: string;
  status: "unused" | "used";
  created_at: string;
  used_at: string | null;
  note: string | null;
};

const initialState: InviteCodesActionState = {};

function formatDateTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InviteCodesPanel({ codes }: { codes: InviteCodeRow[] }) {
  const [state, formAction, isPending] = useActionState(
    createInviteCodesAction,
    initialState,
  );
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCodes = useMemo(
    () => (unusedOnly ? codes.filter((row) => row.status === "unused") : codes),
    [codes, unusedOnly],
  );

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(null);
    }
  }

  return (
    <section className="mx-auto mt-10 max-w-4xl">
      <div className={qritBrand.cardLg}>
        <h2 className="text-lg font-semibold text-zinc-900">코드 생성</h2>
        <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[8rem]">
            <label htmlFor="count" className="block text-sm font-medium text-zinc-700">
              생성 수량
            </label>
            <select
              id="count"
              name="count"
              defaultValue={1}
              className={qritBrand.select}
            >
              <option value={1}>1개</option>
              <option value={5}>5개</option>
              <option value={10}>10개</option>
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="note" className="block text-sm font-medium text-zinc-700">
              메모 (선택)
            </label>
            <input
              id="note"
              name="note"
              type="text"
              placeholder="예: 6월 주문분"
              className={qritBrand.input}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={cn("shrink-0", qritBrand.primaryButton)}
          >
            {isPending ? "생성 중…" : "코드 생성"}
          </button>
        </form>

        {state.error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="mt-3 text-sm text-emerald-700" role="status">
            {state.success}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">코드 목록</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={unusedOnly}
            onChange={(event) => setUnusedOnly(event.target.checked)}
            className="size-4 rounded border-zinc-300 text-[#0d5c63] focus:ring-[#147278]/20"
          />
          미사용만 보기
        </label>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-[#d4e8ea] bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[#d4e8ea] bg-[#e8f4f5]/50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-semibold">코드</th>
              <th className="px-4 py-3 font-semibold">상태</th>
              <th className="px-4 py-3 font-semibold">생성일</th>
              <th className="px-4 py-3 font-semibold">사용일</th>
              <th className="px-4 py-3 font-semibold">메모</th>
            </tr>
          </thead>
          <tbody>
            {filteredCodes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  {unusedOnly ? "미사용 인증코드가 없습니다." : "인증코드가 없습니다."}
                </td>
              </tr>
            ) : (
              filteredCodes.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#e8f0f1] last:border-b-0 hover:bg-[#faf8f3]/60"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => copyCode(row.code)}
                      className="font-mono text-base font-semibold tracking-widest text-[#0d5c63] transition-colors hover:text-[#094347]"
                      title="클릭하여 복사"
                    >
                      {row.code}
                    </button>
                    {copiedCode === row.code ? (
                      <span className="ml-2 text-xs text-emerald-600">복사됨</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        row.status === "unused"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600",
                      )}
                    >
                      {row.status === "unused" ? "미사용" : "사용됨"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{formatDateTime(row.created_at)}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatDateTime(row.used_at)}</td>
                  <td className="px-4 py-3 text-zinc-600">{row.note ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
