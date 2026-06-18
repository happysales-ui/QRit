"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  QritShopBanner,
  QRIT_SHOP_BANNER_OFFSET_CLASS,
} from "@/components/profile/qrit-shop-banner";
import {
  attemptContactAutoSave,
  manualContactSave,
} from "@/lib/contact-gateway";
import type { MecardContact } from "@/lib/contact-vcf";
import { cn } from "@/lib/utils";

interface ContactGatewayProps {
  ownerName: string;
  username: string;
  contact: MecardContact;
  mecardUrl: string;
  downloadUrl: string;
}

export function ContactGateway({
  ownerName,
  username,
  contact,
  mecardUrl,
  downloadUrl,
}: ContactGatewayProps) {
  const [showFallback, setShowFallback] = useState(false);
  const autoSaveStartedRef = useRef(false);

  const runAutoSave = useCallback(async () => {
    await attemptContactAutoSave({ contact, mecardUrl, downloadUrl });
    window.setTimeout(() => setShowFallback(true), 800);
  }, [contact, downloadUrl, mecardUrl]);

  useEffect(() => {
    if (autoSaveStartedRef.current) {
      return;
    }

    autoSaveStartedRef.current = true;
    void runAutoSave();
  }, [runAutoSave]);

  function handleManualSave() {
    manualContactSave({ contact, mecardUrl, downloadUrl });
  }

  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-violet-100/80 via-violet-50/40 to-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-56 translate-x-1/4 translate-y-1/4 rounded-full bg-fuchsia-200/25 blur-3xl" />
      </div>

      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center px-4 py-8",
          QRIT_SHOP_BANNER_OFFSET_CLASS,
        )}
      >
        <Link
          href={`/${username}`}
          className="absolute left-4 top-8 inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← {ownerName} 프로필
        </Link>

        <div className="w-full max-w-sm rounded-2xl border border-violet-200/80 bg-white/95 p-8 text-center shadow-sm">
          <div
            className="mx-auto size-12 animate-pulse rounded-full bg-violet-100"
            aria-hidden
          />

          <p className="mt-6 text-lg font-semibold text-zinc-900">
            연락처 저장 중...
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {contact.name || ownerName}님의 연락처를 저장하고 있습니다
          </p>

          {showFallback ? (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleManualSave}
                className={cn(
                  "w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-all duration-200",
                  "bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.99]",
                )}
              >
                연락처에 저장
              </button>
              <p className="text-xs leading-relaxed text-zinc-400">
                저장 창이 열리지 않으면 위 버튼을 눌러 주세요
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <QritShopBanner />
    </div>
  );
}
