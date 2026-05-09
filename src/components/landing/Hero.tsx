import { getTranslations } from "next-intl/server";
import { event, eventMapUrl } from "@/config/event";

export async function Hero({
  locale,
  buyHref,
}: {
  locale: "kk" | "en";
  buyHref: string;
}) {
  const t = await getTranslations("hero");

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-line)] pb-16 pt-28 md:pb-24 md:pt-52">
      {/* hero background photo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url(/hero-bg.jpg)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/60 via-[var(--color-bg)]/85 to-[var(--color-bg)]"
      />
      {/* background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* red glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-[var(--color-red)] opacity-20 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-10">
        <p className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[var(--color-fg-muted)] md:mb-8 md:gap-4 md:text-xs">
          <img
            src="/brand/wordmark.svg"
            alt="TEDxZhenysPark"
            className="h-4 w-auto md:h-5"
          />
          <span aria-hidden>·</span>
          <span>{event.city[locale]}</span>
        </p>

        <h1 className="font-display text-[15vw] font-black uppercase leading-[0.88] md:text-[180px]">
          <span className="block text-white">{event.theme[locale]}</span>
        </h1>

        <div className="mt-8 flex flex-col gap-6 md:mt-12 md:grid md:grid-cols-[1.2fr_1fr] md:gap-16">
          <p className="max-w-xl text-base leading-relaxed text-[var(--color-fg-muted)] md:text-xl">
            {event.themeDescription[locale]}
          </p>
          <div className="flex flex-col items-start gap-5">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] md:text-xs">
                {locale === "kk" ? "Күні және орны" : "Date & venue"}
              </span>
              <span className="mt-1.5 font-display text-xl font-bold text-white md:text-3xl">
                {event.dateLabel[locale]}
              </span>
              <a
                href={eventMapUrl()}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--color-fg-muted)] underline decoration-[var(--color-line)] decoration-1 underline-offset-4 transition-colors hover:text-[var(--color-red)] hover:decoration-[var(--color-red)] md:text-base"
              >
                {event.venue[locale]}, {event.city[locale]}
                <span aria-hidden className="text-[var(--color-fg-muted)]">↗</span>
              </a>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
              <a
                href={buyHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-red)] px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-red-deep)]"
              >
                {t("ctaPrimary")}
                <span aria-hidden>→</span>
              </a>
              <a
                href="#speakers"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-7 py-3 text-base font-semibold text-white transition-colors hover:border-white"
              >
                {t("ctaSecondary")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
