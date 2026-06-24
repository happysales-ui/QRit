"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addLinkAction,
  deleteLinkAction,
  hideLinkAction,
  moveLinkAction,
  unhideLinkAction,
  updateLinkAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { LinkTypeIcon } from "@/components/dashboard/link-type-icon";
import {
  INVALID_ACCOUNT_NO_MESSAGE,
  KOREAN_BANKS,
  MAX_ACCOUNT_NO_LENGTH,
  MIN_ACCOUNT_NO_LENGTH,
  parseTransferUrl,
} from "@/lib/bank-transfer";
import { formatContactLinkSummary } from "@/lib/contact-link";
import { buildMecardUrl, parseContactFieldsFromUrl } from "@/lib/contact-vcf";
import { linkDashboardTheme as theme } from "@/lib/link-dashboard-theme";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { LinkQrCode } from "@/components/qr/link-qr-code";
import {
  BANK_TRANSFER_LINK_TITLE,
  CONTACT_LINK_TITLE,
  CUSTOM_LINK_TITLE,
  getInitialLinkUrl,
  getLinkUrlPlaceholder,
  LINK_TITLE_PRESETS,
  resolveLinkTitle,
  resolveTransferDisplayTitle,
  resolveUrlOnPresetChange,
  type LinkTitlePreset,
} from "@/lib/link-presets";
import {
  formatTransferLinkSummary,
  getTransferLinkFullUrl,
  inferTransferLinkFormState,
  isTransferLink,
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
  const inferred = inferTransferLinkFormState({
    title: initialTitle ?? "",
    url: initialUrl ?? "",
    bank_code: initialBankCode ?? null,
    account_no: initialAccountNo ?? null,
  });
  const initialPreset = initialTitle ? inferred.preset : CONTACT_LINK_TITLE;
  const parsedTransfer =
    initialPreset === BANK_TRANSFER_LINK_TITLE
      ? initialBankCode && initialAccountNo
        ? { bankCode: initialBankCode, accountNo: initialAccountNo }
        : initialUrl
          ? parseTransferUrl(initialUrl)
          : null
      : null;
  const parsedContact =
    initialPreset === CONTACT_LINK_TITLE && initialUrl
      ? parseContactFieldsFromUrl(initialUrl)
      : { name: "", tel: "" };
  const [titlePreset, setTitlePreset] = useState<LinkTitlePreset>(initialPreset);
  const [customTitle, setCustomTitle] = useState(
    initialPreset === CUSTOM_LINK_TITLE ? inferred.transferAlias : "",
  );
  const [transferAlias, setTransferAlias] = useState(
    initialPreset === BANK_TRANSFER_LINK_TITLE ? inferred.transferAlias : "",
  );
  const [url, setUrl] = useState(() =>
    getInitialLinkUrl(initialPreset, initialUrl),
  );
  const [contactName, setContactName] = useState(parsedContact.name);
  const [contactTel, setContactTel] = useState(parsedContact.tel);
  const [bankCode, setBankCode] = useState(parsedTransfer?.bankCode ?? "");
  const [accountNo, setAccountNo] = useState(parsedTransfer?.accountNo ?? "");

  const isCustom = titlePreset === CUSTOM_LINK_TITLE;
  const isContact = titlePreset === CONTACT_LINK_TITLE;
  const isBankTransfer = titlePreset === BANK_TRANSFER_LINK_TITLE;
  const resolvedTitle = isBankTransfer
    ? resolveTransferDisplayTitle(transferAlias)
    : resolveLinkTitle(titlePreset, customTitle);
  const inputClassName = theme.input;

  function handlePresetChange(nextPreset: LinkTitlePreset) {
    setUrl((currentUrl) =>
      resolveUrlOnPresetChange(titlePreset, nextPreset, currentUrl),
    );
    if (nextPreset === CONTACT_LINK_TITLE) {
      setContactName("");
      setContactTel("");
    } else if (titlePreset === CONTACT_LINK_TITLE) {
      setContactName("");
      setContactTel("");
    }
    if (nextPreset === BANK_TRANSFER_LINK_TITLE) {
      setBankCode("");
      setAccountNo("");
      setTransferAlias("");
    } else if (titlePreset === BANK_TRANSFER_LINK_TITLE) {
      setBankCode("");
      setAccountNo("");
      setTransferAlias("");
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
          <FieldCard
            label="표시 이름 (선택)"
            htmlFor={`link-transfer-alias-${variant}`}
          >
            <input
              id={`link-transfer-alias-${variant}`}
              type="text"
              value={transferAlias}
              onChange={(event) => setTransferAlias(event.target.value)}
              placeholder='예: 사업용, 개인 (비우면 "계좌 송금")'
              className={theme.input}
            />
          </FieldCard>

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
              placeholder={`계좌번호 (${MIN_ACCOUNT_NO_LENGTH}~${MAX_ACCOUNT_NO_LENGTH}자리 숫자)`}
              pattern="[\d\s-]+"
              minLength={MIN_ACCOUNT_NO_LENGTH}
              maxLength={MAX_ACCOUNT_NO_LENGTH + 4}
              title={INVALID_ACCOUNT_NO_MESSAGE}
              className={theme.input}
            />
          </FieldCard>

          <input type="hidden" name="url" value={TRANSFER_URL_MARKER} />

          <p className={theme.hint}>
            <span className={theme.hintIcon} aria-hidden>
              💡
            </span>
            <span>
              은행과 계좌번호를 입력하면 스캔 시 토스, 카카오페이, 네이버페이 등
              원하는 앱으로 송금할 수 있습니다.
            </span>
          </p>
        </>
      ) : isContact ? (
        <>
          <p className="text-sm font-semibold text-[#0d5c63]">연락처 정보 입력</p>
          <p className={theme.hint}>
            <span className={theme.hintIcon} aria-hidden>
              💡
            </span>
            <span>예: 이름 홍길동, 연락처 010-1234-5678</span>
          </p>

          <FieldCard label="이름" htmlFor={`link-contact-name-${variant}`}>
            <input
              id={`link-contact-name-${variant}`}
              name="contact_name"
              type="text"
              required
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              placeholder="표시할 이름을 입력하세요"
              className={theme.input}
            />
          </FieldCard>

          <FieldCard label="연락처" htmlFor={`link-contact-tel-${variant}`}>
            <input
              id={`link-contact-tel-${variant}`}
              name="contact_tel"
              type="tel"
              inputMode="tel"
              required
              value={contactTel}
              onChange={(event) => setContactTel(event.target.value)}
              placeholder="01012345678"
              className={theme.input}
            />
          </FieldCard>

          <input
            type="hidden"
            name="url"
            value={buildMecardUrl(contactName, contactTel)}
          />

          <p className={theme.hint}>
            <span className={theme.hintIcon} aria-hidden>
              💡
            </span>
            <span>
              스캔 시 전화 걸기·연락처 저장 화면으로 연결됩니다.
            </span>
          </p>
        </>
      ) : (
        <FieldCard
          label="링크 URL"
          htmlFor={`link-url-${variant}`}
        >
          <input
            id={`link-url-${variant}`}
            name="url"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={getLinkUrlPlaceholder(titlePreset)}
            className={inputClassName}
          />
        </FieldCard>
      )}
    </div>
  );
}

