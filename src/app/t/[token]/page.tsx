import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { event, TIER_LABEL, type Tier } from "@/config/event";
import { ActivationForm } from "@/components/ticket/ActivationForm";
import { QrDisplay } from "@/components/ticket/QrDisplay";
import { DownloadPdfButton } from "@/components/ticket/DownloadPdfButton";

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
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getTranslations("ticket");
  const ticket = await getTicket(token);

  if (!ticket) {
    return (
      <Frame>
        <h1 className="font-display text-3xl font-extrabold">
          {t("notFoundTitle")}
        </h1>
        <p className="mt-3 text-[var(--color-fg-muted)]">{t("notFoundBody")}</p>
      </Frame>
    );
  }

  if (ticket.status === "issued") {
    return (
      <Frame>
        <Header step="01" title={t("issuedTitle")} body={t("issuedBody")} />
        <div className="mt-8">
          <ActivationForm token={token} />
        </div>
      </Frame>
    );
  }

  if (ticket.status === "used") {
    return (
      <Frame>
        <h1 className="font-display text-3xl font-extrabold text-[var(--color-fg-muted)]">
          {t("usedTitle")}
        </h1>
        <p className="mt-3 text-[var(--color-fg-muted)]">{t("usedBody")}</p>
        <div className="mt-6 flex flex-col items-center gap-4">
          <QrDisplay value={token} />
          {ticket.tier && ticket.order_no && (
            <DownloadPdfButton token={token} orderNo={ticket.order_no} />
          )}
        </div>
        <TicketMeta ticket={ticket} t={t} />
      </Frame>
    );
  }

  // activated
  return (
    <Frame>
      <Header step="✓" title={t("activatedTitle")} body={t("activatedBody")} />
      <div className="mt-8 flex flex-col items-center gap-4">
        <QrDisplay value={token} />
        <p className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
          {t("saveScreenshot")}
        </p>
        {ticket.tier && ticket.order_no && (
          <DownloadPdfButton token={token} orderNo={ticket.order_no} />
        )}
      </div>
      <TicketMeta ticket={ticket} t={t} />
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[var(--color-bg)] px-5 py-12 text-[var(--color-fg)]">
      <div className="mx-auto max-w-md">
        <div className="tedx-mark mb-8 font-display text-lg font-black tracking-tight">
          TED<span>x</span>ZhenysPark
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-6 md:p-8">
          {children}
        </div>
        <div className="mt-6 text-center text-xs text-[var(--color-fg-muted)]">
          {event.dateLabel.kk} · {event.venue.kk}, {event.city.kk}
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
