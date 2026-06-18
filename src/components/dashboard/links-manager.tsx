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
import {
  KOREAN_BANKS,
  parseTransferUrl,
} from "@/lib/bank-transfer";
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

const inputClassName =
  "w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

const addInputClassName =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

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
  const initialPreset = initialTitle ? inferred.preset : LINK_TITLE_PRESETS[0];
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

  const fieldClassName = variant === "add" ? addInputClassName : inputClassName;
  const resolvedTitle = resolveLinkTitle(titlePreset, customTitle);
  const isCustom = titlePreset === CUSTOM_LINK_TITLE;
  const isContact = titlePreset === CONTACT_LINK_TITLE;
  const isBankTransfer = titlePreset === BANK_TRANSFER_LINK_TITLE;

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
    <>
      <div>
        <label
          htmlFor={`link-title-preset-${variant}`}
          className="block text-sm font-medium text-zinc-700"
        >
          링크 제목
        </label>
        <select
          id={`link-title-preset-${variant}`}
          value={titlePreset}
          onChange={(event) =>
            handlePresetChange(event.target.value as LinkTitlePreset)
          }
          className={cn(fieldClassName, variant === "add" && "mt-1")}
        >
          {LINK_TITLE_PRESETS.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>
      </div>

      {isCustom ? (
        <div>
          <label
            htmlFor={`link-custom-title-${variant}`}
            className="block text-sm font-medium text-zinc-700"
          >
            직접 입력 제목
          </label>
          <input
            id={`link-custom-title-${variant}`}
            type="text"
            required
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="링크 제목을 입력하세요"
            className={cn(fieldClassName, variant === "add" && "mt-1")}
          />
        </div>
      ) : null}

      <input type="hidden" name="title" value={resolvedTitle} />

      {isBankTransfer ? (
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`link-bank-${variant}`}
              className="block text-sm font-medium text-zinc-700"
            >
              은행 선택
            </label>
            <select
              id={`link-bank-${variant}`}
              name="bank_code"
              required
              value={bankCode}
              onChange={(event) => setBankCode(event.target.value)}
              className={cn(fieldClassName, variant === "add" && "mt-1")}
            >
              <option value="">은행을 선택하세요</option>
              {KOREAN_BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`link-account-${variant}`}
              className="block text-sm font-medium text-zinc-700"
            >
              계좌번호
            </label>
            <input
              id={`link-account-${variant}`}
              name="account_no"
              type="text"
              inputMode="numeric"
              required
              value={accountNo}
              onChange={(event) => setAccountNo(event.target.value)}
              placeholder="계좌번호를 입력하세요 (숫자만)"
              className={cn(fieldClassName, variant === "add" && "mt-1")}
            />
          </div>

          <input type="hidden" name="url" value={TRANSFER_URL_MARKER} />

          <p className="text-sm text-sky-600">
            💡 은행과 계좌번호를 입력하시면 스캔 시 송금 게이트웨이에서 토스,
            카카오페이, 네이버페이 등 원하는 앱으로 송금할 수 있습니다.
          </p>
        </div>
      ) : (
        <div>
          <input
            name="url"
            type={isContact ? "text" : "url"}
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={getLinkUrlPlaceholder(titlePreset)}
            className={fieldClassName}
          />
          {isContact ? (
            <p className="mt-1.5 text-sm text-sky-600">
              💡 위 입력창에서 이름과 연락처만 수정해서 등록하세요.
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}

interface LinksManagerProps {
  links: LinkBlock[];
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
    <li className="rounded-xl border border-zinc-200 bg-white p-4">
      {isEditing ? (
        <EditLinkForm
          link={link}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-900">{link.title}</p>
            <p className="mt-0.5 truncate text-sm text-zinc-500">
              {formatTransferLinkSummary(link)}
            </p>
            {deleteState.error ? (
              <p className="mt-2 text-sm text-red-600">{deleteState.error}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              disabled={index === 0 || movePending}
              onClick={() =>
                startMove(() => {
                  void moveLinkAction(link.id, "up").then(() => router.refresh());
                })
              }
              className="rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
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
              className="rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-40"
              aria-label="아래로 이동"
            >
              ↓
            </button>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
            >
              수정
            </button>
            <form action={deleteAction}>
              <button
                type="submit"
                disabled={isDeleting}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
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
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50"
        >
          취소
        </button>
      </div>
    </form>
  );
}

export function LinksManager({ links }: LinksManagerProps) {
  const [addState, addAction, isAdding] = useActionState(addLinkAction, initialState);

  return (
    <div className="space-y-6">
      <form action={addAction} className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800">새 링크 추가</h3>
        <LinkFormFields variant="add" />

        {addState.error ? (
          <p className="text-sm text-red-600">{addState.error}</p>
        ) : null}

        {addState.success ? (
          <p className="text-sm text-emerald-700">{addState.success}</p>
        ) : null}

        <button
          type="submit"
          disabled={isAdding}
          className={cn(
            "rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white",
            "hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isAdding ? "추가 중..." : "링크 추가"}
        </button>
      </form>

      {links.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">아직 등록된 링크가 없습니다.</p>
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
  );
}
