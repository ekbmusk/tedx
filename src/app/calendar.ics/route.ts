// Public calendar invite for TEDxZhenysPark.
// Subscription feed: calendar apps that add this URL via webcal://
// re-poll every few hours and pick up changes automatically. Bump
// CALENDAR_SEQUENCE whenever schedule details change.
import { event } from "@/config/event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODID = "-//TEDxZhenysPark//Event//EN";

// Increment whenever a slot time/title changes. Calendar clients use
// SEQUENCE to decide whether to overwrite the local copy (RFC 5545).
const CALENDAR_SEQUENCE = 1;

// 30 May 2026 (Asia/Almaty UTC+5, no DST → straight subtract 5h).
const EVENT_DATE_UTC = "20260530";

function utc(localHHMM: string): string {
  const [h, m] = localHHMM.split(":").map(Number);
  const utcH = (h - 5 + 24) % 24;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${EVENT_DATE_UTC}T${pad(utcH)}${pad(m)}00Z`;
}

type Slot =
  | {
      kind: "talk";
      start: string;
      end: string;
      speakerSlug: string;
    }
  | {
      kind:
        | "registration"
        | "open"
        | "close"
        | "coffee"
        | "lunch"
        | "networking"
        | "break"
        | "panel";
      start: string;
      end: string;
      summary: string;
    };

// Public agenda. Excludes private operational slots (2-min transitions
// between talks, panel prep, post-closing buffer, private lunch/dinner
// for the team) — only what attendees should see in their calendar.
const SLOTS: Slot[] = [
  {
    kind: "registration",
    start: "08:00",
    end: "10:00",
    summary: "Тіркелу · Registration",
  },
  {
    kind: "open",
    start: "10:00",
    end: "10:05",
    summary: "Ашылу · Opening",
  },
  { kind: "talk", start: "10:05", end: "10:21", speakerSlug: "nazym-zhangazy" },
  {
    kind: "talk",
    start: "10:23",
    end: "10:41",
    speakerSlug: "ardan-galymuly",
  },
  {
    kind: "talk",
    start: "10:43",
    end: "10:59",
    speakerSlug: "aigerim-kusayinkyzy",
  },
  {
    kind: "coffee",
    start: "11:00",
    end: "11:30",
    summary: "Кофе-брейк · Coffee break",
  },
  {
    kind: "talk",
    start: "11:30",
    end: "11:46",
    speakerSlug: "kultay-adilova",
  },
  {
    kind: "talk",
    start: "11:48",
    end: "12:04",
    speakerSlug: "orken-kenzhebek",
  },
  {
    kind: "talk",
    start: "12:06",
    end: "12:22",
    speakerSlug: "aliya-ospanova",
  },
  {
    kind: "networking",
    start: "12:22",
    end: "13:00",
    summary: "Нетворкинг · Networking",
  },
  {
    kind: "lunch",
    start: "13:00",
    end: "14:00",
    summary: "Обед · Lunch break",
  },
  {
    kind: "break",
    start: "14:00",
    end: "15:30",
    summary: "Свободное время · Free time",
  },
  {
    kind: "talk",
    start: "15:30",
    end: "15:46",
    speakerSlug: "inara-namazbayeva",
  },
  { kind: "talk", start: "15:48", end: "16:06", speakerSlug: "ayat-azimov" },
  {
    kind: "panel",
    start: "16:10",
    end: "17:10",
    summary: "Q&A панель · Q&A panel",
  },
  {
    kind: "close",
    start: "17:10",
    end: "17:30",
    summary: "Жабылу · Closing",
  },
];

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

function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function speakerEvent(slug: string): { summary: string; description: string } {
  const s = event.speakers.find((x) => x.slug === slug);
  if (!s) return { summary: slug, description: "" };
  return {
    summary: s.name.kk,
    description: `${s.name.en} — ${s.title.kk} / ${s.title.en}`,
  };
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

  // Container event spanning the full programme. TRANSP:TRANSPARENT so
  // the user's calendar still shows individual slot events on top
  // without "double-booking" their busy state.
  lines.push(
    "BEGIN:VEVENT",
    "UID:tedxzhenyspark-2026@tedx.kz",
    `DTSTAMP:${now}`,
    `SEQUENCE:${CALENDAR_SEQUENCE}`,
    `DTSTART:${utc("10:00")}`,
    `DTEND:${utc("17:30")}`,
    "SUMMARY:TEDxZhenysPark · Жаңғыру / Renewal",
    "DESCRIPTION:TED-licensed conference in Türkistan. Theme: Renewal. Doors open 08:00\\, talks start 10:00\\, closing 17:30.",
    `LOCATION:${LOCATION}`,
    "URL:https://www.tedx.kz/",
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  );

  // Per-slot events. Each gets a stable UID so reschedules update the
  // existing entry in subscribers' calendars instead of duplicating.
  for (const slot of SLOTS) {
    let summary: string;
    let description: string;
    let uidSuffix: string;

    if (slot.kind === "talk") {
      const s = speakerEvent(slot.speakerSlug);
      summary = s.summary;
      description = s.description;
      uidSuffix = `talk-${slot.speakerSlug}`;
    } else {
      summary = slot.summary;
      description = "";
      uidSuffix = `${slot.kind}-${slot.start.replace(":", "")}`;
    }

    lines.push(
      "BEGIN:VEVENT",
      `UID:tedxzhenyspark-2026-${uidSuffix}@tedx.kz`,
      `DTSTAMP:${now}`,
      `SEQUENCE:${CALENDAR_SEQUENCE}`,
      `DTSTART:${utc(slot.start)}`,
      `DTEND:${utc(slot.end)}`,
      `SUMMARY:${escapeIcs(summary)}`,
    );
    if (description) {
      lines.push(`DESCRIPTION:${escapeIcs(description)}`);
    }
    lines.push(
      `LOCATION:${LOCATION}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

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
