import Link from "next/link";
import { QRIT_ADMIN_KAKAO_CHAT_URL } from "@/lib/qrit-config";
import { qritBrand } from "@/lib/qrit-brand-theme";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">비밀번호 찾기</h1>
      <p className="mt-1 text-sm text-zinc-500">
        QRit 계정은 휴대폰 번호로 로그인합니다. 본인 확인 후 비밀번호를 재설정해 드립니다.
      </p>

      <section className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        <div>
          <h2 className="font-semibold text-zinc-900">현재 재설정 방법</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>가입 시 사용한 휴대폰 번호를 준비해 주세요.</li>
            <li>관리자 카카오톡 1:1 채팅으로 문의해 주세요.</li>
            <li>본인 확인 후 새 비밀번호를 안내해 드립니다.</li>
          </ol>
        </div>

        <a
          href={QRIT_ADMIN_KAKAO_CHAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={qritBrand.kakaoLink}
        >
          관리자 카카오톡 1:1 채팅 열기 →
        </a>
      </section>

      <section className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 p-4 text-sm text-amber-950">
        <h2 className="font-semibold">SMS OTP 자동 재설정 (준비 중)</h2>
        <p className="mt-2 leading-relaxed">
          휴대폰 인증(SMS OTP)으로 즉시 재설정하려면 Supabase Phone Auth와 SMS 발송
          서비스(Twilio, MessageBird 등) 연동이 필요합니다. 현재는 이메일/비밀번호 기반
          내부 계정(<code className="text-xs">{"{phone}@phone.qrit.app"}</code>)을
          사용하므로 Supabase 기본 비밀번호 재설정 이메일을 사용할 수 없습니다.
        </p>
        <p className="mt-2 text-xs text-amber-900/80">
          필요 설정: Supabase Phone provider 활성화, SMS API 키, 비밀번호 재설정용
          서버 액션(RPC 또는 Edge Function) 및 OTP 검증 플로우.
        </p>
      </section>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/login" className={qritBrand.linkLg}>
          ← 로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
