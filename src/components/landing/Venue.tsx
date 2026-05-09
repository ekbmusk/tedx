import { getTranslations } from "next-intl/server";
import { event, eventMapUrl } from "@/config/event";

export async function Venue({
  locale,
  buyHref,
}: {
  locale: "kk" | "en";
  buyHref: string;
}) {
  const t = await getTranslations("venue");
  const buyLabel = await getTranslations("hero");

  return (
    <section
      id="venue"
      className="relative overflow-hidden border-b border-[var(--color-line)] bg-[var(--color-bg-soft)] py-16 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] md:text-xs">
          04
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">
          {t("title")}
        </h2>

        <dl className="mt-8 grid gap-px bg-[var(--color-line)] md:mt-12 md:grid-cols-3">
          <Cell label={t("dateLabel")} value={event.dateLabel[locale]} />
          <Cell
            label={t("venueLabel")}
            value={event.venue[locale]}
            href={eventMapUrl()}
          />
          <Cell
            label={t("cityLabel")}
            value={event.city[locale]}
            href={eventMapUrl()}
          />
        </dl>

        <div className="mt-8 md:mt-12">
          <a
            href={buyHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-red)] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[var(--color-red-deep)] sm:w-auto"
          >
            {buyLabel("ctaPrimary")} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Cell({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const Inner = (
    <>
      <dt className="text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] md:text-xs">
        {label}
      </dt>
      <dd className="mt-2 flex items-center gap-2 font-display text-xl font-bold md:mt-3 md:text-3xl">
        {value}
        {href && (
          <span
            aria-hidden
            className="text-base text-[var(--color-fg-muted)] transition-colors group-hover:text-[var(--color-red)] md:text-xl"
          >
            ↗
          </span>
        )}
      </dd>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group block bg-[var(--color-bg)] p-6 transition-colors hover:bg-white/[0.02] md:p-8"
      >
        {Inner}
      </a>
    );
  }

  return <div className="bg-[var(--color-bg)] p-6 md:p-8">{Inner}</div>;
}
