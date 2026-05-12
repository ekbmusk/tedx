"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/admin/actions";
import type { Role } from "@/lib/auth";

export function AdminNav({ email, role }: { email: string; role: Role }) {
  const t = useTranslations("admin");
  const isManager = role === "manager";
  const homeHref = isManager ? "/admin" : "/admin/scan";
  return (
    <header className="border-b border-[var(--color-line)] bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <div className="flex items-center gap-6">
          <Link
            href={homeHref}
            className="tedx-mark font-display text-base font-black tracking-tight"
          >
            TED<span>x</span> · Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {isManager && (
              <>
                <Link href="/admin" className="hover:text-[var(--color-red)]">
                  {t("tickets")}
                </Link>
                <Link href="/admin/new" className="hover:text-[var(--color-red)]">
                  {t("create")}
                </Link>
              </>
            )}
            <Link href="/admin/scan" className="hover:text-[var(--color-red)]">
              {t("scan")}
            </Link>
            {isManager && (
              <Link href="/admin/monitor" className="hover:text-[var(--color-red)]">
                {t("monitorNav")}
              </Link>
            )}
          </nav>
        </div>
        <form action={signOut} className="flex items-center gap-3">
          <span className="hidden text-xs text-[var(--color-fg-muted)] sm:inline">
            {email}
          </span>
          <button
            type="submit"
            className="rounded-md border border-[var(--color-line)] px-3 py-1.5 text-xs hover:border-white"
          >
            {t("signOut")}
          </button>
        </form>
      </div>
    </header>
  );
}
