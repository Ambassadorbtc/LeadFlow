import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import { getUserSettings } from "@/app/actions/settings-actions";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user settings using server action
  const userSettings = await getUserSettings(user.id);

  return (
    <main className="flex-1 overflow-auto">
      <SettingsClient user={user} settings={userSettings} />
    </main>
  );
}
