"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActivationResult =
  | { ok: true; status: "activated" | "used" }
  | { ok: false; error: string };

export async function activateTicket(
  token: string,
  holderName: string,
  holderContact?: string,
): Promise<ActivationResult> {
  if (!holderName.trim()) {
    return { ok: false, error: "name_required" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("activate_ticket", {
    p_token: token,
    p_holder_name: holderName.trim(),
    p_holder_contact: holderContact?.trim() || null,
  });

  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false, error: "not_found" };

  revalidatePath(`/t/${token}`);
  return { ok: true, status: row.status as "activated" | "used" };
}
