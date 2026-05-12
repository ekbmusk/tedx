import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Roles live in Supabase `auth.users.raw_app_meta_data.role`. We default to
// "manager" when absent so existing accounts (assemay@ etc.) keep full access
// without a backfill — only newly-created volunteer accounts need the
// explicit "scanner" value set via the Supabase SQL editor (see CLAUDE.md).
export type Role = "manager" | "scanner";

export function getUserRole(user: User | null | undefined): Role {
  const raw = user?.app_metadata?.role;
  return raw === "scanner" ? "scanner" : "manager";
}

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return data.user;
}

export async function requireManager() {
  const user = await requireUser();
  if (getUserRole(user) !== "manager") redirect("/admin/scan");
  return user;
}
