"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { MyTicketLink } from "./MyTicketLink";
import { ScheduleLink } from "./ScheduleLink";

export function Nav({ buyHref }: { buyHref: string }) {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled
          ? "bg-[var(--color-bg)]/85 backdrop-blur-md border-b border-[var(--color-line)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-10 md:py-4">
        <Link href="/" className="flex items-center">
          <img
            src="/brand/wordmark.svg"
            alt="TEDxZhenysPark"
            width={1304}
            height={147}
            className="h-4 w-auto md:h-6"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[var(--color-fg-muted)] md:flex">
          <a href="#theme" className="hover:text-white transition-colors">
            {t("theme")}
          </a>
          <a href="#speakers" className="hover:text-white transition-colors">
            {t("speakers")}
          </a>
          <a href="#about" className="hover:text-white transition-colors">
            {t("about")}
          </a>
          <a href="#venue" className="hover:text-white transition-colors">
            {t("venue")}
          </a>
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          <ScheduleLink />
          <MyTicketLink />
          <LangSwitcher />
          <a
            href={buyHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-[var(--color-red)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-red-deep)] md:px-5 md:py-2 md:text-sm"
          >
            {t("buyTicket")}
          </a>
        </div>
      </div>
    </header>
  );
}

function LangSwitcher() {
  return (
    <div className="flex items-center text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
      <Link href="/" locale="kk" className="px-2 py-1 hover:text-white">
        KK
      </Link>
      <span className="text-[var(--color-line)]">/</span>
      <Link href="/" locale="en" className="px-2 py-1 hover:text-white">
        EN
      </Link>
    </div>
  );
}
