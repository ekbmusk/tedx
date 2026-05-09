import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const messages = await getMessages({ locale: "kk" });

  return (
    <NextIntlClientProvider locale="kk" messages={messages}>
      <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
        {data.user && <AdminNav email={data.user.email ?? ""} />}
        <div className="mx-auto max-w-6xl px-5 py-10">{children}</div>
      </div>
    </NextIntlClientProvider>
  );
}
