import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect(getUserRole(data.user) === "scanner" ? "/admin/scan" : "/admin");
  }

  return (
    <div className="mx-auto max-w-sm">
      <LoginForm />
    </div>
  );
}
