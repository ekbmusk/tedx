import { getTranslations } from "next-intl/server";
import { requireManager } from "@/lib/auth";
import { CreateTicketForm } from "@/components/admin/CreateTicketForm";

export default async function NewTicketPage() {
  await requireManager();
  const t = await getTranslations("admin.newTicket");
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-extrabold">{t("title")}</h1>
      <div className="mt-6">
        <CreateTicketForm />
      </div>
    </div>
  );
}
