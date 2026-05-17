"use client";

import { useTranslations } from "next-intl";
import { event } from "@/config/event";
import {
  SLOTS,
  formatDuration,
  slotDurationMinutes,
  type Slot,
} from "@/config/schedule";
import { useHasTicket } from "@/lib/use-has-ticket";

const RED_KINDS = new Set<Slot["kind"]>([
  "open",
  "coffee",
  "music",
  "lunch",
  "close",
]);

export function Schedule({ locale }: { locale: "kk" | "en" }) {
  const t = useTranslations("schedule");
  const hasTicket = useHasTicket();

  // SSR + visitors without a ticket: render nothing. Schedule is private
  // to ticket holders — keeping it out of the HTML entirely (vs. hidden
  // via CSS) prevents leaks via view-source and search crawlers.
  if (!hasTicket) return null;

  return (
    <section
      id="schedule"
      className="border-b border-[var(--color-line)] py-20 md:py-32"
    >
      <div className="mx-auto max-w-5xl px-5 md:px-10">
        <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <h2 className="font-display text-3xl font-extrabold md:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-fg-muted)] md:text-base">
              {event.dateLabel[locale]} · {event.venue[locale]} · {t("subtitle")}
            </p>
          </div>
          <a
            href={
              locale === "en"
                ? "/agenda/TEDxZhenysPark_Agenda_Dark_EN.pdf"
                : "/agenda/TEDxZhenysPark_Agenda_Dark_KZ.pdf"
            }
            download
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white md:self-auto"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path
                d="M12 4v12m0 0l-4-4m4 4l4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M4 20h16" strokeLinecap="round" />
            </svg>
            {t("downloadPdf")}
          </a>
        </div>

        <ol className="border-y border-[var(--color-line)]">
          {SLOTS.map((slot, i) => (
            <Row
              key={`${slot.kind}-${slot.start}-${i}`}
              slot={slot}
              locale={locale}
            />
          ))}
        </ol>

        <div className="mt-10 md:mt-12">
          <Totals locale={locale} />
        </div>
      </div>
    </section>
  );
}

function Row({ slot, locale }: { slot: Slot; locale: "kk" | "en" }) {
  const duration = formatDuration(slotDurationMinutes(slot), locale);
  const isRed = RED_KINDS.has(slot.kind);
  const accent = isRed
    ? "border-l-[var(--color-red)] bg-white/[0.02]"
    : "border-l-[var(--color-line)]";
  const timeClass = `font-mono text-xs tabular-nums md:text-sm ${
    isRed ? "text-[var(--color-red)]" : "text-[var(--color-fg-muted)]"
  }`;
  const durationClass = `shrink-0 font-mono text-[11px] uppercase tabular-nums tracking-wider md:text-xs ${
    isRed ? "text-[var(--color-red)]" : "text-[var(--color-fg-muted)]"
  }`;

  if (slot.kind === "talk") {
    const speaker = event.speakers.find((s) => s.slug === slot.speakerSlug);
    if (!speaker) return null;
    return (
      <li className="border-t border-[var(--color-line)] first:border-t-0">
        <a
          href={`/speakers/${slot.speakerSlug}`}
          className="group grid grid-cols-[100px_1fr_auto] items-center gap-3 border-l-2 border-[var(--color-line)] px-4 py-4 transition-colors hover:border-[var(--color-red)] hover:bg-white/[0.02] md:grid-cols-[140px_1fr_auto] md:gap-6 md:px-6 md:py-5"
        >
          <span className={timeClass}>
            {slot.start} — {slot.end}
          </span>
          <div className="min-w-0">
            <div className="font-display text-base font-bold leading-tight transition-colors group-hover:text-[var(--color-red)] md:text-lg">
              {speaker.name[locale]}
            </div>
            <div className="mt-0.5 truncate text-xs text-[var(--color-fg-muted)] md:text-sm">
              {speaker.title[locale]}
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tabular-nums tracking-wider text-[var(--color-fg-muted)] md:text-xs">
            {duration}
            <span
              aria-hidden
              className="text-sm transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-red)] md:text-base"
            >
              ↗
            </span>
          </span>
        </a>
      </li>
    );
  }

  const icon =
    slot.kind === "coffee"
      ? "☕"
      : slot.kind === "lunch"
      ? "🍽"
      : slot.kind === "music"
      ? "🎤"
      : null;
  const host =
    slot.kind === "open" || slot.kind === "close" ? slot.host : null;

  return (
    <li className="border-t border-[var(--color-line)] first:border-t-0">
      <div
        className={`grid grid-cols-[100px_1fr_auto] items-center gap-3 border-l-2 px-4 py-3.5 md:grid-cols-[140px_1fr_auto] md:gap-6 md:px-6 md:py-4 ${accent}`}
      >
        <span className={timeClass}>
          {slot.start} — {slot.end}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide md:text-base">
            {icon && (
              <span aria-hidden className="text-base md:text-lg">
                {icon}
              </span>
            )}
            <span className="truncate">{slot.summary[locale]}</span>
          </div>
          {host && (
            <div className="mt-0.5 truncate text-xs text-[var(--color-red)] md:text-sm">
              {host}
            </div>
          )}
        </div>
        <span className={durationClass}>{duration}</span>
      </div>
    </li>
  );
}

function Totals({ locale }: { locale: "kk" | "en" }) {
  const t = useTranslations("schedule");
  const rows: Array<[string, string]> = [
    [t("totalTalks"), formatDuration(135, locale)],
    [t("totalQa"), formatDuration(30, locale)],
    [t("totalPerformance"), formatDuration(10, locale)],
    [t("totalCoffeeLunch"), formatDuration(100, locale)],
    [t("totalRegistration"), formatDuration(120, locale)],
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-6 bg-[var(--color-red)]" aria-hidden />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-red)] md:text-xs">
          {t("totalLabel")}
        </span>
      </div>
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-dotted border-[var(--color-line)] pb-2 text-sm"
          >
            <dt className="text-[var(--color-fg-muted)]">{label}</dt>
            <dd className="font-mono tabular-nums">{value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 pt-1 text-sm font-semibold">
          <dt>{t("totalWindow")}</dt>
          <dd className="font-mono tabular-nums text-[var(--color-red)]">
            10:00 — 16:00
          </dd>
        </div>
      </dl>
    </div>
  );
}

