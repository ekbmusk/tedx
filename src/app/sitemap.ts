import type { MetadataRoute } from "next";
import { event } from "@/config/event";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.tedx.kz";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: { kk: `${BASE}/`, en: `${BASE}/en` } },
    },
    {
      url: `${BASE}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const speakers: MetadataRoute.Sitemap = event.speakers.flatMap((s) => [
    {
      url: `${BASE}/speakers/${s.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/en/speakers/${s.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]);

  return [...home, ...speakers];
}
