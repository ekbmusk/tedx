import { getTranslations } from "next-intl/server";

export async function Theme() {
  const t = await getTranslations("theme");
  return (
    <section
      id="theme"
      className="relative overflow-hidden border-b border-[var(--color-line)] bg-[var(--color-bg-soft)] py-16 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-[1fr_2fr] md:gap-20 md:px-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-red)] md:text-xs">
            02 · {t("subtitle")}
          </p>
          <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none md:text-7xl">
            {t("title")}
          </h2>
        </div>
        <p className="text-base leading-relaxed text-[var(--color-fg-muted)] md:text-xl">
          {t("body")}
        </p>
      </div>

      {/* marquee */}
      <div className="mt-12 overflow-hidden border-y border-[var(--color-line)] py-4 md:mt-16 md:py-6">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-display text-2xl font-black uppercase text-white/10 md:gap-12 md:text-5xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8 md:gap-12">
              {[
                "Жаңғыру",
                "·",
                "Renewal",
                "·",
                "Возрождение",
                "·",
                "Renaissance",
                "·",
                "Yenilenme",
                "·",
                "复兴",
                "·",
                "재생",
                "·",
              ].map((w, j) => (
                <span key={j}>{w}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* sponsors marquee */}
      <div className="overflow-hidden border-b border-[var(--color-line)] py-6 md:py-8">
        <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap md:gap-20">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12 md:gap-20">
              {SPONSORS.map((s) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt={s.alt}
                  className={`${s.className} w-auto opacity-80`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SPONSORS = [
  { src: "/sponsors/logo-2.svg", alt: "TEDx", className: "h-12 md:h-16" },
  { src: "/sponsors/simba.svg", alt: "Simba", className: "h-8 md:h-12" },
  { src: "/sponsors/dailyfood.jpg", alt: "Daily Food", className: "h-16 md:h-24 rounded-md" },
];
