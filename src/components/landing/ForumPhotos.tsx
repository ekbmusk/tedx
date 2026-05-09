export function ForumPhotos({ locale }: { locale: "kk" | "en" }) {
  const title = locale === "kk" ? "Форумнан фотолар" : "Photos from the forum";
  const subtitle =
    locale === "kk"
      ? "Іс-шарадан кейін осында суреттер жүктеледі"
      : "Photos will appear here right after the event";
  const badge = locale === "kk" ? "Көп ұзамай" : "Coming soon";

  return (
    <section className="border-b border-[var(--color-line)] py-16 md:py-32">
      <div className="mx-auto max-w-7xl md:px-10">
        <div className="mb-8 flex items-end justify-between px-5 md:mb-12 md:px-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] md:text-xs">
              05
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-fg-muted)] md:text-base">
              {subtitle}
            </p>
          </div>
          <span className="hidden rounded-full border border-[var(--color-line)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--color-fg-muted)] md:inline-block">
            {badge}
          </span>
        </div>

        {/* Mobile: snap rail. Desktop: 4-col grid. */}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:grid md:grid-cols-4 md:gap-1 md:overflow-visible md:px-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <PhotoSkeleton key={i} index={i} badge={badge} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoSkeleton({ index, badge }: { index: number; badge: string }) {
  return (
    <div
      className="relative aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden border border-[var(--color-line)] bg-[var(--color-bg-soft)] md:w-auto"
      aria-hidden
    >
      {/* shimmering gradient */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.02] via-white/[0.05] to-white/[0.02]" />
      {/* corner index */}
      <div className="absolute left-3 top-3 rounded-sm border border-[var(--color-line)] bg-[var(--color-bg)]/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] backdrop-blur">
        {String(index + 1).padStart(2, "0")} / 04
      </div>
      {/* center camera glyph */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--color-fg-muted)]/40">
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span className="text-[10px] uppercase tracking-[0.3em]">{badge}</span>
      </div>
    </div>
  );
}
