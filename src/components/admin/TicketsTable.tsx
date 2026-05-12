"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { TIERS, TIER_LABEL, type Tier } from "@/config/event";

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

type TierFilter = Tier | "all";
type SortKey =
  | "order_no"
  | "tier"
  | "holder_name"
  | "holder_contact"
  | "status"
  | "token"
  | "created_at";
type SortDir = "asc" | "desc";

// Tier ordering for sort: VIP > PRE-SALE > STANDARD.
const TIER_RANK: Record<Tier, number> = {
  vip: 0,
  "pre-sale": 1,
  standard: 2,
};

// Status ordering for sort: issued (need action) > activated > used.
const STATUS_RANK: Record<Ticket["status"], number> = {
  issued: 0,
  activated: 1,
  used: 2,
};

export function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  const t = useTranslations("admin");
  const tt = useTranslations("admin.tierOptions");
  const ts = useTranslations("admin.status");
  const [copied, setCopied] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const counts = useMemo(() => {
    const c: Record<TierFilter, number> = {
      all: tickets.length,
      "pre-sale": 0,
      vip: 0,
      standard: 0,
    };
    for (const tk of tickets) if (tk.tier) c[tk.tier]++;
    return c;
  }, [tickets]);

  const statusCounts = useMemo(() => {
    const c = { issued: 0, activated: 0, used: 0 };
    for (const tk of tickets) c[tk.status]++;
    return c;
  }, [tickets]);

  const visible = useMemo(() => {
    const filtered =
      tierFilter === "all"
        ? tickets
        : tickets.filter((tk) => tk.tier === tierFilter);
    const sign = sortDir === "asc" ? 1 : -1;
    const cmp = (a: Ticket, b: Ticket) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // nulls last regardless of dir
      if (vb == null) return -1;
      if (va < vb) return -1 * sign;
      if (va > vb) return 1 * sign;
      return 0;
    };
    return [...filtered].sort(cmp);
  }, [tickets, tierFilter, sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      // Created defaults to desc (newest first); everything else to asc.
      setSortDir(key === "created_at" ? "desc" : "asc");
    }
  };

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
    <>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
        <StatusStat
          color="text-yellow-300"
          label={ts("issued")}
          count={statusCounts.issued}
        />
        <StatusStat
          color="text-green-300"
          label={ts("activated")}
          count={statusCounts.activated}
        />
        <StatusStat
          color="text-zinc-300"
          label={ts("used")}
          count={statusCounts.used}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip
          active={tierFilter === "all"}
          onClick={() => setTierFilter("all")}
          label={`${t("filters.all")} · ${counts.all}`}
        />
        {TIERS.map((tier) => (
          <FilterChip
            key={tier}
            active={tierFilter === tier}
            onClick={() => setTierFilter(tier)}
            label={`${tt(tier).split(" — ")[0]} · ${counts[tier]}`}
            tier={tier}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-line)] p-10 text-center text-[var(--color-fg-muted)]">
          —
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-black/40 text-left text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
              <tr>
                <SortHeader
                  label={t("table.orderNo")}
                  active={sortKey === "order_no"}
                  dir={sortDir}
                  onClick={() => onSort("order_no")}
                />
                <SortHeader
                  label={t("table.tier")}
                  active={sortKey === "tier"}
                  dir={sortDir}
                  onClick={() => onSort("tier")}
                />
                <SortHeader
                  label={t("table.holder")}
                  active={sortKey === "holder_name"}
                  dir={sortDir}
                  onClick={() => onSort("holder_name")}
                />
                <SortHeader
                  label={t("table.email")}
                  active={sortKey === "holder_contact"}
                  dir={sortDir}
                  onClick={() => onSort("holder_contact")}
                />
                <SortHeader
                  label={t("table.status")}
                  active={sortKey === "status"}
                  dir={sortDir}
                  onClick={() => onSort("status")}
                />
                <SortHeader
                  label={t("table.token")}
                  active={sortKey === "token"}
                  dir={sortDir}
                  onClick={() => onSort("token")}
                />
                <SortHeader
                  label={t("table.created")}
                  active={sortKey === "created_at"}
                  dir={sortDir}
                  onClick={() => onSort("created_at")}
                />
                <th className="px-4 py-3 text-right">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((tk) => (
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
      )}
    </>
  );
}

function getSortValue(
  tk: Ticket,
  key: SortKey,
): string | number | null {
  switch (key) {
    case "order_no":
      return tk.order_no;
    case "tier":
      return tk.tier ? TIER_RANK[tk.tier] : null;
    case "holder_name":
      return tk.holder_name?.toLocaleLowerCase("kk-KZ") ?? null;
    case "holder_contact":
      return tk.holder_contact?.toLocaleLowerCase() ?? null;
    case "status":
      return STATUS_RANK[tk.status];
    case "token":
      return tk.token;
    case "created_at":
      return tk.created_at;
  }
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        className={`-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 uppercase tracking-wider transition-colors ${
          active ? "text-white" : "hover:text-white"
        }`}
      >
        {label}
        <span
          aria-hidden
          className={`text-[10px] leading-none ${
            active ? "opacity-100" : "opacity-30"
          }`}
        >
          {active ? (dir === "asc" ? "▲" : "▼") : "▾"}
        </span>
      </button>
    </th>
  );
}

function StatusStat({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`text-base leading-none ${color}`}>
        •
      </span>
      <span>
        {label}{" "}
        <span className="font-semibold text-white">{count}</span>
      </span>
    </span>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  tier,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tier?: Tier;
}) {
  const accent = tier
    ? {
        "pre-sale": "border-amber-500/60 text-amber-200",
        vip: "border-zinc-300/60 text-zinc-100",
        standard: "border-red-500/60 text-red-200",
      }[tier]
    : "border-white text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
        active
          ? `${accent} bg-white/[0.06]`
          : "border-[var(--color-line)] text-[var(--color-fg-muted)] hover:border-white hover:text-white"
      }`}
    >
      {label}
    </button>
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
