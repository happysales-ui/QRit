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
import { getProfileHubHref } from "@/lib/profile-hub";
import { qritBrand } from "@/lib/qrit-brand-theme";
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
          href={getProfileHubHref(username)}
          className={`mb-6 inline-flex items-center ${qritBrand.link}`}
        >
          ← {ownerName} 프로필
        </Link>

        <header className="text-center">
          <p className={qritBrand.accentText}>연락처</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">{displayName}</h1>
          {telHref ? (
            <p className={`mt-3 ${qritBrand.accentTextLg}`}>{formattedTel}</p>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              등록된 전화번호가 없습니다
            </p>
          )}
        </header>

        <section className={`mt-8 w-full max-w-sm self-center ${qritBrand.cardLg} text-center`}>
          {telHref ? (
            <>
              <a href={telHref} className={qritBrand.primaryButtonLg}>
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
            className={cn(qritBrand.secondaryButton, telHref ? "mt-4" : undefined)}
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
