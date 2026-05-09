import type { SocialKind, SocialLink } from "@/config/event";

const Icons: Record<SocialKind, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 22v-8h2.7l.4-3H13V9.2c0-.9.3-1.5 1.6-1.5H16V5c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2V11H7v3h2.4v8H13z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 2v3.2a4.6 4.6 0 0 0 3.5 1.4v3.1a7.7 7.7 0 0 1-3.5-1v6.7a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.2a2.6 2.6 0 1 0 1.7 2.4V2h3.1z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16.1 5 12 5 12 5s-4.1 0-7.1.1c-.4.1-1.3.1-2.1.9C2.2 6.6 2 8 2 8s-.2 1.7-.2 3.4v1.6c0 1.7.2 3.4.2 3.4s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.7.1 7.3.2 7.3.2s4.1 0 7.1-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.7.2-3.4v-1.6C22.2 9.7 22 8 22 8zM10 15V9l5 3-5 3z" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.7 3.3 2.6 10.7c-1 .4-1 1 0 1.3l4.6 1.4 1.8 5.6c.2.6.4.8.8.8.4 0 .5-.2.7-.5l2.4-2.3 4.7 3.5c.9.5 1.5.2 1.7-.8L22.7 4.6c.3-1.2-.4-1.7-1-1.3zM9.1 14.3l9.2-5.8c.4-.3.8-.1.5.2l-7.6 6.9-.3 3.1-1.8-4.4z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V9h3v10zM6.5 7.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM19 19h-3v-5.3c0-1.3-.5-2.2-1.7-2.2-.9 0-1.4.6-1.7 1.2-.1.2-.1.5-.1.8V19h-3V9h3v1.3c.4-.6 1.1-1.5 2.7-1.5 2 0 3.5 1.3 3.5 4V19z" />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
};

export function SocialLinks({
  links,
  variant = "list",
}: {
  links: SocialLink[];
  variant?: "list" | "row";
}) {
  if (links.length === 0) return null;

  if (variant === "row") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {links.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label ?? s.kind}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-fg)] transition-colors hover:border-[var(--color-red)] hover:text-[var(--color-red)]"
          >
            <span className="block h-4 w-4">{Icons[s.kind]}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
      {links.map((s) => (
        <li key={s.url}>
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-3 py-3 transition-colors hover:text-[var(--color-red)]"
          >
            <span className="flex items-center gap-3">
              <span className="block h-5 w-5 text-[var(--color-fg-muted)] transition-colors group-hover:text-[var(--color-red)]">
                {Icons[s.kind]}
              </span>
              <span className="text-sm font-medium md:text-base">
                {s.label ?? s.url}
              </span>
            </span>
            <span
              aria-hidden
              className="text-[var(--color-fg-muted)] transition-colors group-hover:text-[var(--color-red)]"
            >
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
