"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendTicketActivatedEmail } from "@/lib/email";
import type { Tier } from "@/config/event";

export type ActivationResult =
  | { ok: true; status: "activated" | "used" }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function activateTicket(
  token: string,
  holderName: string,
  holderContact?: string,
): Promise<ActivationResult> {
  if (!holderName.trim()) {
    return { ok: false, error: "name_required" };
  }
  const trimmedContact = holderContact?.trim() || null;
  if (!trimmedContact) {
    return { ok: false, error: "email_required" };
  }
  if (!EMAIL_RE.test(trimmedContact)) {
    return { ok: false, error: "email_invalid" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("activate_ticket", {
    p_token: token,
    p_holder_name: holderName.trim(),
    p_holder_contact: trimmedContact,
  });

  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false, error: "not_found" };

  // Best-effort email notification. Fire-and-forget to keep activation snappy;
  // any failure is logged inside sendTicketActivatedEmail.
  // activate_ticket RPC doesn't return tier/order_no, so re-fetch via
  // get_ticket_by_token to attach the per-tier image.
  const { data: full } = await supabase.rpc("get_ticket_by_token", {
    p_token: token,
  });
  const fullRow = Array.isArray(full) ? full[0] : full;
  void sendTicketActivatedEmail({
    to: trimmedContact,
    token,
    holderName: holderName.trim(),
    tier: (fullRow?.tier ?? null) as Tier | null,
    orderNo: (fullRow?.order_no ?? null) as string | null,
  });

  revalidatePath(`/t/${token}`);
  return { ok: true, status: row.status as "activated" | "used" };
}
