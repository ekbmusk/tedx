import { event, contacts } from "@/config/event";

/**
 * schema.org Event JSON-LD. Helps Google show a rich event card in search
 * results (date, location, organizer, performers).
 *
 * Reference: https://schema.org/Event
 */
export function EventSchema({ locale }: { locale: "kk" | "en" }) {
  const siteUrl = contacts.siteUrl.replace(/\/$/, "");
  const startISO = `${event.date}T10:00:00+05:00`; // Asia/Almaty
  const endISO = `${event.date}T16:00:00+05:00`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${event.name[locale]} — ${event.theme[locale]}`,
    description: event.themeDescription[locale],
    startDate: startISO,
    endDate: endISO,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.venue[locale],
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city[locale],
        addressCountry: "KZ",
      },
    },
    image: [`${siteUrl}/brand/wordmark.png`],
    organizer: {
      "@type": "Organization",
      name: "TEDxZhenysPark",
      url: siteUrl,
    },
    performer: event.speakers.map((s) => ({
      "@type": "Person",
      name: s.name[locale],
      jobTitle: s.title[locale],
      ...(s.photoUrl ? { image: `${siteUrl}${s.photoUrl}` } : {}),
    })),
    offers: {
      "@type": "Offer",
      url: siteUrl,
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
