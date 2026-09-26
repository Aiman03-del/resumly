import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="max-w-sm mx-auto py-20 px-6">
      <h1 className="text-2xl font-semibold mb-6">Account</h1>
      <p className="text-sm text-foreground/60 mb-6">{user.email}</p>
      <LogoutButton />
    </div>
  );
}
