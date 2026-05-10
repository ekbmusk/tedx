import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Theme } from "@/components/landing/Theme";
import { Speakers } from "@/components/landing/Speakers";
import { Schedule } from "@/components/landing/Schedule";
import { ForumPhotos } from "@/components/landing/ForumPhotos";
import { Venue } from "@/components/landing/Venue";
import { Footer } from "@/components/landing/Footer";
import { EventSchema } from "@/components/landing/EventSchema";
import { buildBuyTicketLink, event } from "@/config/event";

const META_KK = {
  title: `TEDxZhenysPark 2026 — Жаңғыру | ${event.dateLabel.kk}, ${event.city.kk}`,
  description:
    "Түркістандағы алғашқы облыстық деңгейдегі TEDx-конференция. 9 спикер, бір сахна, жаңғыру идеясы. 30 мамыр 2026, Karavansaray Arena.",
};
const META_EN = {
  title: `TEDxZhenysPark 2026 — Renewal | ${event.dateLabel.en}, ${event.city.en}`,
  description:
    "The first regional-level TEDx conference in Türkistan. 9 speakers, one stage, ideas of renewal. May 30, 2026 at Karavansaray Arena.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "kk" | "en" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const m = locale === "en" ? META_EN : META_KK;
  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: locale === "en" ? "/en" : "/",
      languages: { kk: "/", en: "/en" },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      type: "website",
      locale: locale === "en" ? "en_US" : "kk_KZ",
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "kk" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const buyHref = buildBuyTicketLink(locale);

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-fg)]">
      <EventSchema locale={locale} />
      <Nav buyHref={buyHref} />
      <Hero locale={locale} buyHref={buyHref} />
      <About />
      <Theme />
      <Speakers locale={locale} />
      <Schedule locale={locale} />
      <ForumPhotos locale={locale} />
      <Venue locale={locale} buyHref={buyHref} />
      <Footer />
    </main>
  );
}
