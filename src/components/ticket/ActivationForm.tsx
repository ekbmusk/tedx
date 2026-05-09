"use client";

import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { activateTicket } from "@/app/t/[token]/actions";

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
        const contact = String(fd.get("contact") || "").trim();
        const fullName = [first, last].filter(Boolean).join(" ");
        if (!fullName) {
          setError(t("firstName"));
          return;
        }
        startTransition(async () => {
          const res = await activateTicket(token, fullName, contact || undefined);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="first" label={t("firstName")} required />
        <Field name="last" label={t("lastName")} required />
      </div>
      <Field name="contact" label={t("contactOptional")} />
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
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        required={required}
        autoComplete="off"
        className="rounded-md border border-[var(--color-line)] bg-[var(--color-bg-soft)] px-3 py-2.5 text-base text-white outline-none transition-colors focus:border-[var(--color-red)]"
      />
    </label>
  );
}
