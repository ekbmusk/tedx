// Public calendar invite for TEDxZhenysPark.
// Same .ics for everyone — event date/venue are global, not ticket-specific.
export const runtime = "nodejs";

const PRODID = "-//TEDxZhenysPark//Event//EN";

// Asia/Almaty is UTC+5 year-round (no DST).
// 30 May 2026 — registration 08:00, start 10:00, assume end 16:00 local = 11:00 UTC.
const DTSTART = "20260530T050000Z";
const DTEND = "20260530T110000Z";
const NOW = "20260510T000000Z";

export async function GET() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:tedxzhenyspark-2026@tedx.kz",
    `DTSTAMP:${NOW}`,
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
      "Content-Disposition": 'attachment; filename="tedxzhenyspark.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
