"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { TIER_LABEL, type Tier } from "@/config/event";

type Ticket = {
  id: string;
  token: string;
  status: "issued" | "activated" | "used";
  holder_name: string | null;
  holder_contact: string | null;
  category: string | null;
  tier: Tier | null;
  order_no: string | null;
  created_at: string;
};

export function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  const t = useTranslations("admin");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (token: string) => {
    const url = `${window.location.origin}/t/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  };

  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-line)] p-10 text-center text-[var(--color-fg-muted)]">
        —
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-line)]">
      <table className="w-full text-sm">
        <thead className="bg-black/40 text-left text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
          <tr>
            <th className="px-4 py-3">{t("table.orderNo")}</th>
            <th className="px-4 py-3">{t("table.tier")}</th>
            <th className="px-4 py-3">{t("table.holder")}</th>
            <th className="px-4 py-3">{t("table.email")}</th>
            <th className="px-4 py-3">{t("table.status")}</th>
            <th className="px-4 py-3">{t("table.token")}</th>
            <th className="px-4 py-3">{t("table.created")}</th>
            <th className="px-4 py-3 text-right">{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((tk) => (
            <tr
              key={tk.id}
              className="border-t border-[var(--color-line)] hover:bg-white/5"
            >
              <td className="px-4 py-3 font-mono text-xs">
                {tk.order_no ?? "—"}
              </td>
              <td className="px-4 py-3">
                {tk.tier ? <TierBadge tier={tk.tier} /> : "—"}
              </td>
              <td className="px-4 py-3">{tk.holder_name ?? "—"}</td>
              <td className="px-4 py-3 text-[var(--color-fg-muted)]">
                {tk.holder_contact ? (
                  <a
                    href={`mailto:${tk.holder_contact}`}
                    className="hover:text-[var(--color-red)]"
                  >
                    {tk.holder_contact}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={tk.status} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--color-fg-muted)]">
                <a
                  href={`/t/${tk.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-red)]"
                >
                  {tk.token}
                </a>
              </td>
              <td className="px-4 py-3 text-[var(--color-fg-muted)]">
                {new Date(tk.created_at).toLocaleString("kk-KZ")}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => copy(tk.token)}
                  className="rounded-md border border-[var(--color-line)] px-3 py-1 text-xs hover:border-white"
                >
                  {copied === tk.token ? t("copied") : t("copy")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const t = useTranslations("admin.status");
  const map = {
    issued: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    activated: "border-green-500/40 bg-green-500/10 text-green-300",
    used: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
  } as const;
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${map[status]}`}
    >
      {t(status)}
    </span>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  const map: Record<Tier, string> = {
    "pre-sale": "border-amber-500/40 bg-amber-500/10 text-amber-300",
    vip: "border-zinc-300/40 bg-zinc-300/10 text-zinc-200",
    standard: "border-red-500/40 bg-red-500/10 text-red-300",
  };
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${map[tier]}`}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
