"use client";

import { useActionState, useState } from "react";
import {
  deleteHtmlPageAction,
  upsertHtmlPageAction,
  type HtmlPagesActionState,
} from "@/app/admin/pages/actions";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

export type HtmlPageRow = {
  slug: string;
  title: string;
  updated_at: string | null;
  source: "database" | "bundled";
  htmlPreviewLength: number;
};

const upsertInitial: HtmlPagesActionState = {};
const deleteInitial: HtmlPagesActionState = {};

function formatDateTime(iso: string | null): string {
  if (!iso) {
    return "번들";
  }

  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sharePath(slug: string): string {
  return `/s/${slug}`;
}

export function PagesPanel({
  pages,
  siteOrigin,
  authenticated = true,
  canWrite = true,
}: {
  pages: HtmlPageRow[];
  siteOrigin: string;
  authenticated?: boolean;
  canWrite?: boolean;
}) {
  const [upsertState, upsertAction, upsertPending] = useActionState(
    upsertHtmlPageAction,
    upsertInitial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteHtmlPageAction,
    deleteInitial,
  );
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [editing, setEditing] = useState<HtmlPageRow | null>(null);

  async function copyShareLink(slug: string) {
    const url = `${siteOrigin}${sharePath(slug)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      window.setTimeout(() => setCopiedSlug(null), 2000);
    } catch {
      setCopiedSlug(null);
    }
  }

  if (!authenticated) {
    return null;
  }

  const feedback = upsertState.error
    ? { type: "error" as const, message: upsertState.error }
    : upsertState.success
      ? { type: "success" as const, message: upsertState.success }
      : deleteState.error
        ? { type: "error" as const, message: deleteState.error }
        : deleteState.success
          ? { type: "success" as const, message: deleteState.success }
          : null;

  return (
    <section className="mx-auto mt-10 max-w-4xl space-y-6">
      <div className={qritBrand.cardLg}>
        <h2 className="text-lg font-semibold text-zinc-900">
          {editing ? "페이지 수정" : "페이지 추가"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          슬러그와 HTML을 붙여넣으면{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
            /s/슬러그
          </code>{" "}
          로 공유할 수 있습니다.
        </p>

        {!canWrite ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            서비스 롤 키가 없어 새 페이지 저장은 불가합니다. 번들 페이지 링크는
            아래에서 복사할 수 있습니다.
          </p>
        ) : null}

        <form action={upsertAction} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="html-page-slug"
                className="block text-sm font-medium text-zinc-700"
              >
                슬러그
              </label>
              <input
                id="html-page-slug"
                name="slug"
                type="text"
                required
                pattern="[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?"
                defaultValue={editing?.slug ?? ""}
                placeholder="예: fireworks"
                className={qritBrand.input}
              />
            </div>
            <div>
              <label
                htmlFor="html-page-title"
                className="block text-sm font-medium text-zinc-700"
              >
                제목
              </label>
              <input
                id="html-page-title"
                name="title"
                type="text"
                defaultValue={editing?.title ?? ""}
                placeholder="예: 8월의 첫눈"
                className={qritBrand.input}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="html-page-html"
              className="block text-sm font-medium text-zinc-700"
            >
              HTML
            </label>
            <textarea
              id="html-page-html"
              name="html"
              required
              rows={14}
              placeholder="<!DOCTYPE html>..."
              className={cn(qritBrand.input, "font-mono text-xs")}
              defaultValue=""
              key={editing?.slug ?? "new"}
            />
            <p className="mt-1 text-xs text-zinc-500">
              수정 시에도 HTML 전체를 다시 붙여넣어 주세요.
              {editing
                ? ` (현재 DB/번들 약 ${editing.htmlPreviewLength.toLocaleString()}자)`
                : null}
            </p>
          </div>

          {feedback ? (
            <p
              className={
                feedback.type === "error"
                  ? "rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600"
                  : "rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
              }
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={upsertPending || !canWrite}
              className={cn("sm:w-auto", qritBrand.primaryButton)}
            >
              {upsertPending ? "저장 중…" : editing ? "수정 저장" : "저장"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                새 페이지로 전환
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className={qritBrand.cardLg}>
        <h2 className="text-lg font-semibold text-zinc-900">등록된 페이지</h2>
        <p className="mt-1 text-sm text-zinc-500">
          총 {pages.length}개 · 링크를 복사해 공유하세요
        </p>

        {pages.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">아직 등록된 페이지가 없습니다.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {pages.map((page) => {
              const url = `${siteOrigin}${sharePath(page.slug)}`;
              return (
                <li
                  key={page.slug}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900">{page.title}</p>
                    <p className="mt-0.5 truncate text-sm text-[#0d5c63]">
                      {url}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {page.source === "bundled" ? "앱 번들" : "DB"} ·{" "}
                      {formatDateTime(page.updated_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={sharePath(page.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      열기
                    </a>
                    <button
                      type="button"
                      onClick={() => copyShareLink(page.slug)}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      {copiedSlug === page.slug ? "복사됨" : "링크 복사"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(page)}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      수정
                    </button>
                    {page.source === "database" && canWrite ? (
                      <form action={deleteAction}>
                        <input type="hidden" name="slug" value={page.slug} />
                        <button
                          type="submit"
                          disabled={deletePending}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                          onClick={(event) => {
                            if (
                              !window.confirm(
                                `'${page.slug}' 페이지를 삭제할까요?`,
                              )
                            ) {
                              event.preventDefault();
                            }
                          }}
                        >
                          삭제
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
