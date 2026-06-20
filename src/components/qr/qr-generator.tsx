"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { qritBrand } from "@/lib/qrit-brand-theme";

const DEFAULT_VALUE = "https://example.com";

function normalizeQrValue(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_VALUE;

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }

  if (/^[^\s]+\.[^\s]+/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function QrGenerator() {
  const [input, setInput] = useState(DEFAULT_VALUE);
  const [size, setSize] = useState(256);

  const qrValue = useMemo(() => normalizeQrValue(input), [input]);

  const handleDownload = () => {
    const svg = document.getElementById("qr-preview");
    if (!svg) return;

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`mx-auto max-w-md ${qritBrand.card}`}>
      <label htmlFor="qr-input" className="block text-sm font-medium text-zinc-700">
        링크 또는 텍스트
      </label>
      <input
        id="qr-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="https://example.com"
        className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-[#147278] focus:ring-2 focus:ring-[#147278]/20"
      />

      <div className="mt-6 flex justify-center rounded-lg bg-zinc-50 p-6">
        <QRCodeSVG
          id="qr-preview"
          value={qrValue}
          size={size}
          level="M"
          includeMargin
        />
      </div>

      <div className="mt-6">
        <label htmlFor="qr-size" className="flex items-center justify-between text-sm font-medium text-zinc-700">
          <span>크기</span>
          <span className="text-zinc-500">{size}px</span>
        </label>
        <input
          id="qr-size"
          type="range"
          min={128}
          max={512}
          step={8}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="mt-2 w-full accent-[#0d5c63]"
        />
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className={`mt-6 w-full ${qritBrand.primaryButton}`}
      >
        SVG 다운로드
      </button>
    </div>
  );
}
