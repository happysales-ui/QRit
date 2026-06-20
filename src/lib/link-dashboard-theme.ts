/** Dark forest green + ivory theme for dashboard link management. */
export const linkDashboardTheme = {
  section:
    "rounded-2xl border border-[#d4e4dc] bg-[#faf8f3] p-6 shadow-[0_4px_24px_rgba(27,67,50,0.08)]",
  sectionTitle: "text-lg font-semibold text-[#1b4332]",
  ivoryCard:
    "rounded-2xl border border-[#e8efe9] bg-[#fffef9] p-4 shadow-[0_2px_12px_rgba(27,67,50,0.06)]",
  fieldLabel: "block text-sm font-medium text-[#2d6a4f]",
  input:
    "mt-1.5 w-full rounded-xl border border-[#d4e4dc] bg-white px-4 py-2.5 text-sm text-[#1b4332] outline-none transition-colors placeholder:text-[#94a89e] focus:border-[#40916c] focus:ring-2 focus:ring-[#40916c]/20",
  mecardInput:
    "mt-1.5 w-full rounded-xl border-2 border-[#40916c] bg-white px-4 py-2.5 text-sm text-[#1b4332] outline-none transition-colors placeholder:text-[#94a89e] focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#40916c]/25",
  hint: "mt-2 flex items-start gap-1.5 text-sm text-[#52796f]",
  hintIcon: "mt-0.5 shrink-0 text-[#40916c]",
  primaryButton:
    "rounded-2xl bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] px-6 py-2.5 text-sm font-semibold text-[#faf8f3] shadow-[0_4px_14px_rgba(27,67,50,0.25)] transition-all hover:from-[#163728] hover:to-[#245a42] hover:shadow-[0_6px_18px_rgba(27,67,50,0.3)] disabled:cursor-not-allowed disabled:opacity-60",
  secondaryButton:
    "rounded-xl border border-[#b7cfc0] bg-white px-3 py-1.5 text-xs font-medium text-[#2d6a4f] transition-colors hover:bg-[#f0f7f2]",
  dangerButton:
    "rounded-xl border border-[#e8b4b4] bg-white px-3 py-1.5 text-xs font-medium text-[#b91c1c] transition-colors hover:bg-[#fef2f2]",
  reorderButton:
    "rounded-lg border border-[#d4e4dc] bg-white px-2 py-1 text-xs text-[#52796f] transition-colors hover:bg-[#f0f7f2] disabled:opacity-40",
  linkCard:
    "rounded-2xl border border-[#e8efe9] bg-[#fffef9] p-4 shadow-[0_2px_12px_rgba(27,67,50,0.06)]",
  linkTitle: "font-semibold text-[#1b4332]",
  linkSubtitle: "mt-0.5 truncate text-sm text-[#52796f]",
  emptyState: "text-center text-sm text-[#52796f]",
  footer: "mt-8 border-t border-[#d4e4dc] pt-6 text-center",
  footerPrimary: "text-sm font-medium text-[#2d6a4f]",
  footerSecondary: "mt-1.5 text-xs text-[#94a89e]",
} as const;
