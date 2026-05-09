import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TIERS, TIER_LABEL, type Tier } from "@/config/event";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

const DOORS = ["1", "2", "3", "4", "5"] as const;

type StatRow = {
  status: "issued" | "activated" | "used";
  tier: Tier | null;
  door: string | null;
  cnt: number;
};

export default async function MonitorPage() {
  await requireUser();
  const t = await getTranslations("admin.monitor");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("monitor_stats");

  const rows: StatRow[] = error
    ? []
    : (data ?? []).map((r: { status: string; tier: string | null; door: string | null; cnt: number | string }) => ({
        status: r.status as StatRow["status"],
        tier: (r.tier ?? null) as Tier | null,
        door: r.door ?? null,
        cnt: Number(r.cnt),
      }));

  // Aggregations
  const total = (s: StatRow["status"]) =>
    rows.filter((r) => r.status === s).reduce((a, r) => a + r.cnt, 0);

  const used = total("used");
  const activated = total("activated");
  const issued = total("issued");
  const live = used + activated;

  const byTier = (tier: Tier) => {
    const u = rows.filter((r) => r.tier === tier && r.status === "used").reduce((a, r) => a + r.cnt, 0);
    const a = rows.filter((r) => r.tier === tier && r.status === "activated").reduce((acc, r) => acc + r.cnt, 0);
    return { used: u, total: u + a };
  };

  const byDoor = (door: string) =>
    rows.filter((r) => r.door === door && r.status === "used").reduce((a, r) => a + r.cnt, 0);

  const unknownDoor = rows
    .filter((r) => r.door === null && r.status === "used")
    .reduce((a, r) => a + r.cnt, 0);

  const progress = live > 0 ? Math.round((used / live) * 100) : 0;

  return (
    <div>
      <AutoRefresh interval={7000} />
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">{t("title")}</h1>
        <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
          {t("autoRefresh")}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error.message}
        </div>
      )}

      {/* Top counter */}
      <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-6 md:p-8">
        <div className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
          {t("entered")}
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="font-display text-5xl font-black md:text-7xl">{used}</span>
          <span className="font-display text-2xl text-[var(--color-fg-muted)] md:text-3xl">
            / {live}
          </span>
          <span className="ml-auto text-sm text-[var(--color-fg-muted)]">
            {progress}%
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-line)]">
          <div
            className="h-full rounded-full bg-[var(--color-red)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--color-fg-muted)]">
          <span>{t("issued")}: {issued}</span>
          <span>{t("activated")}: {activated}</span>
          <span>{t("used")}: {used}</span>
        </div>
      </div>

      {/* Tier breakdown */}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {TIERS.map((tier) => {
          const { used: u, total: tot } = byTier(tier);
          const pct = tot > 0 ? Math.round((u / tot) * 100) : 0;
          return (
            <div
              key={tier}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-5"
            >
              <div className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
                {TIER_LABEL[tier]}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-3xl font-black">{u}</span>
                <span className="text-xl text-[var(--color-fg-muted)]">/ {tot}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
                <div
                  className="h-full rounded-full bg-[var(--color-red)] transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-door breakdown */}
      <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-5">
        <div className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
          {t("byDoor")}
        </div>
        <div className="mt-4 grid gap-2">
          {DOORS.map((d) => {
            const c = byDoor(d);
            return (
              <DoorRow key={d} label={`${t("door")} ${d}`} count={c} max={used} />
            );
          })}
          {unknownDoor > 0 && (
            <DoorRow label={t("doorUnknown")} count={unknownDoor} max={used} />
          )}
        </div>
      </div>
    </div>
  );
}

function DoorRow({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-1">
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm font-semibold">{label}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-line)]">
          <div
            className="h-full rounded-full bg-[var(--color-red)] transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="font-display text-xl font-extrabold tabular-nums">
        {count}
      </span>
    </div>
  );
}
