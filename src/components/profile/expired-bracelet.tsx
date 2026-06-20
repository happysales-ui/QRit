import { ManageProfileLink } from "@/components/profile/manage-profile-link";
import { qritBrand } from "@/lib/qrit-brand-theme";

export function ExpiredBracelet() {
  return (
    <div
      className={`relative flex min-h-dvh items-center justify-center px-4 py-12 ${qritBrand.pageBgProfile}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={qritBrand.profileGlowTeal} />
      </div>

      <div className={`relative mx-auto w-full max-w-md ${qritBrand.card} text-center`}>
        <p className="text-4xl" aria-hidden="true">
          ⏳
        </p>
        <h1 className="mt-4 text-lg font-semibold text-zinc-900">
          서비스 사용 기간이 만료되었습니다.
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
