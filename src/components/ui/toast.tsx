"use client";

import { cn } from "@/lib/utils";

type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "pointer-events-none fixed bottom-8 left-1/2 z-50 max-w-[min(calc(100vw-2rem),24rem)] -translate-x-1/2",
        "rounded-xl border border-violet-200/90 bg-violet-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg shadow-violet-900/25",
        "transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0",
      )}
    >
      {message}
    </div>
  );
}
