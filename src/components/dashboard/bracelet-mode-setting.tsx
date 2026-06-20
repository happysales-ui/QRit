"use client";

import { qritBrand } from "@/lib/qrit-brand-theme";
import type { LinkBlock } from "@/types";

export const INTEGRATED_OPTION_VALUE = "";

interface BraceletModeSettingProps {
  links: LinkBlock[];
  defaultLinkId: string;
  onDefaultLinkIdChange: (value: string) => void;
}

export function BraceletModeSetting({
  links,
  defaultLinkId,
  onDefaultLinkIdChange,
}: BraceletModeSettingProps) {
  const activeLinks = links
    .filter((link) => link.is_active && !link.is_hidden)
    .sort((a, b) => a.sort_order - b.sort_order);

  const selectedValue =
    defaultLinkId && activeLinks.some((link) => link.id === defaultLinkId)
      ? defaultLinkId
      : INTEGRATED_OPTION_VALUE;

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="default_link_id"
          className="block text-sm font-medium text-zinc-700"
        >
          QR 스캔 시 첫 화면
        </label>
        <select
          id="default_link_id"
          name="default_link_id"
          value={selectedValue}
          onChange={(event) => onDefaultLinkIdChange(event.target.value)}
          className={qritBrand.select}
        >
          <option value={INTEGRATED_OPTION_VALUE}>
            통합 프로필 (등록한 모든 링크 모음)
          </option>
          {activeLinks.map((link) => (
            <option key={link.id} value={link.id}>
              {link.title}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-[#0d5c63]">
        QRit을 스캔했을 때 처음으로 보여줄 화면을 선택하세요. 특정 링크를
        선택하면 해당 화면으로 바로 이동합니다.
      </p>
    </div>
  );
}
