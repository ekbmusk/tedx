"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { TIERS, type Tier } from "@/config/event";

const nanoid = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 10);

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { ok: false as const, error: error.message };
  }
  // Scanners land directly on the QR camera page; managers on the tickets list.
  redirect(
    getUserRole(signInData.user) === "scanner" ? "/admin/scan" : "/admin",
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createTicket(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false as const, error: "unauthenticated" };
  // Defence-in-depth — the page that hosts CreateTicketForm is already
  // gated by requireManager, but a scanner could theoretically POST here.
  if (getUserRole(userData.user) !== "manager") {
    return { ok: false as const, error: "forbidden" };
  }

  const tier = String(formData.get("tier") || "") as Tier;
  if (!TIERS.includes(tier)) {
    return { ok: false as const, error: "invalid_tier" };
  }
  const note = String(formData.get("note") || "").trim() || null;

  const { data: orderData, error: orderError } = await supabase.rpc(
    "next_order_no",
    { p_tier: tier },
  );
  if (orderError) return { ok: false as const, error: orderError.message };
  const orderNo = String(orderData);

  const token = nanoid();
  const { data, error } = await supabase
    .from("tickets")
    .insert({ token, tier, order_no: orderNo, note })
    .select("token, order_no")
    .single();

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  return {
    ok: true as const,
    token: data.token,
    orderNo: data.order_no as string,
    tier,
  };
}

export async function checkInTicket(token: string, door?: string | null) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_in_ticket", {
    p_token: token,
    p_door: door ?? null,
  });
  if (error) return { ok: false as const, error: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { ok: false as const, error: "not_found" };
  return {
    ok: true as const,
    status: row.status as "issued" | "activated" | "used",
    prevStatus: row.prev_status as "issued" | "activated" | "used",
    holderName: row.holder_name as string | null,
    category: row.category as string | null,
    tier: row.tier as string | null,
    orderNo: row.order_no as string | null,
    door: row.door as string | null,
  };
}
