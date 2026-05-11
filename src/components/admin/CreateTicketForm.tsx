"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createTicket } from "@/app/admin/actions";
import { TIERS, event, type Tier } from "@/config/event";

export function CreateTicketForm() {
  const t = useTranslations("admin");
  const tn = useTranslations("admin.newTicket");
  const tt = useTranslations("admin.tierOptions");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    token: string;
    orderNo: string;
    tier: Tier;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const url = result ? `${window.location.origin}/t/${result.token}` : "";
  const waMessage = encodeURIComponent(
    [
      "Сәлеметсіз бе!",
      "",
      "TEDxZhenysPark — «Жаңғыру» конференциясына билет",
      "сатып алғаныңыз үшін рахмет.",
      "",
      "Билетіңізді белсендіру үшін мына сілтемені ашыңыз:",
      url,
      "",
      "1) Атыңыз бен email-ді енгізіңіз",
      "2) Билетіңіз пайда болады — телефоныңызға сақтап қойыңыз",
      "3) Кіру кезінде осы билетті волонтёрге көрсетесіз",
      "",
      `Күні: ${event.dateLabel.kk}, тіркелу — 08:30`,
      `Орын: ${event.venue.kk}, ${event.city.kk}`,
      "",
      "Сұрағыңыз болса — осы чатқа жазыңыз.",
      "Жаңғыруда жолығайық!",
    ].join("\n"),
  );

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-6">
      {!result ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await createTicket(fd);
              if (!res.ok) setError(res.error);
              else
                setResult({
                  token: res.token,
                  orderNo: res.orderNo,
                  tier: res.tier,
                });
            });
          }}
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
              {tn("tier")}
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TIERS.map((tier, i) => (
                <label
                  key={tier}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-line)] bg-black/40 px-3 py-3 text-sm transition-colors hover:border-white has-[input:checked]:border-[var(--color-red)] has-[input:checked]:bg-[var(--color-red)]/10"
                >
                  <input
                    type="radio"
                    name="tier"
                    value={tier}
                    defaultChecked={i === 0}
                    className="accent-[var(--color-red)]"
                    required
                  />
                  <span className="font-medium">{tt(tier)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field name="note" label={tn("note")} />
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-[var(--color-red)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-red-deep)] disabled:opacity-60"
          >
            {pending ? "…" : tn("create")}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] pb-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
                {tn("orderReady")}
              </p>
              <p className="font-display text-2xl font-extrabold">
                {result.orderNo}
              </p>
            </div>
            <span className="rounded-md border border-[var(--color-red)] bg-[var(--color-red)]/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-red)]">
              {tt(result.tier)}
            </span>
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">
            {tn("linkReady")}
          </p>
          <div className="rounded-md border border-[var(--color-line)] bg-black/40 p-3 font-mono text-sm break-all">
            {url}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm hover:border-white"
            >
              {copied ? t("copied") : t("copy")}
            </button>
            <a
              href={`https://wa.me/?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              {t("openInWhatsapp")}
            </a>
            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm hover:border-white"
            >
              + {t("create")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
        {label}
      </span>
      <input
        name={name}
        autoComplete="off"
        className="rounded-md border border-[var(--color-line)] bg-black/40 px-3 py-2.5 text-base text-white outline-none focus:border-[var(--color-red)]"
      />
    </label>
  );
}
