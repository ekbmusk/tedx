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

const HIDDEN_KINDS = new Set<Slot["kind"]>(["registration", "open", "close"]);

export function Schedule({ locale }: { locale: "kk" | "en" }) {
  const t = useTranslations("schedule");
  const hasTicket = useHasTicket();

  // SSR + visitors without a ticket: render nothing. Schedule is private
  // to ticket holders — keeping it out of the HTML entirely (vs. hidden
  // via CSS) prevents leaks via view-source and search crawlers.
  if (!hasTicket) return null;

  const visible = SLOTS.filter((s) => !HIDDEN_KINDS.has(s.kind));

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
          {visible.map((slot, i) => (
            <Row
              key={`${slot.kind}-${slot.start}-${i}`}
              slot={slot}
              locale={locale}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Row({ slot, locale }: { slot: Slot; locale: "kk" | "en" }) {
  const duration = formatDuration(slotDurationMinutes(slot), locale);

  if (slot.kind === "talk") {
    const speaker = event.speakers.find((s) => s.slug === slot.speakerSlug);
    if (!speaker) return null;
    return (
      <li className="border-t border-[var(--color-line)] first:border-t-0">
        <a
          href={`/speakers/${slot.speakerSlug}`}
          className="group grid grid-cols-[56px_1fr_auto] items-center gap-3 border-l-2 border-[var(--color-line)] px-4 py-4 transition-colors hover:border-[var(--color-red)] hover:bg-white/[0.02] md:grid-cols-[88px_1fr_auto] md:gap-6 md:px-6 md:py-5"
        >
          <span className="font-mono text-sm tabular-nums text-[var(--color-fg-muted)] md:text-base">
            {slot.start}
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

  const accent =
    slot.kind === "qa" || slot.kind === "music"
      ? "border-l-[var(--color-red)] bg-white/[0.02]"
      : "border-l-[var(--color-line)]";
  const icon =
    slot.kind === "coffee"
      ? "☕"
      : slot.kind === "lunch"
      ? "🍽"
      : slot.kind === "music"
      ? "🎤"
      : null;

  return (
    <li className="border-t border-[var(--color-line)] first:border-t-0">
      <div
        className={`grid grid-cols-[56px_1fr_auto] items-center gap-3 border-l-2 px-4 py-3.5 md:grid-cols-[88px_1fr_auto] md:gap-6 md:px-6 md:py-4 ${accent}`}
      >
        <span className="font-mono text-sm tabular-nums text-[var(--color-fg-muted)] md:text-base">
          {slot.start}
        </span>
        <div className="flex min-w-0 items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide md:text-base">
          {icon && (
            <span aria-hidden className="text-base md:text-lg">
              {icon}
            </span>
          )}
          <span className="truncate">{slot.summary[locale]}</span>
        </div>
        <span className="shrink-0 font-mono text-[11px] uppercase tabular-nums tracking-wider text-[var(--color-fg-muted)] md:text-xs">
          {duration}
        </span>
      </div>
    </li>
  );
}
