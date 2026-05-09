import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Speaker } from "@/config/event";

export function SpeakerCard({
  speaker,
  locale,
  index,
}: {
  speaker: Speaker;
  locale: "kk" | "en";
  index: number;
}) {
  const initials = speaker.name[locale]
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
  const readMore = locale === "kk" ? "Толығырақ" : "Read more";

  return (
    <Link
      href={`/speakers/${speaker.slug}`}
      className="group relative block overflow-hidden border border-[var(--color-line)] bg-[var(--color-bg-soft)] transition-colors hover:border-[var(--color-red)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-bg)]">
        {speaker.photoUrl ? (
          <Image
            src={speaker.photoUrl}
            alt={speaker.name[locale]}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#111] to-[#1a1a1a]">
            <span className="font-display text-7xl font-black text-white/15">
              {initials}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 z-10 rounded-sm bg-[var(--color-red)] px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-bold leading-tight transition-colors group-hover:text-[var(--color-red)]">
            {speaker.name[locale]}
          </h3>
          <p className="text-sm leading-snug text-[var(--color-fg-muted)]">
            {speaker.title[locale]}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-red)] transition-all group-hover:gap-2">
          {readMore}
          <span aria-hidden className="text-base leading-none">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
