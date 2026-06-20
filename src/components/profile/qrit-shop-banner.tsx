import { QRIT_SHOP_URL } from "@/lib/qrit-config";
import { qritBrand } from "@/lib/qrit-brand-theme";

/** Reserve space so fixed banner does not cover page content. */
export const QRIT_SHOP_BANNER_OFFSET_CLASS =
  "pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))]";

export function QritShopBanner() {
  return (
    <aside
      aria-label="QRit 주얼리 구매"
      className={qritBrand.shopBanner}
    >
      <a
        href={QRIT_SHOP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto flex w-full max-w-[430px] items-center justify-center gap-2 px-4 py-3.5 text-center text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-95 active:opacity-90 sm:text-[15px]"
        style={{
          paddingBottom: "max(0.875rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <span aria-hidden className="text-base">
          🛒
        </span>
        <span>나만의 스마트한 QR 주얼리, QRit에서 구매하기</span>
        <span aria-hidden className="text-[#F5C518]">
          ➔
        </span>
      </a>
    </aside>
  );
}
