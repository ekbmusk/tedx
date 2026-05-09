"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createTicket } from "@/app/admin/actions";

export function CreateTicketForm() {
  const t = useTranslations("admin");
  const tn = useTranslations("admin.newTicket");
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const url = token ? `${window.location.origin}/t/${token}` : "";
  const waMessage = encodeURIComponent(
    `Сәлеметсіз бе! Мынау сіздің TEDxZhenysPark билетіңіз: ${url}\n\nСілтемені ашып, аты-жөніңізді енгізсеңіз — кіруге арналған QR кодын аласыз.`,
  );

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-6">
      {!token ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await createTicket(fd);
              if (!res.ok) setError(res.error);
              else setToken(res.token);
            });
          }}
        >
          <Field name="category" label={tn("category")} />
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
          <p className="text-sm text-[var(--color-fg-muted)]">{tn("linkReady")}</p>
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
              onClick={() => setToken(null)}
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
