import { getTranslations } from "next-intl/server";
import { event } from "@/config/event";
import { SpeakerCard } from "./SpeakerCard";

export async function Speakers({ locale }: { locale: "kk" | "en" }) {
  const t = await getTranslations("speakers");
  const swipeHint = locale === "kk" ? "← сырғытыңыз →" : "← swipe →";

  return (
    <section
      id="speakers"
      className="border-b border-[var(--color-line)] py-20 md:py-32"
    >
      <div className="mx-auto max-w-7xl md:px-10">
        <div className="mb-8 flex items-end justify-between px-5 md:mb-12 md:px-0">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-red)]">
              03
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-fg-muted)] md:text-base">
              {t("subtitle")}
            </p>
          </div>
          <span className="font-display text-4xl font-black text-white/10 md:text-6xl">
            0{event.speakers.length}
          </span>
        </div>

        {/* Mobile: snap rail with peek */}
        <div className="md:hidden">
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
            {event.speakers.map((s, i) => (
              <div
                key={s.slug}
                className="w-[78%] shrink-0 snap-start last:pr-2"
              >
                <SpeakerCard speaker={s} locale={locale} index={i} />
              </div>
            ))}
          </div>
          <p className="mt-4 px-5 text-center text-[11px] uppercase tracking-[0.3em] text-[var(--color-fg-muted)]">
            {swipeHint}
          </p>
        </div>

        {/* Desktop: grid */}
        <div className="hidden grid-cols-2 gap-px bg-[var(--color-line)] md:grid md:grid-cols-3 lg:grid-cols-4">
          {event.speakers.map((s, i) => (
            <SpeakerCard key={s.slug} speaker={s} locale={locale} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
