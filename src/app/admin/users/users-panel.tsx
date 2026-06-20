"use client";

import Link from "next/link";
import {
  formatFreeUntilDate,
  isSubscriptionExpired,
  SUBSCRIPTION_STATUS_LABELS,
  type SubscriptionStatus,
} from "@/lib/subscription";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

export type UserSubscriptionRow = {
  username: string;
  created_at: string;
  free_until: string;
  subscription_status: SubscriptionStatus;
};

function formatSignupDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function statusBadgeClass(status: SubscriptionStatus): string {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800";
    case "expired":
      return "bg-zinc-200 text-zinc-700";
    default:
      return "bg-[#F5C518]/20 text-[#094347]";
  }
}

export function UsersPanel({ users }: { users: UserSubscriptionRow[] }) {
  return (
    <section className="mx-auto mt-10 max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          총 {users.length}명 · 만료 임박 순
        </p>
        <Link
          href="/admin/invite-codes"
          className={qritBrand.secondaryButton + " !w-auto px-4 py-2 text-sm"}
        >
          인증코드 →
        </Link>
      </div>

      <div className={`overflow-x-auto ${qritBrand.cardLg}`}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="px-4 py-3 font-medium">사용자명</th>
              <th className="px-4 py-3 font-medium">가입일</th>
              <th className="px-4 py-3 font-medium">무료 이용 종료</th>
              <th className="px-4 py-3 font-medium">구독 상태</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  등록된 사용자가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const expired = isSubscriptionExpired(user);

                return (
                  <tr
                    key={user.username}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatSignupDate(user.created_at)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        expired ? "text-red-600" : "text-zinc-700",
                      )}
                    >
                      {formatFreeUntilDate(user.free_until)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          statusBadgeClass(user.subscription_status),
                        )}
                      >
                        {SUBSCRIPTION_STATUS_LABELS[user.subscription_status]}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
