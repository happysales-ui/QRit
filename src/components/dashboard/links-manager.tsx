"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addLinkAction,
  deleteLinkAction,
  moveLinkAction,
  updateLinkAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { LinkTypeIcon } from "@/components/dashboard/link-type-icon";
import {
  KOREAN_BANKS,
  parseTransferUrl,
} from "@/lib/bank-transfer";
import { linkDashboardTheme as theme } from "@/lib/link-dashboard-theme";
import {
  BANK_TRANSFER_LINK_TITLE,
  CONTACT_LINK_TITLE,
  CUSTOM_LINK_TITLE,
  getInitialLinkUrl,
  getLinkUrlPlaceholder,
  inferPresetFromTitle,
  LINK_TITLE_PRESETS,
  resolveLinkTitle,
  resolveUrlOnPresetChange,
  type LinkTitlePreset,
} from "@/lib/link-presets";
import {
  formatTransferLinkSummary,
  TRANSFER_URL_MARKER,
} from "@/lib/transfer-link";
import type { LinkBlock } from "@/types";
import { cn } from "@/lib/utils";

const initialState: ActionState = {};

function FieldCard({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(theme.ivoryCard, className)}>
      <label htmlFor={htmlFor} className={theme.fieldLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}

function LinkFormFields({
  initialTitle,
  initialUrl,
  initialBankCode,
  initialAccountNo,
  variant = "add",
}: {
  initialTitle?: string;
  initialUrl?: string;
  initialBankCode?: string | null;
  initialAccountNo?: string | null;
  variant?: "add" | "edit";
}) {
  const inferred = inferPresetFromTitle(initialTitle ?? "");
  const initialPreset = initialTitle ? inferred.preset : CONTACT_LINK_TITLE;
  const parsedTransfer =
    initialPreset === BANK_TRANSFER_LINK_TITLE
      ? initialBankCode && initialAccountNo
        ? { bankCode: initialBankCode, accountNo: initialAccountNo }
        : initialUrl
          ? parseTransferUrl(initialUrl)
          : null
      : null;
  const [titlePreset, setTitlePreset] = useState<LinkTitlePreset>(initialPreset);
  const [customTitle, setCustomTitle] = useState(inferred.customTitle);
  const [url, setUrl] = useState(() =>
    getInitialLinkUrl(initialPreset, initialUrl),
  );
  const [bankCode, setBankCode] = useState(parsedTransfer?.bankCode ?? "");
  const [accountNo, setAccountNo] = useState(parsedTransfer?.accountNo ?? "");

  const resolvedTitle = resolveLinkTitle(titlePreset, customTitle);
  const isCustom = titlePreset === CUSTOM_LINK_TITLE;
  const isContact = titlePreset === CONTACT_LINK_TITLE;
  const isBankTransfer = titlePreset === BANK_TRANSFER_LINK_TITLE;
  const inputClassName = isContact ? theme.mecardInput : theme.input;

  function handlePresetChange(nextPreset: LinkTitlePreset) {
    setUrl((currentUrl) =>
      resolveUrlOnPresetChange(titlePreset, nextPreset, currentUrl),
    );
    if (nextPreset === BANK_TRANSFER_LINK_TITLE) {
      setBankCode("");
      setAccountNo("");
    } else if (titlePreset === BANK_TRANSFER_LINK_TITLE) {
      setBankCode("");
      setAccountNo("");
    }
    setTitlePreset(nextPreset);
  }

  return (
    <div className="space-y-3">
      <FieldCard label="링크 제목" htmlFor={`link-title-preset-${variant}`}>
        <select
          id={`link-title-preset-${variant}`}
          value={titlePreset}
          onChange={(event) =>
            handlePresetChange(event.target.value as LinkTitlePreset)
          }
          className={theme.input}
        >
          {LINK_TITLE_PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>
      </FieldCard>

      {isCustom ? (
        <FieldCard label="직접 입력 제목" htmlFor={`link-custom-title-${variant}`}>
          <input
            id={`link-custom-title-${variant}`}
            type="text"
            required
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="링크 제목을 입력하세요"
            className={theme.input}
          />
        </FieldCard>
      ) : null}

      <input type="hidden" name="title" value={resolvedTitle} />

      {isBankTransfer ? (
        <>
          <FieldCard label="은행 선택" htmlFor={`link-bank-${variant}`}>
            <select
              id={`link-bank-${variant}`}
              name="bank_code"
              required
              value={bankCode}
              onChange={(event) => setBankCode(event.target.value)}
              className={theme.input}
            >
              <option value="">은행을 선택하세요</option>
              {KOREAN_BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </FieldCard>

          <FieldCard label="계좌번호" htmlFor={`link-account-${variant}`}>
            <input
              id={`link-account-${variant}`}
              name="account_no"
              type="text"
              inputMode="numeric"
              required
              value={accountNo}
              onChange={(event) => setAccountNo(event.target.value)}
              placeholder="계좌번호를 입력하세요 (숫자만)"
              className={theme.input}
            />
          </FieldCard>

          <input type="hidden" name="url" value={TRANSFER_URL_MARKER} />

          <p className={theme.hint}>
            <span className={theme.hintIcon} aria-hidden>
              💡
            </span>
            <span>
              은행과 계좌번호를 입력하시면 스캔 시 송금 게이트웨이에서 토스,
              카카오페이, 네이버페이 등 원하는 앱으로 송금할 수 있습니다.
            </span>
          </p>
        </>
      ) : (
        <FieldCard
          label={isContact ? "연락처 (MECARD)" : "링크 URL"}
          htmlFor={`link-url-${variant}`}
        >
          <input
            id={`link-url-${variant}`}
            name="url"
            type={isContact ? "text" : "url"}
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={getLinkUrlPlaceholder(titlePreset)}
            className={inputClassName}
          />
          {isContact ? (
            <p className={theme.hint}>
              <span className={theme.hintIcon} aria-hidden>
                💡
              </span>
              <span>위 입력창에서 이름과 연락처만 수정해서 등록하세요.</span>
            </p>
          ) : null}
        </FieldCard>
      )}
    </div>
  );
}

function LinkItem({ link, index, total }: { link: LinkBlock; index: number; total: number }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteState, deleteAction, isDeleting] = useActionState(
    async () => deleteLinkAction(link.id),
    initialState,
  );
  const [movePending, startMove] = useTransition();

  return (
    <li className={theme.linkCard}>
      {isEditing ? (
        <EditLinkForm
          link={link}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex items-center gap-3 sm:gap-4">
          <LinkTypeIcon link={link} />

          <div className="min-w-0 flex-1">
            <p className={theme.linkTitle}>{link.title}</p>
            <p className={theme.linkSubtitle}>{formatTransferLinkSummary(link)}</p>
            {deleteState.error ? (
              <p className="mt-2 text-sm text-red-600">{deleteState.error}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                disabled={index === 0 || movePending}
                onClick={() =>
                  startMove(() => {
                    void moveLinkAction(link.id, "up").then(() => router.refresh());
                  })
                }
                className={theme.reorderButton}
                aria-label="위로 이동"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === total - 1 || movePending}
                onClick={() =>
                  startMove(() => {
                    void moveLinkAction(link.id, "down").then(() => router.refresh());
                  })
                }
                className={theme.reorderButton}
                aria-label="아래로 이동"
              >
                ↓
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={theme.secondaryButton}
            >
              수정
            </button>
            <form action={deleteAction}>
              <button
                type="submit"
                disabled={isDeleting}
                className={cn(theme.dangerButton, "disabled:opacity-60")}
              >
                삭제
              </button>
            </form>
          </div>
        </div>
      )}
    </li>
  );
}

function EditLinkForm({
  link,
  onCancel,
  onSuccess,
}: {
  link: LinkBlock;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionState, formData: FormData) => {
      const result = await updateLinkAction(link.id, formData);
      if (!result.error) {
        onSuccess();
      }
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <LinkFormFields
        initialTitle={link.title}
        initialUrl={link.url}
        initialBankCode={link.bank_code}
        initialAccountNo={link.account_no}
        variant="edit"
      />

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={cn(theme.primaryButton, "px-4 py-2 text-xs disabled:opacity-60")}
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={theme.secondaryButton}
        >
          취소
        </button>
      </div>
    </form>
  );
}

export function LinksManager({ links }: LinksManagerProps) {
  const [addFormKey, setAddFormKey] = useState(0);
  const [addState, addAction, isAdding] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await addLinkAction(prev, formData);
      if (result.success) {
        setAddFormKey((key) => key + 1);
      }
      return result;
    },
    initialState,
  );

  return (
    <div>
      <form action={addAction} className="space-y-4">
        <h3 className="text-base font-semibold text-[#1b4332]">새 링크 추가</h3>
        <LinkFormFields key={addFormKey} variant="add" />

        {addState.error ? (
          <p className="text-sm text-red-600">{addState.error}</p>
        ) : null}

        {addState.success ? (
          <p className="text-sm text-[#2d6a4f]">{addState.success}</p>
        ) : null}

        <button type="submit" disabled={isAdding} className={theme.primaryButton}>
          {isAdding ? "추가 중..." : "링크 추가"}
        </button>
      </form>

      <div className="mt-8">
        {links.length === 0 ? (
          <p className={theme.emptyState}>아직 등록된 링크가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {links.map((link, index) => (
              <LinkItem
                key={link.id}
                link={link}
                index={index}
                total={links.length}
              />
            ))}
          </ul>
        )}
      </div>

      <footer className={theme.footer}>
        <p className={theme.footerPrimary}>
          QRit 웹 시제품은 누구나 무료로 이용할 수 있습니다.
        </p>
        <p className={theme.footerSecondary}>
          © QRit Jewelry. 본 서비스는 시제품 버전이며, 무단 복제 및 배포를 금합니다.
        </p>
      </footer>
    </div>
  );
}

interface LinksManagerProps {
  links: LinkBlock[];
}
