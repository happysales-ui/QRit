"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Toast } from "@/components/ui/toast";
import {
  buildDeepLinks,
  copyTextToClipboard,
  formatAccountNo,
  getBankAppScheme,
  getFormattedTransferCopyText,
  getMajorBankAppSchemes,
  openBankAppWithFallback,
  tryOpenWithFallback,
  type BankAppScheme,
  type TransferDeepLink,
  type TransferAccount,
} from "@/lib/transfer-gateway";
import {
  QritShopBanner,
  QRIT_SHOP_BANNER_OFFSET_CLASS,
} from "@/components/profile/qrit-shop-banner";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

interface TransferGatewayProps {
  ownerName: string;
  username: string;
  account: TransferAccount;
}

const TRANSFER_STEPS = [
  "송금할 앱 또는 은행을 선택하세요",
  "계좌번호가 자동으로 복사됩니다",
  "확인 후 송금하기를 누르면 해당 앱으로 이동합니다",
  "은행·페이 앱에서 로그인하세요",
  "붙여넣기 허용 후 계좌번호를 확인·입력하세요",
  "금액을 입력하고 송금을 완료하세요",
] as const;

function TransferAppIcon({ appId }: { appId: "toss" | "kakaopay" | "naverpay" }) {
  const shared = "text-sm font-bold";

  if (appId === "toss") {
    return (
      <span className={cn(shared, "text-blue-600")} aria-hidden>
        toss
      </span>
    );
  }

  if (appId === "kakaopay") {
    return (
      <span className={cn(shared, "text-yellow-700")} aria-hidden>
        pay
      </span>
    );
  }

  return (
    <span className={cn(shared, "text-emerald-600")} aria-hidden>
      N
    </span>
  );
}

