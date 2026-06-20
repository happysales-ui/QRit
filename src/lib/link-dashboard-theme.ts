/** Dark teal + ivory theme for dashboard link management. */
export const linkDashboardTheme = {
  section:
    "rounded-2xl border border-[#d4e8ea] bg-[#faf8f3] p-6 shadow-[0_4px_24px_rgba(13,92,99,0.08)]",
  sectionTitle: "text-lg font-semibold text-[#0d5c63]",
  ivoryCard:
    "rounded-2xl border border-[#e8f0f1] bg-[#fffef9] p-4 shadow-[0_2px_12px_rgba(13,92,99,0.06)]",
  fieldLabel: "block text-sm font-medium text-[#3d7a80]",
  input:
    "mt-1.5 w-full rounded-xl border border-[#d4e8ea] bg-white px-4 py-2.5 text-sm text-[#0d5c63] outline-none transition-colors placeholder:text-[#94a89e] focus:border-[#147278] focus:ring-2 focus:ring-[#147278]/20",
  mecardInput:
    "mt-1.5 w-full rounded-xl border-2 border-[#147278] bg-white px-4 py-2.5 text-sm text-[#0d5c63] outline-none transition-colors placeholder:text-[#94a89e] focus:border-[#094347] focus:ring-2 focus:ring-[#147278]/25",
  hint: "mt-2 flex items-start gap-1.5 text-sm text-[#3d7a80]",
  hintIcon: "mt-0.5 shrink-0 text-[#147278]",
  primaryButton:
    "rounded-2xl bg-gradient-to-r from-[#0d5c63] to-[#147278] px-6 py-2.5 text-sm font-semibold text-[#faf8f3] shadow-[0_4px_14px_rgba(13,92,99,0.25)] transition-all hover:from-[#094347] hover:to-[#0d5c63] hover:shadow-[0_6px_18px_rgba(13,92,99,0.3)] disabled:cursor-not-allowed disabled:opacity-60",
  secondaryButton:
    "rounded-xl border border-[#d4e8ea] bg-white px-3 py-1.5 text-xs font-medium text-[#3d7a80] transition-colors hover:bg-[#e8f4f5]",
  dangerButton:
    "rounded-xl border border-[#e8b4b4] bg-white px-3 py-1.5 text-xs font-medium text-[#E53935] transition-colors hover:bg-[#fef2f2]",
  reorderButton:
    "rounded-lg border border-[#d4e8ea] bg-white px-2 py-1 text-xs text-[#3d7a80] transition-colors hover:bg-[#e8f4f5] disabled:opacity-40",
  linkCard:
    "rounded-2xl border border-[#e8f0f1] bg-[#fffef9] p-4 shadow-[0_2px_12px_rgba(13,92,99,0.06)]",
  linkTitle: "truncate text-xl font-semibold text-[#0d5c63] sm:text-base",
  linkSubtitle: "mt-0.5 truncate text-sm text-[#3d7a80]",
  emptyState: "text-center text-sm text-[#3d7a80]",
  footer: "mt-8 border-t border-[#d4e8ea] pt-6 text-center",
  footerPrimary: "text-sm font-medium text-[#3d7a80]",
  footerSecondary: "mt-1.5 text-xs text-[#94a89e]",
} as const;
