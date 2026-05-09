"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "tedx-ticket-token";

export function MyTicketLink() {
  const t = useTranslations("nav");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) setToken(v);
    } catch {
      // ignore
    }
  }, []);

  if (!token) return null;

  return (
    <a
      href={`/t/${token}`}
      className="inline-flex rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white transition-colors hover:border-white md:px-4 md:py-2 md:text-xs"
    >
      {t("myTicket")}
    </a>
  );
}
