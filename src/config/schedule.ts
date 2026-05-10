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
      kind:
        | "registration"
        | "open"
        | "close"
        | "coffee"
        | "lunch"
        | "qa"
        | "music";
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
    end: "10:05",
    summary: { kk: "Ашылу", en: "Opening" },
  },
  { kind: "talk", start: "10:05", end: "10:20", speakerSlug: "nazym-zhangazy" },
  { kind: "talk", start: "10:22", end: "10:37", speakerSlug: "ardan-galymuly" },
  {
    kind: "talk",
    start: "10:39",
    end: "10:54",
    speakerSlug: "aigerim-kusayinkyzy",
  },
  {
    kind: "qa",
    start: "10:54",
    end: "11:04",
    summary: { kk: "Q&A · 1–3 спикерлер", en: "Q&A · speakers 1–3" },
  },
  {
    kind: "coffee",
    start: "11:04",
    end: "11:50",
    summary: { kk: "Кофе-брейк", en: "Coffee break" },
  },
  { kind: "talk", start: "11:50", end: "12:05", speakerSlug: "kultay-adilova" },
  { kind: "talk", start: "12:07", end: "12:22", speakerSlug: "orken-kenzhebek" },
  { kind: "talk", start: "12:24", end: "12:39", speakerSlug: "aliya-ospanova" },
  {
    kind: "qa",
    start: "12:39",
    end: "12:49",
    summary: { kk: "Q&A · 4–6 спикерлер", en: "Q&A · speakers 4–6" },
  },
  {
    kind: "music",
    start: "12:50",
    end: "13:00",
    summary: {
      kk: "Анвар · музыкалық қойылым",
      en: "Anvar · musical performance",
    },
  },
  {
    kind: "lunch",
    start: "13:00",
    end: "14:30",
    summary: { kk: "Түскі ас", en: "Lunch" },
  },
  {
    kind: "talk",
    start: "14:30",
    end: "14:45",
    speakerSlug: "sholpan-abdikhalikova",
  },
  {
    kind: "talk",
    start: "14:47",
    end: "15:02",
    speakerSlug: "inara-namazbayeva",
  },
  { kind: "talk", start: "15:04", end: "15:19", speakerSlug: "ayat-azimov" },
  {
    kind: "qa",
    start: "15:19",
    end: "15:29",
    summary: { kk: "Q&A · 7–9 спикерлер", en: "Q&A · speakers 7–9" },
  },
  {
    kind: "close",
    start: "15:29",
    end: "15:49",
    summary: { kk: "Жабылу · ортақ фото", en: "Closing · group photo" },
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
