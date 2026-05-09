import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TicketsTable } from "@/components/admin/TicketsTable";

export default async function AdminHomePage() {
  await requireUser();
  const t = await getTranslations("admin");
  const supabase = await createClient();
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select(
      "id, token, status, holder_name, holder_contact, category, created_at, activated_at, used_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold">{t("tickets")}</h1>
        <Link
          href="/admin/new"
          className="rounded-full bg-[var(--color-red)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-red-deep)]"
        >
          + {t("create")}
        </Link>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error.message}
        </div>
      )}

      <div className="mt-8">
        <TicketsTable tickets={tickets ?? []} />
      </div>
    </div>
  );
}
