import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseUserSettings } from "@/lib/user-settings";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings | Resumly",
  robots: { index: false, follow: false },
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; payment?: string }>;
}) {
  const { tab, payment } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/settings");

  return (
    <SettingsView
      email={user.email ?? ""}
      settings={parseUserSettings(user.user_metadata)}
      initialTab={tab}
      paymentStatus={payment}
    />
  );
}