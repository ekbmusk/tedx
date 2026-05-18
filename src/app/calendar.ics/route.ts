// Public calendar invite for TEDxZhenysPark.
// Subscription feed: calendar apps that add this URL via webcal://
// re-poll every few hours and pick up changes automatically. Bump
// CALENDAR_SEQUENCE whenever schedule details change.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODID = "-//TEDxZhenysPark//Event//EN";

// Increment whenever a slot time/title changes. Calendar clients use
// SEQUENCE to decide whether to overwrite the local copy (RFC 5545).
const CALENDAR_SEQUENCE = 7;

// 30 May 2026 (Asia/Almaty UTC+5, no DST → straight subtract 5h).
const EVENT_DATE_UTC = "20260530";

function utc(localHHMM: string): string {
  const [h, m] = localHHMM.split(":").map(Number);
  const utcH = (h - 5 + 24) % 24;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${EVENT_DATE_UTC}T${pad(utcH)}${pad(m)}00Z`;
}

function dtstamp(d = new Date()) {
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
  const now = dtstamp();
  const LOCATION = "Karavansaray Arena\\, Türkistan\\, Kazakhstan";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:TEDxZhenysPark",
    "X-WR-CALDESC:TEDxZhenysPark — Жаңғыру / Renewal",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  // Registration window before doors close at 10:00.
  lines.push(
    "BEGIN:VEVENT",
    "UID:tedxzhenyspark-2026-registration@tedx.kz",
    `DTSTAMP:${now}`,
    `SEQUENCE:${CALENDAR_SEQUENCE}`,
    `DTSTART:${utc("08:00")}`,
    `DTEND:${utc("10:00")}`,
    "SUMMARY:Тіркелу · Registration · TEDxZhenysPark",
    "DESCRIPTION:Doors open at 08:00. Please arrive early to collect your badge.",
    `LOCATION:${LOCATION}`,
    "URL:https://www.tedx.kz/",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
  );

  // Forum itself.
  lines.push(
    "BEGIN:VEVENT",
    "UID:tedxzhenyspark-2026@tedx.kz",
    `DTSTAMP:${now}`,
    `SEQUENCE:${CALENDAR_SEQUENCE}`,
    `DTSTART:${utc("10:00")}`,
    `DTEND:${utc("16:00")}`,
    "SUMMARY:TEDxZhenysPark · Жаңғыру / Renewal",
    "DESCRIPTION:TED-licensed conference in Türkistan. Theme: Renewal. Talks 10:00–16:00.",
    `LOCATION:${LOCATION}`,
    "URL:https://www.tedx.kz/",
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
  );

  lines.push("END:VCALENDAR");
  const ics = lines.join("\r\n") + "\r\n";

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
