"use client";

import { useTranslations } from "next-intl";
import { useHasTicket } from "@/lib/use-has-ticket";

export function ScheduleLink() {
  const t = useTranslations("nav");
  const hasTicket = useHasTicket();
  if (!hasTicket) return null;
  return (
    <a
      href="/#schedule"
      className="inline-flex rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white transition-colors hover:border-white md:px-4 md:py-2 md:text-xs"
    >
      {t("schedule")}
    </a>
  );
}
