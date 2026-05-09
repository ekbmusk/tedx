import { getTranslations } from "next-intl/server";

export async function About() {
  const t = await getTranslations("about");
  return (
    <section
      id="about"
      className="border-b border-[var(--color-line)] py-16 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-[1fr_2fr] md:gap-20 md:px-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] md:text-xs">
            01
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-5xl">
            {t("title")}
          </h2>
        </div>
        <p className="text-base leading-relaxed text-[var(--color-fg-muted)] md:text-xl">
          {t("body")}
        </p>
      </div>
    </section>
  );
}
