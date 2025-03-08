import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user settings
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <SettingsClient user={user} settings={userSettings || {}} />
        </main>
      </div>
    </div>
  );
}
