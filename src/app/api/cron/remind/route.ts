import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendReminderEmail } from "@/lib/email";
import { event } from "@/config/event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Send reminders 3 days before the event. The cron runs daily; this is a
// no-op every day except T-3 (configured via REMIND_OFFSET_DAYS env, default 3).
const OFFSET_DAYS = Number(process.env.REMIND_OFFSET_DAYS ?? 3);

export async function GET(request: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>; reject everything else.
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const eventDate = new Date(`${event.date}T00:00:00+05:00`);
  const now = new Date();
  const daysUntil = Math.round(
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntil !== OFFSET_DAYS) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      daysUntil,
      offset: OFFSET_DAYS,
    });
  }

  const supabase = createAdminClient(); // bypass RLS to read all activated tickets
  const { data, error } = await supabase
    .from("tickets")
    .select("token, holder_name, holder_contact")
    .in("status", ["activated"]);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const t of data ?? []) {
    const contact = t.holder_contact?.trim();
    if (!contact || !contact.includes("@")) continue;
    await sendReminderEmail({
      to: contact,
      token: t.token,
      holderName: t.holder_name ?? "",
    });
    sent++;
  }

  return NextResponse.json({ ok: true, daysUntil, total: data?.length ?? 0, sent });
}
