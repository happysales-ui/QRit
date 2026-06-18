import { ManageProfileLink } from "@/components/profile/manage-profile-link";

export function ExpiredBracelet() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-b from-violet-100/80 via-violet-50/40 to-slate-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md rounded-2xl border border-violet-100 bg-white p-8 text-center shadow-sm">
        <p className="text-4xl" aria-hidden="true">
          ⏳
        </p>
        <h1 className="mt-4 text-lg font-semibold text-zinc-900">
          사용 기간이 만료된 팔찌입니다.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          서비스 연장 후 이용해 주세요.
        </p>
        <div className="mt-6">
          <ManageProfileLink />
        </div>
      </div>
    </div>
  );
}
