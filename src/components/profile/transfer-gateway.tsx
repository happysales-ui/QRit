"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Toast } from "@/components/ui/toast";
import {
  buildDeepLinks,
  formatAccountNo,
  getFormattedTransferCopyText,
  getMajorBankAppSchemes,
  isAndroidUserAgent,
  launchOtherBankTransfer,
  tryOpenCustomScheme,
  buildAndroidBankAppIntent,
  type TransferAccount,
} from "@/lib/transfer-gateway";
import {
  QritShopBanner,
  QRIT_SHOP_BANNER_OFFSET_CLASS,
} from "@/components/profile/qrit-shop-banner";
import { cn } from "@/lib/utils";

interface TransferGatewayProps {
  ownerName: string;
  username: string;
  account: TransferAccount;
}

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
  const [showBankPicker, setShowBankPicker] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const deepLinks = buildDeepLinks(account.bankCode, account.accountNo);
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

  async function handleOtherBankTransfer() {
    const result = await launchOtherBankTransfer(account);

    if (result.copied) {
      showToast("계좌 정보가 복사되었습니다. 은행 앱에서 붙여넣기 하세요");
    } else {
      showToast("복사에 실패했습니다. 계좌 정보를 직접 확인해 주세요");
    }

    setShowBankPicker(true);
  }

  function handleOpenBankApp(bankCode: string) {
    const scheme = majorBankApps.find((entry) => entry.bankCode === bankCode);
    if (!scheme) {
      return;
    }

    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const url = isAndroidUserAgent(userAgent)
      ? buildAndroidBankAppIntent(scheme)
      : scheme.scheme;

    tryOpenCustomScheme(url);
    showToast(`${scheme.label} 앱을 여는 중입니다`);
  }

  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-violet-100/80 via-violet-50/40 to-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-56 translate-x-1/4 translate-y-1/4 rounded-full bg-fuchsia-200/25 blur-3xl" />
      </div>

      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-8",
          QRIT_SHOP_BANNER_OFFSET_CLASS,
        )}
      >
        <Link
          href={`/${username}`}
          className="mb-6 inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← {ownerName} 프로필
        </Link>

        <header className="text-center">
          <p className="text-sm font-medium text-violet-600">계좌 송금</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">{ownerName}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            아래 계좌로 송금하거나 원하는 앱을 선택하세요
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-violet-200/80 bg-white/95 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            받는 계좌
          </p>
          <p className="mt-2 text-lg font-bold text-zinc-900">{account.bank.name}</p>
          <p className="mt-1 font-mono text-xl tracking-wide text-violet-700">
            {formatAccountNo(account.accountNo)}
          </p>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className={cn(
              "mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
              copied
                ? "bg-emerald-600 text-white"
                : "bg-violet-600 text-white hover:bg-violet-700",
            )}
          >
            {copied ? "복사 완료!" : "복사하기"}
          </button>
        </section>

        <section className="mt-6 flex flex-1 flex-col gap-3">
          <p className="text-sm font-semibold text-zinc-700">앱으로 송금하기</p>

          {deepLinks.map((app) => (
            <a
              key={app.id}
              href={app.href}
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

          <button
            type="button"
            onClick={() => void handleOtherBankTransfer()}
            className={cn(
              "group flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left shadow-sm transition-all duration-200",
              "border-violet-200/80 bg-gradient-to-r from-white to-violet-50/90",
              "hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100/70 active:scale-[0.99]",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-sm font-bold text-violet-700" aria-hidden>
                ₩
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-zinc-800">
                기타 은행 앱으로 송금
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                내 스마트폰에 설치된 다른 은행 앱을 호출합니다
              </span>
            </span>
            <span className="text-zinc-400 transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>

          {showBankPicker ? (
            <div className="rounded-xl border border-violet-200/70 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold text-violet-700">
                다른 은행 앱 열기
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                계좌 정보는 이미 복사되었습니다. 송금 화면에서 붙여넣기 하세요.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {majorBankApps.map((bankApp) => (
                  <button
                    key={bankApp.bankCode}
                    type="button"
                    onClick={() => handleOpenBankApp(bankApp.bankCode)}
                    className={cn(
                      "rounded-lg border border-violet-100 bg-violet-50/60 px-2 py-2 text-xs font-semibold text-violet-800 transition-colors",
                      bankApp.bankCode === account.bankCode &&
                        "border-violet-300 bg-violet-100 ring-1 ring-violet-200",
                      "hover:border-violet-300 hover:bg-violet-100",
                    )}
                  >
                    {bankApp.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-2 text-center text-xs leading-relaxed text-zinc-400">
            앱이 설치되어 있지 않으면 앱스토어 또는 웹 송금 화면으로 이동할 수
            있습니다. 계좌 정보는 복사 버튼으로 직접 붙여넣을 수도 있습니다.
          </p>
        </section>

        <footer className="mt-10 pb-2 text-center">
          <p className="text-xs font-medium tracking-wide text-zinc-400">
            Powered by QRit Jewelry
          </p>
        </footer>
      </div>

      {toastMessage ? (
        <Toast message={toastMessage} visible={toastVisible} />
      ) : null}

      <QritShopBanner />
    </div>
  );
}
