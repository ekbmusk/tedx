"use client";

import { useTranslations } from "next-intl";

export function DownloadImageButton({
  token,
  orderNo,
}: {
  token: string;
  orderNo: string | null;
}) {
  const t = useTranslations("ticket");
  return (
    <a
      href={`/t/${token}/image`}
      download={
        orderNo ? `TEDxZhenysPark-${orderNo}.png` : "TEDxZhenysPark.png"
      }
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-red)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-red-deep)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M12 4v12m0 0-4-4m4 4 4-4M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t("download")}
    </a>
  );
}
