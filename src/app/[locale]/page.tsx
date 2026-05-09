import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Theme } from "@/components/landing/Theme";
import { Speakers } from "@/components/landing/Speakers";
import { ForumPhotos } from "@/components/landing/ForumPhotos";
import { Venue } from "@/components/landing/Venue";
import { Footer } from "@/components/landing/Footer";
import { EventSchema } from "@/components/landing/EventSchema";
import { buildBuyTicketLink } from "@/config/event";

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
      <ForumPhotos locale={locale} />
      <Venue locale={locale} buyHref={buyHref} />
      <Footer />
    </main>
  );
}
