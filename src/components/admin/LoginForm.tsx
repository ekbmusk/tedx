"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "@/app/admin/actions";

export function LoginForm() {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)] p-6">
      <h1 className="font-display text-2xl font-extrabold">{t("loginTitle")}</h1>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await signIn(fd);
            if (res && !res.ok) setError(res.error);
          });
        }}
      >
        <Field name="email" type="email" label={t("email")} />
        <Field name="password" type="password" label={t("password")} />
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
          {pending ? "…" : t("signIn")}
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required
        className="rounded-md border border-[var(--color-line)] bg-black/40 px-3 py-2.5 text-base text-white outline-none focus:border-[var(--color-red)]"
      />
    </label>
  );
}
