import { createClient } from "@/app/actions";
import { redirect } from "next/navigation";
import AdminReportsClient from "./reports-client";
import AdminSidebar from "@/components/admin/sidebar";
import AdminNavbar from "@/components/admin/navbar";

export default async function AdminReportsPage() {
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

  // Fetch data for reports
  const { data: users = [] } = await supabase.from("users").select("*");
  const { data: leads = [] } = await supabase.from("leads").select("*");
  const { data: deals = [] } = await supabase.from("deals").select("*");

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto">
          <AdminReportsClient users={users} leads={leads} deals={deals} />
        </main>
      </div>
    </div>
  );
}
