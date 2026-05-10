import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";
import { event } from "@/config/event";

export const alt = "TEDxZhenysPark — Жаңғыру / Renewal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function readFont() {
  return fs.readFile(
    path.join(process.cwd(), "src/assets/Inter-Bold.otf"),
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: "kk" | "en" }>;
}) {
  const { locale } = await params;
  const fontData = await readFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "70px 80px",
          background:
            "radial-gradient(circle at 0% 0%, #2a0807 0%, #050505 50%, #050505 100%)",
          color: "#f5f5f5",
          fontFamily: "InterBold",
        }}
      >
        {/* Top row: brand + date pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#e62b1e", fontSize: 56, fontWeight: 900 }}>
              TEDx
            </span>
            <span style={{ fontSize: 56, fontWeight: 900, marginLeft: 4 }}>
              ZhenysPark
            </span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid #2a2a2a",
              fontSize: 18,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#a0a0a0",
            }}
          >
            {event.dateLabel[locale]}
          </div>
        </div>

        {/* Theme block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#e62b1e",
            }}
          >
            {locale === "kk" ? "Тақырып · Theme" : "Theme of 2026"}
          </div>
          <div
            style={{
              fontSize: 220,
              fontWeight: 900,
              lineHeight: 1,
              marginTop: 18,
              letterSpacing: -6,
            }}
          >
            {event.theme[locale]}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#a0a0a0",
              marginTop: 20,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            {locale === "kk"
              ? `${event.venue.kk}, ${event.city.kk}`
              : `${event.venue.en}, ${event.city.en}`}
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
