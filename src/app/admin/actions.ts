"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { createClient } from "@/lib/supabase/server";

const nanoid = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 10);

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false as const, error: error.message };
  }
  redirect("/admin");
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

  const category = String(formData.get("category") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;

  const token = nanoid();
  const { data, error } = await supabase
    .from("tickets")
    .insert({ token, category, note })
    .select("token")
    .single();

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  return { ok: true as const, token: data.token };
}

export async function checkInTicket(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_in_ticket", {
    p_token: token,
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
  };
}
