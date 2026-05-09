import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function TicketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages({ locale: "kk" });
  return (
    <NextIntlClientProvider locale="kk" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
