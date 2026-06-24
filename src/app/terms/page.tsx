import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { QRIT_ADMIN_KAKAO_CHAT_URL } from "@/lib/qrit-config";

export const metadata: Metadata = {
  title: "이용약관 | QRit Jewelry",
  description: "QRit Jewelry 링크 프로필 서비스 이용약관",
};

const LAST_UPDATED = "2026년 6월 24일";

export default function TermsPage() {
  return (
    <LegalPageShell title="이용약관" lastUpdated={LAST_UPDATED}>
      <section>
        <h2 className="text-base font-bold text-zinc-900">제1조 (목적)</h2>
        <p className="mt-3">
          본 약관은 QRit Jewelry(이하 &quot;회사&quot;)가 제공하는 QRit 링크
          프로필 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와
          이용자의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제2조 (서비스의 성격)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            본 서비스는 QRit Jewelry 제품을 구매한 고객을 위한 링크 프로필 및
            QR 코드 연결 서비스입니다.
          </li>
          <li>
            회사는 금융기관이 아니며, 전자금융거래법상 전자금융업자가 아닙니다.
            서비스는 결제·송금·이체 등 금융 거래를 처리하지 않습니다.
          </li>
          <li>
            송금 안내 페이지는 이용자가 직접 등록한 계좌 정보를 표시하고, 외부
            결제·은행 앱으로 이동을 돕는 편의 기능일 뿐입니다. 실제 송금은
            해당 금융·결제 서비스에서 이루어집니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          제3조 (제3자 서비스에 대한 고지)
        </h2>
        <p className="mt-3">
          본 서비스는 토스(Toss), 카카오페이(Kakao Pay), 네이버페이(Naver Pay),
          각종 은행 앱 등 제3자 금융·결제 서비스와 제휴·연계 관계에 있지
          않으며, 해당 사업자의 공식 서비스가 아닙니다. 이용자가 외부 앱을
          통해 진행하는 금융 거래에 대한 책임은 해당 서비스 제공자와 이용자
          본인에게 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제4조 (회원가입)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            회원가입은 QRit Jewelry 구매 시 안내받은 6자리 인증코드(초대코드)를
            입력한 경우에만 가능합니다.
          </li>
          <li>
            이용자는 휴대폰 번호, 사용자명, 비밀번호 등 필요한 정보를
            정확하게 제공해야 합니다.
          </li>
          <li>
            회사는 허위 정보 제공, 타인 명의 도용, 인증코드 부정 사용 등이
            확인될 경우 가입을 거절하거나 이용을 제한할 수 있습니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제5조 (이용 기간 및 요금)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            가입일로부터 2년간 무료로 서비스를 이용할 수 있습니다. 무료 이용
            종료일은 대시보드에서 확인할 수 있습니다.
          </li>
          <li>
            무료 이용 기간 종료 후 서비스 이용 방법 및 요금 정책은 회사의
            별도 안내에 따릅니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제6조 (이용자의 의무)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            이용자는 본인 소유이거나 송금 수취 권한이 있는 계좌번호만 등록해야
            합니다.
          </li>
          <li>
            등록한 계좌번호·연락처 등은 공개 프로필 및 송금 안내 페이지에
            표시될 수 있음을 이해하고 이에 동의합니다.
          </li>
          <li>
            타인의 권리를 침해하거나 불법·사기 목적의 정보를 게시해서는 안
            됩니다.
          </li>
          <li>
            계정 정보(비밀번호 등)를 안전하게 관리할 책임은 이용자에게 있습니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제7조 (회사의 의무)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            회사는 관련 법령과 본 약관이 정하는 바에 따라 서비스를 제공하기
            위해 노력합니다.
          </li>
          <li>
            회사는 이용자의 개인정보를 「개인정보처리방침」에 따라 보호합니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제8조 (서비스의 변경·중단)</h2>
        <p className="mt-3">
          회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나
          중단할 수 있습니다. 중요한 변경 사항은 서비스 내 공지 등 합리적인
          방법으로 안내합니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제9조 (면책)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            회사는 천재지변, 시스템 장애, 제3자 서비스 오류 등 회사의
            귀책사유가 아닌 사유로 인한 손해에 대해 책임을 지지 않습니다.
          </li>
          <li>
            이용자가 등록한 계좌 정보의 오류, 외부 금융·결제 앱 이용 중 발생한
            손실, 제3자에 의한 무단 접근 등으로 인한 손해에 대해 회사는
            책임을 지지 않습니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제10조 (약관의 변경)</h2>
        <p className="mt-3">
          회사는 필요한 경우 본 약관을 변경할 수 있으며, 변경 시 시행일과
          변경 내용을 서비스 내에 공지합니다. 변경 약관 시행일 이후 서비스를
          계속 이용하는 경우 변경 약관에 동의한 것으로 봅니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">제11조 (문의)</h2>
        <p className="mt-3">
          서비스 이용과 관련한 문의는 카카오톡 채널을 통해 접수할 수 있습니다.
        </p>
        <p className="mt-2">
          <a
            href={QRIT_ADMIN_KAKAO_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0d5c63] underline underline-offset-2 hover:text-[#094347]"
          >
            카카오톡 문의하기
          </a>
        </p>
      </section>
    </LegalPageShell>
  );
}