export function TransferGateway({
  ownerName,
  username,
  account,
}: TransferGatewayProps) {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [pendingBank, setPendingBank] = useState<BankAppScheme | null>(null);
  const [userAgent] = useState(
    () => (typeof navigator !== "undefined" ? navigator.userAgent : ""),
  );
  const toastTimerRef = useRef<number | null>(null);
  const deepLinks = buildDeepLinks(account.bankCode, account.accountNo, userAgent);
  const copyText = getFormattedTransferCopyText(account);
  const majorBankApps = getMajorBankAppSchemes();

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    setToastVisible(true);

    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      window.setTimeout(() => setToastMessage(null), 300);
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      showToast("계좌 정보가 복사되었습니다");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleSelectBank(bankCode: string) {
    const bankApp = getBankAppScheme(bankCode);
    if (!bankApp) {
      return;
    }

    const didCopy = await copyTextToClipboard(copyText);
    if (didCopy) {
      showToast("계좌번호가 복사되었습니다");
    } else {
      showToast("복사에 실패했습니다. 계좌 정보를 직접 확인해 주세요");
    }

    setPendingBank(bankApp);
  }

  function handleConfirmBankTransfer() {
    if (!pendingBank) {
      return;
    }

    const opened = openBankAppWithFallback(pendingBank.bankCode, userAgent);
    if (opened) {
      showToast(`${opened.label} 앱을 여는 중입니다`);
    }

    setPendingBank(null);
  }

  function handleOpenPaymentApp(
    event: React.MouseEvent<HTMLAnchorElement>,
    app: TransferDeepLink,
  ) {
    if (!app.openViaScript) {
      return;
    }

    event.preventDefault();
    tryOpenWithFallback(app.href, app.fallbackHref);
  }

  return (
    <div className={qritBrand.pageBgProfile}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={qritBrand.profileGlowTeal} />
        <div className={qritBrand.profileGlowYellow} />
      </div>

      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-8",
          QRIT_SHOP_BANNER_OFFSET_CLASS,
        )}
      >
        <Link
          href={`/${username}`}
          className={`mb-6 inline-flex items-center ${qritBrand.link}`}
        >
          ← {ownerName} 프로필
        </Link>

        <header className="text-center">
          <p className={qritBrand.accentText}>계좌 송금</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">{ownerName}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            아래 순서대로 진행하면 AQR처럼 빠르게 송금할 수 있습니다
          </p>
        </header>

        <section className={`mt-6 ${qritBrand.transferCard}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            받는 계좌
          </p>
          <p className="mt-2 text-lg font-bold text-zinc-900">{account.bank.name}</p>
          <p className={`mt-1 ${qritBrand.accentTextLg}`}>
            {formatAccountNo(account.accountNo)}
          </p>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className={cn(
              "mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
              copied
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-[#0d5c63] to-[#147278] text-white hover:from-[#094347] hover:to-[#0d5c63]",
            )}
          >
            {copied ? "복사 완료!" : "계좌번호 복사하기"}
          </button>
        </section>

        <section className="mt-5 rounded-xl border border-[#d4e8ea]/70 bg-white/80 p-4">
          <p className="text-sm font-semibold text-[#0d5c63]">송금 방법</p>
          <ol className="mt-3 space-y-2">
            {TRANSFER_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex gap-2 text-xs leading-relaxed text-zinc-600"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e8f4f5] text-[11px] font-bold text-[#0d5c63]">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 flex flex-1 flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-700">빠른 송금 (페이 앱)</p>

          {deepLinks.map((app) => (
            <a
              key={app.id}
              href={app.href}
              onClick={(event) => handleOpenPaymentApp(event, app)}
              className={cn(
                "group flex items-center gap-4 rounded-xl border px-4 py-3.5 shadow-sm transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
                app.accentClass,
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <TransferAppIcon appId={app.id} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-zinc-800">
                  {app.label}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {app.description}
                </span>
              </span>
              <span className="text-zinc-400 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
          ))}

          <div className={qritBrand.bankPicker}>
            <p className={qritBrand.bankPickerTitle}>내 은행 앱 선택</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              은행을 선택하면 계좌번호가 복사되고, 확인 후 해당 은행 앱으로
              이동합니다.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {majorBankApps.map((bankApp) => (
                <button
                  key={bankApp.bankCode}
                  type="button"
                  onClick={() => void handleSelectBank(bankApp.bankCode)}
                  className={cn(
                    qritBrand.bankChip,
                    bankApp.bankCode === account.bankCode && qritBrand.bankChipActive,
                  )}
                >
                  {bankApp.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-2 text-center text-xs leading-relaxed text-zinc-400">
            실제 송금은 토스·페이·은행 앱에서 완료됩니다. 브라우저 안에서
            돈이 이동하지는 않습니다.
          </p>
        </section>

        <footer className="mt-10 pb-2 text-center">
          <p className="text-xs font-medium tracking-wide text-zinc-400">
            Powered by QRit Jewelry
          </p>
        </footer>
      </div>

      {pendingBank ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-confirm-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <p
              id="transfer-confirm-title"
              className="text-lg font-bold text-zinc-900"
            >
              송금 확인
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              아래 계좌로 {pendingBank.label} 앱에서 송금하시겠습니까?
            </p>

            <div className="mt-4 rounded-xl border border-[#d4e8ea]/80 bg-[#e8f4f5]/40 p-4">
              <p className="text-xs font-semibold text-zinc-400">받는 분</p>
              <p className="mt-1 text-base font-bold text-zinc-900">
                {ownerName}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#0d5c63]">
                {account.bank.name}
              </p>
              <p className="mt-0.5 text-lg font-bold tracking-wide text-zinc-800">
                {formatAccountNo(account.accountNo)}
              </p>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              계좌번호가 클립보드에 복사되었습니다. {pendingBank.label} 앱
              송금 화면에서 붙여넣기 하세요.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setPendingBank(null)}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmBankTransfer}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#0d5c63] to-[#147278] px-4 py-3 text-sm font-semibold text-white transition-colors hover:from-[#094347] hover:to-[#0d5c63]"
              >
                송금하기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toastMessage ? (
        <Toast message={toastMessage} visible={toastVisible} />
      ) : null}

      <QritShopBanner />
    </div>
  );
}
