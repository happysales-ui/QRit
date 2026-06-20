/** QRit brand palette — extracted from official logo. */
export const qritColors = {
  teal: "#0d5c63",
  tealDark: "#094347",
  tealLight: "#147278",
  tealMuted: "#3d7a80",
  tealPale: "#d4e8ea",
  tealBg: "#e8f4f5",
  yellow: "#F5C518",
  yellowDark: "#d4a812",
  orange: "#F7941D",
  red: "#E53935",
  ivory: "#faf8f3",
  ivoryCard: "#fffef9",
  white: "#ffffff",
  black: "#171717",
  textMuted: "#64748b",
  borderLight: "#e8f0f1",
} as const;

/** Shared Tailwind class tokens for consistent QRit branding. */
export const qritBrand = {
  pageBg: "min-h-dvh bg-gradient-to-b from-[#e8f4f5] to-white",
  authPageBg:
    "flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#faf8f3] via-[#e8f4f5] to-white px-4 py-12",
  pageBgProfile:
    "relative min-h-dvh bg-gradient-to-b from-[#e8f4f5]/80 via-[#faf8f3]/40 to-slate-50",
  profileGlowTeal:
    "absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[#0d5c63]/15 blur-3xl",
  profileGlowYellow:
    "absolute bottom-0 right-0 size-56 translate-x-1/4 translate-y-1/4 rounded-full bg-[#F5C518]/20 blur-3xl",
  card: "rounded-xl border border-[#d4e8ea] bg-white p-6 shadow-sm",
  cardLg: "rounded-2xl border border-[#d4e8ea] bg-white/95 p-6 shadow-sm",
  cardIvory:
    "rounded-2xl border border-[#e8f0f1] bg-[#faf8f3] p-6 shadow-[0_4px_24px_rgba(13,92,99,0.08)]",
  link: "text-sm font-medium text-[#0d5c63] transition-colors hover:text-[#094347]",
  linkLg: "font-medium text-[#0d5c63] transition-colors hover:text-[#094347]",
  /** Kakao / external support links — orange accent from logo palette */
  kakaoLink:
    "font-medium text-[#F7941D] transition-colors hover:text-[#d4a812] underline decoration-[#F7941D]/30 underline-offset-2 hover:decoration-[#F7941D]/60",
  heading: "font-bold text-[#171717]",
  accentText: "text-sm font-medium text-[#0d5c63]",
  accentTextLg: "font-mono text-xl tracking-wide text-[#0d5c63]",
  input:
    "mt-1 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#147278] focus:ring-2 focus:ring-[#147278]/20",
  inputDashboard:
    "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#147278] focus:ring-2 focus:ring-[#147278]/20",
  select:
    "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#147278] focus:ring-2 focus:ring-[#147278]/20",
  primaryButton:
    "rounded-xl bg-gradient-to-r from-[#0d5c63] to-[#147278] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(13,92,99,0.25)] transition-all hover:from-[#094347] hover:to-[#0d5c63] disabled:cursor-not-allowed disabled:opacity-60",
  primaryButtonLg:
    "inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#0d5c63] to-[#147278] px-4 py-4 text-[16px] font-semibold text-white transition-all duration-200 hover:from-[#094347] hover:to-[#0d5c63] active:scale-[0.99]",
  secondaryButton:
    "inline-flex w-full items-center justify-center rounded-xl border-2 border-[#0d5c63] bg-white px-4 py-4 text-[16px] font-semibold text-[#0d5c63] transition-all duration-200 hover:bg-[#e8f4f5] active:scale-[0.99]",
  yellowButton:
    "rounded-xl bg-[#F5C518] px-4 py-2.5 text-sm font-semibold text-[#171717] transition-colors hover:bg-[#d4a812] disabled:cursor-not-allowed disabled:opacity-60",
  authCard:
    "w-full max-w-md rounded-xl border border-[#d4e8ea] bg-white p-8 shadow-sm shadow-[#0d5c63]/5",
  shopBanner:
    "fixed inset-x-0 bottom-0 z-40 border-t border-[#0d5c63]/30 bg-gradient-to-r from-[#094347] via-[#0d5c63] to-[#147278] shadow-[0_-8px_24px_rgba(13,92,99,0.18)]",
  toast:
    "rounded-xl border border-[#d4e8ea]/90 bg-[#094347] px-4 py-3 text-center text-sm font-medium text-white shadow-lg shadow-[#094347]/25",
  avatarFallback:
    "flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-[#0d5c63] via-[#147278] to-[#094347] text-2xl font-semibold text-white shadow-lg ring-4 ring-[#F5C518]/50",
  avatarImage:
    "size-24 rounded-full object-cover shadow-lg ring-4 ring-[#F5C518]/50",
  profileAvatarFallback:
    "flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#0d5c63] via-[#147278] to-[#094347] text-lg font-semibold text-white shadow-md ring-[3px] ring-[#F5C518]/50",
  profileAvatarImage:
    "size-20 rounded-full object-cover shadow-md ring-[3px] ring-[#F5C518]/50",
  profileHeaderCard:
    "w-full rounded-2xl border border-[#094347]/20 bg-gradient-to-br from-[#0d5c63] via-[#0d5c63] to-[#094347] px-5 py-4 text-center shadow-[0_8px_32px_rgba(13,92,99,0.22)]",
  profileHeaderName: "mt-3 text-xl font-bold tracking-tight text-white",
  profileHeaderUsername: "mt-0.5 text-sm font-medium text-[#F5C518]",
  profileHeaderBio:
    "mt-2 max-w-xs text-sm leading-snug text-white/80 line-clamp-2",
  profileLinkCard:
    "group flex min-h-[3.75rem] w-full items-center gap-3.5 rounded-2xl border border-[#e8f0f1] bg-[#fffef9] px-4 py-4 shadow-[0_2px_12px_rgba(13,92,99,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d4e8ea] hover:shadow-[0_4px_16px_rgba(13,92,99,0.1)] active:scale-[0.99] sm:min-h-0 sm:gap-3 sm:py-3.5",
  profileLinkTitle:
    "min-w-0 flex-1 truncate text-xl font-semibold text-[#0d5c63] sm:text-base",
  profileLinkChevron:
    "shrink-0 text-lg text-[#3d7a80] transition-transform group-hover:translate-x-0.5 sm:text-base",
  username: "mt-1 text-sm font-medium text-[#0d5c63]/80",
  manageLink:
    "inline-flex items-center justify-center rounded-lg border border-[#d4e8ea]/80 bg-white/50 px-3 py-1.5 text-[11px] font-medium tracking-wide text-[#3d7a80] transition-colors hover:border-[#147278]/60 hover:bg-[#e8f4f5]/60 hover:text-[#0d5c63]",
  transferCard:
    "rounded-2xl border border-[#d4e8ea]/80 bg-white/95 p-5 shadow-sm",
  transferButton:
    "group flex w-full items-center gap-4 rounded-xl border border-[#d4e8ea]/80 bg-gradient-to-r from-white to-[#e8f4f5]/90 px-4 py-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#147278] hover:shadow-md hover:shadow-[#0d5c63]/10 active:scale-[0.99]",
  bankPicker:
    "rounded-xl border border-[#d4e8ea]/70 bg-white/90 p-4 shadow-sm",
  bankPickerTitle: "text-xs font-semibold text-[#0d5c63]",
  bankChip:
    "rounded-lg border border-[#d4e8ea] bg-[#e8f4f5]/60 px-2 py-2 text-xs font-semibold text-[#094347] transition-colors hover:border-[#147278] hover:bg-[#e8f4f5]",
  bankChipActive:
    "border-[#147278] bg-[#e8f4f5] ring-1 ring-[#d4e8ea]",
  profileLinkTransfer:
    "border-[#d4e8ea]/90 bg-gradient-to-r from-white to-[#e8f4f5]/90 hover:border-[#147278] hover:shadow-[#0d5c63]/10",
  profileLinkDefault:
    "border-zinc-200/90 bg-white/95 hover:border-[#d4e8ea] hover:shadow-[#0d5c63]/10",
  profileLinkIcon: "text-[#0d5c63]",
} as const;