function TransferLinkSharePanel({
  link,
  username,
  siteUrl,
}: {
  link: LinkBlock;
  username: string;
  siteUrl: string;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const transferUrl = getTransferLinkFullUrl(siteUrl, username, link.id);

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(transferUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2500);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-[#d4e8ea] bg-[#f0f7f8] p-3">
      <p className="text-xs font-medium text-[#3d7a80]">송금 링크 주소</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 break-all text-sm text-[#0d5c63]">
          {transferUrl}
        </p>
        <button
          type="button"
          onClick={() => void handleCopyUrl()}
          className={theme.secondaryButton}
        >
          {copyState === "copied"
            ? "복사됨"
            : copyState === "error"
              ? "복사 실패"
              : "주소 복사"}
        </button>
      </div>

      <p className="mt-3 text-xs font-medium text-[#3d7a80]">QR 코드</p>
      <LinkQrCode
        className="mt-2"
        value={transferUrl}
        qrId={`transfer-qr-${link.id}`}
        downloadFileName={`transfer-${username}-${link.id.slice(0, 8)}`}
      />
    </div>
  );
}

function LinkItem({
  link,
  index,
  total,
  username,
  siteUrl,
}: {
  link: LinkBlock;
  index: number;
  total: number;
  username: string;
  siteUrl: string;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string>();
  const [deleteState, deleteAction, isDeleting] = useActionState(
    async () => deleteLinkAction(link.id),
    initialState,
  );
  const [movePending, startMove] = useTransition();
  const [visibilityPending, startVisibilityToggle] = useTransition();

  function handleVisibilityToggle() {
    setVisibilityError(undefined);
    startVisibilityToggle(async () => {
      const result = link.is_hidden
        ? await unhideLinkAction(link.id)
        : await hideLinkAction(link.id);

      if (result.error) {
        setVisibilityError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <li className={cn(link.is_hidden ? theme.linkCardHidden : theme.linkCard)}>
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
            <div className="flex min-w-0 items-center gap-2">
              <p
                className={cn(
                  theme.linkTitle,
                  link.is_hidden && "text-[#94a89e]",
                )}
              >
                {link.title}
              </p>
              {link.is_hidden ? (
                <span className={theme.hiddenBadge}>숨김</span>
              ) : null}
            </div>
            <p
              className={cn(
                theme.linkSubtitle,
                link.is_hidden && "text-[#b0c4c8]",
              )}
            >
              {formatContactLinkSummary(link) ??
                formatTransferLinkSummary(link)}
            </p>
            {deleteState.error ? (
              <p className="mt-2 text-sm text-red-600">{deleteState.error}</p>
            ) : null}
            {visibilityError ? (
              <p className="mt-2 text-sm text-red-600">{visibilityError}</p>
            ) : null}
            {isTransferLink(link) ? (
              <TransferLinkSharePanel
                link={link}
                username={username}
                siteUrl={siteUrl}
              />
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
              disabled={visibilityPending}
              onClick={handleVisibilityToggle}
              className={cn(theme.hideButton, "disabled:opacity-60")}
            >
              {link.is_hidden ? "보이기" : "감추기"}
            </button>

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
  const router = useRouter();
  const [visibilityError, setVisibilityError] = useState<string>();
  const [visibilityPending, startVisibilityToggle] = useTransition();
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

  function handleVisibilityToggle() {
    setVisibilityError(undefined);
    startVisibilityToggle(async () => {
      const result = link.is_hidden
        ? await unhideLinkAction(link.id)
        : await hideLinkAction(link.id);

      if (result.error) {
        setVisibilityError(result.error);
        return;
      }

      router.refresh();
      onSuccess();
    });
  }

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
      {visibilityError ? (
        <p className="text-sm text-red-600">{visibilityError}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
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
        <button
          type="button"
          disabled={visibilityPending}
          onClick={handleVisibilityToggle}
          className={cn(theme.hideButton, "disabled:opacity-60")}
        >
          {link.is_hidden ? "보이기" : "감추기"}
        </button>
      </div>
    </form>
  );
}

export function LinksManager({ links, username, siteUrl }: LinksManagerProps) {
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
        <h3 className="text-base font-semibold text-[#0d5c63]">새 링크 추가</h3>
        <LinkFormFields key={addFormKey} variant="add" />

        {addState.error ? (
          <p className="text-sm text-red-600">{addState.error}</p>
        ) : null}

        {addState.success ? (
          <p className="text-sm text-[#3d7a80]">{addState.success}</p>
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
                username={username}
                siteUrl={siteUrl}
              />
            ))}
          </ul>
        )}
      </div>

      <footer className={theme.footer}>
        <p className={theme.footerPrimary}>
          QRit 구매고객 전용 서비스입니다.
        </p>
        <LegalFooterLinks className="mt-3" />
        <p className={theme.footerSecondary}>
          © QRit Jewelry. 무단 복제 및 배포를 금합니다.
        </p>
      </footer>
    </div>
  );
}

interface LinksManagerProps {
  links: LinkBlock[];
  username: string;
  siteUrl: string;
}
