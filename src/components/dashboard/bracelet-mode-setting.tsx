"use client";

import { useActionState } from "react";
import {
  updateDefaultLinkAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { qritBrand } from "@/lib/qrit-brand-theme";
import type { LinkBlock, Profile } from "@/types";

const initialState: ActionState = {};

const INTEGRATED_OPTION_VALUE = "";

interface BraceletModeSettingProps {
  profile: Profile;
  links: LinkBlock[];
}

export function BraceletModeSetting({ profile, links }: BraceletModeSettingProps) {
  const [state, formAction, isPending] = useActionState(
    updateDefaultLinkAction,
    initialState,
  );

  const activeLinks = links
    .filter((link) => link.is_active && !link.is_hidden)
    .sort((a, b) => a.sort_order - b.sort_order);

  const selectedValue =
    profile.default_link_id &&
    activeLinks.some((link) => link.id === profile.default_link_id)
      ? profile.default_link_id
      : INTEGRATED_OPTION_VALUE;

  return (
    <section className={`mb-8 ${qritBrand.card}`}>
      <h2 className="text-lg font-semibold text-zinc-900">
        QRit 팔찌 작동 모드 설정
      </h2>

      <form
        key={selectedValue}
        action={formAction}
        className="mt-4 space-y-4"
      >
        <div>
          <label
            htmlFor="default_link_id"
            className="block text-sm font-medium text-zinc-700"
          >
            스캔 시 첫 화면
          </label>
          <select
            id="default_link_id"
            name="default_link_id"
            defaultValue={selectedValue}
            className={qritBrand.select}
          >
            <option value={INTEGRATED_OPTION_VALUE}>
              🌐 통합 프로필 화면 (등록한 모든 링크 모음)
            </option>
            {activeLinks.map((link) => (
              <option key={link.id} value={link.id}>
                {link.title}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-[#0d5c63]">
          💡 팔찌를 스캔했을 때 처음으로 보여줄 화면을 선택하세요. 개별 메뉴를
          선택하시면 스캔 시 해당 기능으로 1초 만에 바로 직행합니다.
        </p>

        {state.error ? (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className={qritBrand.primaryButton}
        >
          {isPending ? "저장 중..." : "작동 모드 저장"}
        </button>
      </form>
    </section>
  );
}
