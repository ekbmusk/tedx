// Public calendar invite for TEDxZhenysPark.
// Served as a subscription feed: calendar apps that add this URL via
// webcal:// will re-poll every few hours and pick up changes
// automatically. Bump CALENDAR_SEQUENCE whenever the event details
// change so existing subscribers see the update.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODID = "-//TEDxZhenysPark//Event//EN";

// Increment this whenever DTSTART, DTEND, LOCATION, or SUMMARY change.
// Calendar clients use SEQUENCE to decide whether to overwrite the local
// copy with the new one (per RFC 5545).
const CALENDAR_SEQUENCE = 0;

// Asia/Almaty is UTC+5 year-round (no DST).
// 30 May 2026 — registration 08:00, start 10:00, assume end 16:00 local = 11:00 UTC.
const DTSTART = "20260530T050000Z";
const DTEND = "20260530T110000Z";

function dtstamp(d = new Date()) {
  // Format: YYYYMMDDTHHMMSSZ
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

export async function GET() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:TEDxZhenysPark",
    "X-WR-CALDESC:TEDxZhenysPark — Жаңғыру / Renewal",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    "BEGIN:VEVENT",
    "UID:tedxzhenyspark-2026@tedx.kz",
    `DTSTAMP:${dtstamp()}`,
    `SEQUENCE:${CALENDAR_SEQUENCE}`,
    `DTSTART:${DTSTART}`,
    `DTEND:${DTEND}`,
    "SUMMARY:TEDxZhenysPark · Жаңғыру / Renewal",
    "DESCRIPTION:TED-licensed conference in Türkistan. Theme: Renewal. Doors open 08:00\\, talks start 10:00.",
    "LOCATION:Karavansaray Arena\\, Türkistan\\, Kazakhstan",
    "URL:https://www.tedx.kz/",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // iCal requires CRLF line endings.
  const ics = lines.join("\r\n") + "\r\n";

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // No Content-Disposition — let calendar apps subscribe / inline-render.
      // Most apps follow REFRESH-INTERVAL or use their own polling cadence.
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
