import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { getAdminKakaoChatUrl } from "@/lib/admin-kakao-url";

export const metadata: Metadata = {
  title: "개인정보처리방침 | QRit Jewelry",
  description: "QRit Jewelry 개인정보처리방침",
};

const LAST_UPDATED = "2026년 6월 24일";

export default async function PrivacyPage() {
  const kakaoChatUrl = await getAdminKakaoChatUrl();

  return (
    <LegalPageShell title="개인정보처리방침" lastUpdated={LAST_UPDATED}>
      <section>
        <p>
          QRit Jewelry(이하 &quot;회사&quot;)는 「개인정보 보호법」 등 관련
          법령을 준수하며, QRit 링크 프로필 서비스(이하 &quot;서비스&quot;) 이용
          과정에서 처리되는 개인정보를 보호하기 위해 본 방침을 수립·공개합니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          1. 수집하는 개인정보 항목
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>회원가입·로그인:</strong> 휴대폰 번호, 사용자명, 비밀번호
            (비밀번호는 암호화하여 저장)
          </li>
          <li>
            <strong>프로필 관리:</strong> 표시 이름, 프로필 사진, 자기소개,
            링크 제목·URL, 연락처(이름·전화번호), 계좌번호·은행 정보(이용자가
            직접 입력한 경우)
          </li>
          <li>
            <strong>서비스 이용:</strong> 접속 일시, IP 주소, 기기·브라우저
            정보, 서비스 이용 기록
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          2. 개인정보의 수집·이용 목적
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>회원 식별, 가입·로그인, 본인 확인 및 계정 관리</li>
          <li>링크 프로필·QR 연결 서비스 제공</li>
          <li>송금 안내 페이지에서 이용자가 등록한 계좌 정보 표시</li>
          <li>연락처 링크·명함 다운로드 기능 제공</li>
          <li>무료 이용 기간(가입 후 2년) 관리 및 서비스 만료 안내</li>
          <li>고객 문의 응대 및 서비스 개선</li>
          <li>부정 이용 방지 및 서비스 안정성 확보</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          3. 개인정보의 보유 및 이용 기간
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            회원 탈퇴 또는 서비스 종료 시까지 보유·이용합니다. 다만, 관련
            법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </li>
          <li>
            계좌번호 등 송금 안내용 정보는 이용자가 프로필에서 삭제하거나
            회원 탈퇴 시 지체 없이 파기합니다.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          4. 개인정보의 제3자 제공
        </h2>
        <p className="mt-3">
          회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만
          아래의 경우는 예외로 합니다.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령에 따른 요청이 있는 경우</li>
        </ul>
        <p className="mt-3">
          송금 안내 기능은 토스, 카카오페이, 네이버페이, 각 은행 앱 등
          제3자 서비스로 이동을 돕는 것이며, 회사는 해당 서비스와 제휴
          관계에 있지 않습니다. 외부 앱에서의 정보 처리는 각 서비스의
          정책을 따릅니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          5. 개인정보 처리 위탁
        </h2>
        <p className="mt-3">
          회사는 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를
          위탁합니다.
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-[#d4e8ea]">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="bg-[#e8f4f5]/60">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-zinc-800">
                  수탁업체
                </th>
                <th className="px-4 py-2.5 font-semibold text-zinc-800">
                  위탁 업무
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#d4e8ea]">
                <td className="px-4 py-2.5">Supabase, Inc.</td>
                <td className="px-4 py-2.5">
                  회원 인증, 데이터베이스 저장 및 호스팅
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          6. 공개되는 정보에 대한 안내
        </h2>
        <p className="mt-3">
          이용자가 프로필에 등록한 표시 이름, 링크, 연락처, 계좌번호 등은
          공개 프로필 URL 및 송금·연락처 안내 페이지를 통해 누구나 볼 수
          있습니다. 민감한 정보를 등록하기 전에 공개 범위를 반드시 확인해
          주세요.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          7. 이용자의 권리
        </h2>
        <p className="mt-3">
          이용자는 언제든지 본인의 개인정보에 대해 열람·정정·삭제·처리 정지를
          요청할 수 있습니다. 대시보드에서 직접 수정하거나, 아래 문의
          채널을 통해 요청할 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          8. 개인정보의 파기
        </h2>
        <p className="mt-3">
          보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이
          파기합니다. 전자적 파일은 복구·재생이 불가능한 방법으로 삭제합니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          9. 개인정보 보호책임자 및 문의
        </h2>
        <p className="mt-3">
          개인정보 처리와 관련한 문의·불만·피해 구제는 아래 채널로 연락해
          주세요.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>담당: QRit Jewelry 고객지원</li>
          <li>
            문의:{" "}
            <a
              href={kakaoChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0d5c63] underline underline-offset-2 hover:text-[#094347]"
            >
              카카오톡 문의하기
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-bold text-zinc-900">
          10. 방침의 변경
        </h2>
        <p className="mt-3">
          본 방침이 변경되는 경우 변경 사유 및 시행일을 서비스 내에
          공지합니다. 변경 방침은 공지한 시행일부터 적용됩니다.
        </p>
      </section>
    </LegalPageShell>
  );
}
