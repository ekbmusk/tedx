"use client";

import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { activateTicket } from "@/app/t/[token]/actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapError(raw: string, t: (key: string) => string): string {
  // Map known internal codes to localized messages; fall through to a
  // generic friendly message instead of leaking Supabase internals.
  switch (raw) {
    case "name_required":
      return t("errorNameRequired");
    case "email_required":
      return t("errorEmailRequired");
    case "email_invalid":
      return t("errorEmailInvalid");
    case "not_found":
      return t("errorNotFound");
    default:
      return t("errorGeneric");
  }
}

export function ActivationForm({ token }: { token: string }) {
  const t = useTranslations("ticket");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        const first = String(fd.get("first") || "").trim();
        const last = String(fd.get("last") || "").trim();
        const email = String(fd.get("email") || "").trim();
        const fullName = [first, last].filter(Boolean).join(" ");
        if (!fullName) {
          setError(t("errorNameRequired"));
          return;
        }
        if (!email) {
          setError(t("errorEmailRequired"));
          return;
        }
        if (!EMAIL_RE.test(email)) {
          setError(t("errorEmailInvalid"));
          return;
        }
        startTransition(async () => {
          try {
            const res = await activateTicket(token, fullName, email);
            if (!res.ok) {
              setError(mapError(res.error, t));
              return;
            }
            try {
              localStorage.setItem("tedx-ticket-token", token);
            } catch {
              // localStorage may be unavailable
            }
            router.refresh();
          } catch {
            // Network / unexpected exception (server action threw).
            setError(t("errorNetwork"));
          }
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="first" label={t("firstName")} required />
        <Field name="last" label={t("lastName")} required />
      </div>
      <Field name="email" type="email" label={t("emailLabel")} required />
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--color-red)] px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-red-deep)] disabled:opacity-60"
      >
        {pending ? "…" : t("submit")}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={type === "email" ? "email" : "off"}
        className="rounded-md border border-[var(--color-line)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-base text-white outline-none transition-colors focus:border-[var(--color-red)]"
      />
    </label>
  );
}
