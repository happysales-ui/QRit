"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveDashboardSettingsAction,
  type ActionState,
} from "@/app/dashboard/actions";
import {
  BraceletModeSetting,
  INTEGRATED_OPTION_VALUE,
} from "@/components/dashboard/bracelet-mode-setting";
import { LinksManager } from "@/components/dashboard/links-manager";
import {
  ProfileForm,
  type ProfileDraft,
} from "@/components/dashboard/profile-form";
import { linkDashboardTheme } from "@/lib/link-dashboard-theme";
import { getProfileHubHref } from "@/lib/profile-hub";
import { qritBrand } from "@/lib/qrit-brand-theme";
import type { LinkBlock, Profile } from "@/types";
import { cn } from "@/lib/utils";

type DashboardDraft = ProfileDraft & {
  defaultLinkId: string;
};

function resolveDefaultLinkId(profile: Profile, links: LinkBlock[]): string {
  if (
    profile.default_link_id &&
    links.some(
      (link) =>
        link.id === profile.default_link_id &&
        link.is_active &&
        !link.is_hidden,
    )
  ) {
    return profile.default_link_id;
  }
  return INTEGRATED_OPTION_VALUE;
}

function buildDraft(profile: Profile, links: LinkBlock[]): DashboardDraft {
  return {
    username: profile.username,
    displayName: profile.display_name ?? "",
    bio: profile.bio ?? "",
    defaultLinkId: resolveDefaultLinkId(profile, links),
  };
}

function draftsEqual(a: DashboardDraft, b: DashboardDraft): boolean {
  return (
    a.username === b.username &&
    a.displayName === b.displayName &&
    a.bio === b.bio &&
    a.defaultLinkId === b.defaultLinkId
  );
}

interface DashboardClientProps {
  profile: Profile;
  links: LinkBlock[];
  publicUrl: string;
}

export function DashboardClient({
  profile,
  links,
  publicUrl,
}: DashboardClientProps) {
  const router = useRouter();
  const serverDraft = useMemo(() => buildDraft(profile, links), [profile, links]);
  const [editedDraft, setEditedDraft] = useState<DashboardDraft | null>(null);
  const [saveState, setSaveState] = useState<ActionState>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [isSaving, startSave] = useTransition();

  const draft = editedDraft ?? serverDraft;
  const isDirty =
    editedDraft !== null && !draftsEqual(editedDraft, serverDraft);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleProfileDraftChange = useCallback(
    (patch: Partial<ProfileDraft>) => {
      setEditedDraft((current) => ({ ...(current ?? serverDraft), ...patch }));
    },
    [serverDraft],
  );

  const handleDefaultLinkIdChange = useCallback(
    (defaultLinkId: string) => {
      setEditedDraft((current) =>
        current ? { ...current, defaultLinkId } : { ...serverDraft, defaultLinkId },
      );
    },
    [serverDraft],
  );

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2500);
    }
  }

  function handleSave() {
    const formData = new FormData();
    formData.set("username", draft.username);
    formData.set("display_name", draft.displayName);
    formData.set("bio", draft.bio);
    formData.set("default_link_id", draft.defaultLinkId);

    startSave(async () => {
      const result = await saveDashboardSettingsAction({}, formData);
      setSaveState(result);

      if (!result.error) {
        setEditedDraft(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      <section className={`mb-8 ${qritBrand.card}`}>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">프로필 설정</h2>
        <ProfileForm
          profile={profile}
          draft={draft}
          onDraftChange={handleProfileDraftChange}
        />
      </section>

      <section className={cn(linkDashboardTheme.section, "mb-8")}>
        <h2 className={`mb-5 ${linkDashboardTheme.sectionTitle}`}>링크 관리</h2>
        <LinksManager links={links} />
        <p className="mt-4 text-xs text-zinc-400">
          링크 수정·순서 변경·삭제는 각 항목에서 즉시 저장됩니다. 새 링크 추가도
          바로 반영됩니다.
        </p>
      </section>

      <section className={`mb-8 ${qritBrand.card}`}>
        <h2 className="text-lg font-semibold text-zinc-900">공개 프로필 주소</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="min-w-0 flex-1 break-all text-sm text-zinc-600">
            {publicUrl}
          </p>
          <button
            type="button"
            onClick={() => void handleCopyUrl()}
            className="shrink-0 rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {copyState === "copied"
              ? "복사됨"
              : copyState === "error"
                ? "복사 실패"
                : "주소 복사"}
          </button>
        </div>
        <Link
          href={
            profile.default_link_id
              ? getProfileHubHref(profile.username)
              : `/${profile.username}`
          }
          target="_blank"
          className={`mt-3 inline-block ${qritBrand.link}`}
        >
          프로필 미리보기 →
        </Link>
      </section>

      <section className={`mb-8 ${qritBrand.card}`}>
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={advancedOpen}
        >
          <h2 className="text-lg font-semibold text-zinc-900">고급 설정</h2>
          <span className="text-sm text-zinc-500" aria-hidden>
            {advancedOpen ? "접기 ▲" : "펼치기 ▼"}
          </span>
        </button>

        {advancedOpen ? (
          <div className="mt-4 border-t border-zinc-100 pt-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-700">
              QR 스캔 화면 설정
            </h3>
            <BraceletModeSetting
              links={links}
              defaultLinkId={draft.defaultLinkId}
              onDefaultLinkIdChange={handleDefaultLinkIdChange}
            />
          </div>
        ) : null}
      </section>

      <div
        className={cn(
          "sticky bottom-0 z-10 -mx-4 border-t border-[#d4e8ea] bg-white/95 px-4 py-4 backdrop-blur",
          !isDirty && !saveState.error && !saveState.success && "border-transparent bg-transparent backdrop-blur-none",
        )}
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            {isDirty ? (
              <p className="text-sm font-medium text-amber-700">
                저장되지 않은 변경사항이 있습니다
              </p>
            ) : saveState.success ? (
              <p className="text-sm text-emerald-700">{saveState.success}</p>
            ) : null}

            {saveState.error ? (
              <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                {saveState.error}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={cn(qritBrand.primaryButton, "shrink-0 sm:min-w-[7.5rem]")}
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </>
  );
}
