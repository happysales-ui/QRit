"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { qritBrand } from "@/lib/qrit-brand-theme";
import { cn } from "@/lib/utils";

type LinkQrCodeProps = {
  value: string;
  qrId: string;
  size?: number;
  className?: string;
  downloadFileName?: string;
};

export function LinkQrCode({
  value,
  qrId,
  size = 128,
  className,
  downloadFileName = "qr-code",
}: LinkQrCodeProps) {
  const qrValue = useMemo(() => value.trim(), [value]);

  function handleDownloadSvg() {
    const svg = document.getElementById(qrId);
    if (!svg) return;

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${downloadFileName}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadPng() {
    const svg = document.getElementById(qrId);
    if (!svg || typeof document === "undefined") return;

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size, size);
      context.drawImage(image, 0, 0, size, size);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          URL.revokeObjectURL(url);
          return;
        }

        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${downloadFileName}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, "image/png");
    };

    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  if (!qrValue) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center gap-3 sm:flex-row sm:items-start", className)}>
      <div className="rounded-xl border border-[#d4e8ea] bg-white p-3">
        <QRCodeSVG
          id={qrId}
          value={qrValue}
          size={size}
          level="M"
          includeMargin
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownloadSvg}
          className={cn(qritBrand.primaryButton, "px-3 py-1.5 text-xs")}
        >
          SVG
        </button>
        <button
          type="button"
          onClick={handleDownloadPng}
          className={cn(
            "rounded-xl border border-[#d4e8ea] bg-white px-3 py-1.5 text-xs font-medium text-[#3d7a80] transition-colors hover:bg-[#e8f4f5]",
          )}
        >
          PNG
        </button>
      </div>
    </div>
  );
}
