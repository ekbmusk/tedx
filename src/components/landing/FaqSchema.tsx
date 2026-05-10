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

/**
 * FAQPage JSON-LD. Tells Google we have a real Q&A section so it can
 * surface answers as "People also ask" rich results in search.
 *
 * https://schema.org/FAQPage
 */
export async function FaqSchema({ locale }: { locale: "kk" | "en" }) {
  const t = await getTranslations({ locale, namespace: "faq" });
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QUESTION_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`items.${key}.q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`items.${key}.a`),
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
