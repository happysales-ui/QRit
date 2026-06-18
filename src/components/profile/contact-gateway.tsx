"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  QritShopBanner,
  QRIT_SHOP_BANNER_OFFSET_CLASS,
} from "@/components/profile/qrit-shop-banner";
import { Toast } from "@/components/ui/toast";
import {
  autoOpenContactDialerOnMobile,
  buildTelHref,
  formatContactTelDisplay,
  saveContactFromMecard,
} from "@/lib/contact-gateway";
import type { MecardContact } from "@/lib/contact-vcf";
import { cn } from "@/lib/utils";

interface ContactGatewayProps {
  ownerName: string;
  username: string;
  contact: MecardContact;
  downloadUrl: string;
}

export function ContactGateway({
  ownerName,
  username,
  contact,
  downloadUrl,
}: ContactGatewayProps) {
  const displayName = contact.name.trim() || ownerName;
  const telHref = buildTelHref(contact.tel);
  const formattedTel = formatContactTelDisplay(contact.tel);
  const [mobileRedirectAttempted, setMobileRedirectAttempted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const autoDialStartedRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  const runAutoDial = useCallback(async () => {
    if (!telHref) {
      return;
    }

    const attempted = await autoOpenContactDialerOnMobile(telHref);
    if (attempted) {
      setMobileRedirectAttempted(true);
    }
  }, [telHref]);

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
    if (autoDialStartedRef.current || !telHref) {
      return;
    }

    autoDialStartedRef.current = true;
    void runAutoDial();
  }, [runAutoDial, telHref]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  async function handleSaveContact() {
    const result = await saveContactFromMecard(contact, { downloadUrl });

    if (result === "ios-download") {
      showToast("연락처 앱에서 열기");
    }
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
          <p className="text-sm font-medium text-violet-600">연락처</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">{displayName}</h1>
          {telHref ? (
            <p className="mt-3 font-mono text-xl tracking-wide text-violet-700">
              {formattedTel}
            </p>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              등록된 전화번호가 없습니다
            </p>
          )}
        </header>

        <section className="mt-8 w-full max-w-sm self-center rounded-2xl border border-violet-200/80 bg-white/95 p-6 text-center shadow-sm">
          {telHref ? (
            <>
              <a
                href={telHref}
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-xl px-4 py-4 text-[16px] font-semibold transition-all duration-200",
                  "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.99]",
                )}
              >
                전화 걸기
              </a>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                {mobileRedirectAttempted
                  ? "전화 앱이 열리지 않으면 위 버튼을 눌러 주세요"
                  : "전화 앱에서 통화 버튼을 누르면 연결됩니다"}
              </p>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => void handleSaveContact()}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-xl border-2 border-violet-600 px-4 py-4 text-[16px] font-semibold transition-all duration-200",
              "bg-white text-violet-700 hover:bg-violet-50 active:scale-[0.99]",
              telHref ? "mt-4" : undefined,
            )}
          >
            번호 저장
          </button>
          <p className="mt-3 text-xs leading-relaxed text-zinc-400">
            연락처 앱에서 저장 창이 열립니다
          </p>
        </section>

        <footer className="mt-10 pb-2 text-center">
          <p className="text-xs font-medium tracking-wide text-zinc-400">
            Powered by QRit Jewelry
          </p>
        </footer>
      </div>

      <QritShopBanner />

      {toastMessage ? (
        <Toast message={toastMessage} visible={toastVisible} />
      ) : null}
    </div>
  );
}
