import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";
import { event } from "@/config/event";

export const alt = "TEDxZhenysPark speaker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tedx.kz"
).replace(/\/$/, "");

async function readFont() {
  return fs.readFile(
    path.join(process.cwd(), "src/assets/Inter-Bold.otf"),
  );
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ locale: "kk" | "en"; slug: string }>;
}) {
  const { slug } = await params;
  const speaker = event.speakers.find((s) => s.slug === slug);
  if (!speaker) return [];
  return [{ id: slug, alt: `TEDxZhenysPark · ${speaker.name.kk}` }];
}

export default async function SpeakerOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: "kk" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  const speaker = event.speakers.find((s) => s.slug === slug);
  if (!speaker) {
    // Fallback — should not happen because the route is generateStaticParams'd.
    return new Response("not found", { status: 404 });
  }

  const fontData = await readFont();
  const photoUrl = speaker.photoUrl ? `${SITE}${speaker.photoUrl}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#050505",
          color: "#f5f5f5",
          fontFamily: "InterBold",
        }}
      >
        {/* Left: portrait */}
        <div
          style={{
            width: 480,
            display: "flex",
            background: "linear-gradient(135deg, #1a0a08 0%, #0d0d0d 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              width={480}
              height={630}
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 200,
                fontWeight: 900,
                color: "rgba(255,255,255,0.1)",
              }}
            >
              {speaker.name[locale].split(" ").slice(0, 2).map((s) => s[0]).join("")}
            </div>
          )}
        </div>

        {/* Right: text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "70px 60px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                color: "#e62b1e",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: -1,
              }}
            >
              TEDx
            </span>
            <span style={{ fontSize: 28, fontWeight: 900, marginLeft: 2 }}>
              ZhenysPark
            </span>
          </div>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 16,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#e62b1e",
                marginBottom: 16,
              }}
            >
              {locale === "kk" ? "Спикер · Speaker" : "Speaker"}
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -2,
              }}
            >
              {speaker.name[locale]}
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#a0a0a0",
                marginTop: 24,
                lineHeight: 1.35,
              }}
            >
              {speaker.title[locale]}
            </div>
          </div>

          <div
            style={{
              marginTop: 50,
              paddingTop: 24,
              borderTop: "1px solid #1f1f1f",
              fontSize: 16,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#666",
            }}
          >
            {event.dateLabel[locale]} · {event.city[locale]}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "InterBold",
          data: fontData,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
