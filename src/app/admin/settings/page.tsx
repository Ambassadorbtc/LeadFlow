import { createClient } from "@/app/actions";
import { redirect } from "next/navigation";
import AdminSettingsClient from "./settings-client";
import AdminSidebar from "@/components/admin/sidebar";
import AdminNavbar from "@/components/admin/navbar";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/admin-login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.email !== "admin@leadflowapp.online") {
    console.log("Not admin, redirecting to dashboard");
    return redirect("/dashboard");
  }

  // Fetch system settings
  const { data: settings } = await supabase
    .from("system_settings")
    .select("*")
    .limit(1)
    .single();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto">
          <AdminSettingsClient settings={settings || {}} />
        </main>
      </div>
    </div>
  );
}
