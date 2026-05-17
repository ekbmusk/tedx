import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { event, TIER_LABEL, type Tier } from "@/config/event";
import { ActivationForm } from "@/components/ticket/ActivationForm";
import { ClearStaleToken } from "@/components/ticket/ClearStaleToken";
import { DownloadImageButton } from "@/components/ticket/DownloadImageButton";
import { RememberTicket } from "@/components/ticket/RememberTicket";
import { VenueMap } from "@/components/ticket/VenueMap";

type TicketRow = {
  id: string;
  token: string;
  status: "issued" | "activated" | "used";
  holder_name: string | null;
  holder_contact: string | null;
  category: string | null;
  tier: Tier | null;
  order_no: string | null;
  created_at: string;
  activated_at: string | null;
  used_at: string | null;
};

async function getTicket(token: string): Promise<TicketRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ticket_by_token", {
    p_token: token,
  });
  if (error || !data || (Array.isArray(data) && data.length === 0)) return null;
  return Array.isArray(data) ? (data[0] as TicketRow) : (data as TicketRow);
}

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const locale: "kk" | "en" = sp.lang === "en" ? "en" : "kk";
  const t = await getTranslations({ locale, namespace: "ticket" });
  const ticket = await getTicket(token);

  if (!ticket) {
    return (
      <Frame locale={locale}>
        <ClearStaleToken token={token} />
        <h1 className="font-display text-3xl font-extrabold">
          {t("notFoundTitle")}
        </h1>
        <p className="mt-3 text-[var(--color-fg-muted)]">{t("notFoundBody")}</p>
      </Frame>
    );
  }

  if (ticket.status === "issued") {
    return (
      <Frame locale={locale}>
        <Header step="01" title={t("issuedTitle")} body={t("issuedBody")} />
        <div className="mt-8">
          <ActivationForm token={token} />
        </div>
      </Frame>
    );
  }

  if (ticket.status === "used") {
    return (
      <Frame locale={locale}>
        <RememberTicket token={token} />
        <h1 className="font-display text-3xl font-extrabold text-[var(--color-fg-muted)]">
          {t("usedTitle")}
        </h1>
        <p className="mt-3 text-[var(--color-fg-muted)]">{t("usedBody")}</p>
        <div className="mt-6 flex flex-col gap-3">
          <TicketImage token={token} />
          <DownloadImageButton token={token} orderNo={ticket.order_no} />
          <DownloadAgendaButton locale={locale} label={t("downloadAgenda")} />
          <BackToSiteButton label={t("backToSite")} />
        </div>
        <TicketMeta ticket={ticket} t={t} />
        <VenueMapSection tier={ticket.tier} title={t("yourZone")} />
      </Frame>
    );
  }

  // activated
  return (
    <Frame locale={locale}>
      <RememberTicket token={token} />
      <Header step="✓" title={t("activatedTitle")} body={t("activatedBody")} />
      <div className="mt-8 flex flex-col gap-3">
        <TicketImage token={token} />
        <DownloadImageButton token={token} orderNo={ticket.order_no} />
        <AddToCalendarButton label={t("addToCalendar")} />
        <DownloadAgendaButton locale={locale} label={t("downloadAgenda")} />
        <BackToSiteButton label={t("backToSite")} />
      </div>
      <TicketMeta ticket={ticket} t={t} />
      <VenueMapSection tier={ticket.tier} title={t("yourZone")} />
    </Frame>
  );
}

function TicketImage({ token }: { token: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/t/${token}/image`}
      alt="Сіздің билетіңіз · Your ticket"
      // Intrinsic size of the rendered PNG template (1276x2268, see
      // src/lib/ticket-image.ts). Sets aspect ratio so the slot is reserved
      // on first paint — no CLS when the image loads.
      width={1276}
      height={2268}
      className="ticket-image h-auto w-full rounded-2xl border border-[var(--color-line)]"
    />
  );
}

function AddToCalendarButton({ label }: { label: string }) {
  return (
    // webcal:// makes calendar apps subscribe to the feed instead of
    // downloading a snapshot. They'll re-poll based on REFRESH-INTERVAL
    // (~1h) so changes to DTSTART/DTEND/LOCATION propagate automatically.
    <a
      href="webcal://www.tedx.kz/calendar.ics"
      className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        <rect x="3" y="5" width="18" height="16" rx="2" strokeLinejoin="round" />
        <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
      </svg>
      {label}
    </a>
  );
}

function DownloadAgendaButton({
  locale,
  label,
}: {
  locale: "kk" | "en";
  label: string;
}) {
  const href =
    locale === "en"
      ? "/agenda/TEDxZhenysPark_Agenda_Dark_EN.pdf"
      : "/agenda/TEDxZhenysPark_Agenda_Dark_KZ.pdf";
  return (
    <a
      href={href}
      download
      className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        <path d="M12 4v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20h16" strokeLinecap="round" />
      </svg>
      {label}
    </a>
  );
}

function VenueMapSection({ tier, title }: { tier: Tier | null; title: string }) {
  return (
    <section className="mt-8 border-t border-[var(--color-line)] pt-6">
      <h2 className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
        {title}
      </h2>
      <div className="mt-4">
        <VenueMap tier={tier} />
      </div>
    </section>
  );
}

function BackToSiteButton({ label }: { label: string }) {
  return (
    <a
      href="/"
      className="flex w-full items-center justify-center rounded-full border border-[var(--color-line)] px-6 py-3 text-base font-semibold text-white transition-colors hover:border-white"
    >
      ← {label}
    </a>
  );
}

function Frame({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: "kk" | "en";
}) {
  return (
    <main className="ticket-page min-h-dvh bg-[var(--color-bg)] px-5 py-12 text-[var(--color-fg)]">
      <div className="mx-auto max-w-md">
        <img
          src="/brand/wordmark.svg"
          alt="TEDxZhenysPark"
          width={1304}
          height={147}
          className="ticket-brand mb-8 h-5 w-auto"
        />
        <div className="ticket-card rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-6 md:p-8">
          {children}
        </div>
        <div className="ticket-footer mt-6 text-center text-xs text-[var(--color-fg-muted)]">
          {event.dateLabel[locale]} · {event.venue[locale]},{" "}
          {event.city[locale]}
        </div>
      </div>
    </main>
  );
}

function Header({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-red)]">
        {step}
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">
        {title}
      </h1>
      <p className="mt-2 text-[var(--color-fg-muted)]">{body}</p>
    </div>
  );
}

function TicketMeta({
  ticket,
  t,
}: {
  ticket: TicketRow;
  t: Awaited<ReturnType<typeof getTranslations<"ticket">>>;
}) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--color-line)] pt-6 text-sm">
      <div>
        <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
          {t("name")}
        </dt>
        <dd className="mt-1 font-medium">{ticket.holder_name ?? "—"}</dd>
      </div>
      {ticket.tier && (
        <div>
          <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
            {t("tier")}
          </dt>
          <dd className="mt-1 font-medium">
            {TIER_LABEL[ticket.tier]}
            {ticket.order_no ? ` · ${ticket.order_no}` : ""}
          </dd>
        </div>
      )}
    </dl>
  );
}
