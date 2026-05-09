import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { event, buildBuyTicketLink } from "@/config/event";
import { routing } from "@/i18n/routing";
import { SocialLinks } from "@/components/landing/SocialLinks";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    event.speakers.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "kk" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  const speaker = event.speakers.find((s) => s.slug === slug);
  if (!speaker) return {};
  return {
    title: `${speaker.name[locale]} — TEDxZhenysPark`,
    description: speaker.title[locale],
  };
}

export default async function SpeakerPage({
  params,
}: {
  params: Promise<{ locale: "kk" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const speaker = event.speakers.find((s) => s.slug === slug);
  if (!speaker) notFound();

  const t = await getTranslations("speakers");
  const tHero = await getTranslations("hero");
  const buyHref = buildBuyTicketLink(locale);
  const index = event.speakers.findIndex((s) => s.slug === slug);

  return (
    <main className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      {/* Top bar */}
      <header className="border-b border-[var(--color-line)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-10 md:py-4">
          <Link href="/" className="flex items-center">
            <img
              src="/brand/wordmark.svg"
              alt="TEDxZhenysPark"
              className="h-5 w-auto md:h-6"
            />
          </Link>
          <Link
            href="/#speakers"
            className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)] hover:text-white"
          >
            ← {t("back")}
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 py-8 md:px-10 md:py-16">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:gap-12">
          {/* Photo */}
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--color-line)] bg-[var(--color-bg-soft)]">
            {speaker.photoUrl && (
              <Image
                src={speaker.photoUrl}
                alt={speaker.name[locale]}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
            <div className="absolute left-3 top-3 rounded-sm bg-[var(--color-red)] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {String(index + 1).padStart(2, "0")} / 0{event.speakers.length}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] md:text-xs">
              {t("title")}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] md:text-5xl">
              {speaker.name[locale]}
            </h1>
            <p className="mt-3 text-base font-medium text-[var(--color-fg)]/80 md:text-lg">
              {speaker.title[locale]}
            </p>

            {speaker.bio && (
              <p className="mt-6 text-base leading-relaxed text-[var(--color-fg-muted)] md:text-lg">
                {speaker.bio[locale]}
              </p>
            )}

            {speaker.socials && speaker.socials.length > 0 && (
              <div className="mt-8">
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[var(--color-fg-muted)] md:text-xs">
                  {locale === "kk" ? "Әлеуметтік желілер" : "Find them online"}
                </p>
                <SocialLinks links={speaker.socials} />
              </div>
            )}

            {speaker.brands && speaker.brands.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] md:text-xs">
                  {locale === "kk" ? "Бренд елшісі" : "Brand ambassador"}
                </p>
                <SocialLinks links={speaker.brands} />
              </div>
            )}

            <div className="mt-8 border-t border-[var(--color-line)] pt-6">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] md:text-xs">
                {locale === "kk" ? "Күні және орны" : "Date & venue"}
              </p>
              <p className="mt-2 font-display text-lg font-bold md:text-xl">
                {event.dateLabel[locale]} · {event.venue[locale]},{" "}
                {event.city[locale]}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <a
                href={buyHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-red)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-red-deep)]"
              >
                {tHero("ctaPrimary")} <span aria-hidden>→</span>
              </a>
              <Link
                href="/#speakers"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white"
              >
                {t("allSpeakers")}
              </Link>
            </div>
          </div>
        </div>

        {/* Other speakers strip */}
        <section className="mt-16 border-t border-[var(--color-line)] pt-12">
          <p className="px-1 text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] md:text-xs">
            {t("title")}
          </p>
          <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {event.speakers
              .filter((s) => s.slug !== slug)
              .map((s, i) => (
                <Link
                  key={s.slug}
                  href={`/speakers/${s.slug}`}
                  className="group w-[60%] shrink-0 snap-start sm:w-[40%] md:w-[28%]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden border border-[var(--color-line)] bg-[var(--color-bg-soft)]">
                    {s.photoUrl && (
                      <Image
                        src={s.photoUrl}
                        alt={s.name[locale]}
                        fill
                        sizes="(max-width: 640px) 60vw, 28vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <p className="mt-2 font-display text-sm font-bold leading-tight transition-colors group-hover:text-[var(--color-red)]">
                    {s.name[locale]}
                  </p>
                  <p className="text-xs text-[var(--color-fg-muted)]">
                    0{i + 1}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      </article>
    </main>
  );
}
