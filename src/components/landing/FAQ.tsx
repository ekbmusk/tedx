import { getTranslations } from "next-intl/server";

const QUESTION_KEYS = [
  "tedx",
  "buyTicket",
  "language",
  "schedule",
  "dressCode",
  "kids",
  "parking",
  "refund",
] as const;

export async function FAQ() {
  const t = await getTranslations("faq");

  return (
    <section
      id="faq"
      className="border-b border-[var(--color-line)] py-16 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-[1fr_2fr] md:gap-20 md:px-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] md:text-xs">
            05
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-xs text-sm text-[var(--color-fg-muted)] md:text-base">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-col">
          {QUESTION_KEYS.map((key) => (
            <details
              key={key}
              className="group border-b border-[var(--color-line)] py-5 transition-colors first:border-t md:py-6"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-lg font-bold leading-snug md:text-xl">
                <span>{t(`items.${key}.q`)}</span>
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-2xl leading-none text-[var(--color-fg-muted)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-base leading-relaxed text-[var(--color-fg-muted)] md:text-lg">
                {t(`items.${key}.a`)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
