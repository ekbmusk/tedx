import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { Scanner } from "@/components/admin/Scanner";

export default async function ScanPage() {
  await requireUser();
  const t = await getTranslations("admin.scanner");
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-extrabold">{t("title")}</h1>
      <div className="mt-6">
        <Scanner />
      </div>
    </div>
  );
}
