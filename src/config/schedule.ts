// Single source of truth for the day's programme.
// Consumed by:
//   - /calendar.ics route — emits VEVENTs with a "${kk} · ${en}" summary
//   - <Schedule/> landing section — renders the bilingual timeline list
// Times are "HH:MM" Asia/Almaty (UTC+5, no DST).

export type Slot =
  | {
      kind: "talk";
      start: string;
      end: string;
      speakerSlug: string;
    }
  | {
      kind: "open" | "close";
      start: string;
      end: string;
      summary: { kk: string; en: string };
      host: string;
    }
  | {
      kind: "registration" | "coffee" | "lunch" | "qa" | "music";
      start: string;
      end: string;
      summary: { kk: string; en: string };
    };

// Public agenda. Excludes private operational slots (2-min transitions
// between talks, post-closing buffer, private dinner for the team).
export const SLOTS: Slot[] = [
  {
    kind: "registration",
    start: "08:00",
    end: "10:00",
    summary: { kk: "Тіркелу", en: "Registration" },
  },
  {
    kind: "open",
    start: "10:00",
    end: "10:10",
    summary: { kk: "Ашылу сөзі", en: "Opening Remarks" },
    host: "Payayeva Symbat",
  },
  { kind: "talk", start: "10:15", end: "10:30", speakerSlug: "nazym-zhangazy" },
  { kind: "talk", start: "10:35", end: "10:50", speakerSlug: "ardan-galymuly" },
  {
    kind: "talk",
    start: "10:55",
    end: "11:10",
    speakerSlug: "aigerim-kusayinkyzy",
  },
  {
    kind: "qa",
    start: "11:15",
    end: "11:25",
    summary: { kk: "Q&A · 1–3 спикерлер", en: "Q&A · speakers 1–3" },
  },
  {
    kind: "coffee",
    start: "11:30",
    end: "12:00",
    summary: { kk: "Кофе-брейк", en: "Coffee break" },
  },
  { kind: "talk", start: "12:05", end: "12:20", speakerSlug: "kultay-adilova" },
  { kind: "talk", start: "12:25", end: "12:40", speakerSlug: "orken-kenzhebek" },
  { kind: "talk", start: "12:45", end: "13:00", speakerSlug: "aliya-ospanova" },
  {
    kind: "qa",
    start: "13:00",
    end: "13:10",
    summary: { kk: "Q&A · 4–6 спикерлер", en: "Q&A · speakers 4–6" },
  },
  {
    kind: "music",
    start: "13:10",
    end: "13:20",
    summary: {
      kk: "Анвар · 2 ән",
      en: "Anvar · 2 Songs",
    },
  },
  {
    kind: "lunch",
    start: "13:20",
    end: "14:30",
    summary: { kk: "Түскі ас", en: "Lunch" },
  },
  {
    kind: "talk",
    start: "14:35",
    end: "14:50",
    speakerSlug: "sholpan-abdikhalikova",
  },
  {
    kind: "talk",
    start: "14:55",
    end: "15:10",
    speakerSlug: "inara-namazbayeva",
  },
  { kind: "talk", start: "15:15", end: "15:30", speakerSlug: "ayat-azimov" },
  {
    kind: "qa",
    start: "15:30",
    end: "15:40",
    summary: { kk: "Q&A · 7–9 спикерлер", en: "Q&A · speakers 7–9" },
  },
  {
    kind: "close",
    start: "15:40",
    end: "16:00",
    summary: { kk: "Қорытынды сөз", en: "Closing Remarks" },
    host: "Payayeva Symbat",
  },
];

export function slotDurationMinutes(slot: Slot): number {
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  return toMin(slot.end) - toMin(slot.start);
}

export function formatDuration(min: number, locale: "kk" | "en"): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const hUnit = locale === "kk" ? "сағ" : "h";
  const mUnit = locale === "kk" ? "мин" : "min";
  if (h && !m) return `${h} ${hUnit}`;
  if (h && m) return `${h} ${hUnit} ${m} ${mUnit}`;
  return `${m} ${mUnit}`;
}
