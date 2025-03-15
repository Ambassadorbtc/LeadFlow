import { createClient } from "@/app/actions";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./dashboard-client";
import AdminSidebar from "@/components/admin/sidebar";
import AdminNavbar from "@/components/admin/navbar";

export default async function AdminDashboardPage() {
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

  console.log("Admin confirmed, showing admin dashboard");

  // Fetch user stats
  const { data: users = [] } = await supabase.from("users").select("*");
  const { data: leads = [] } = await supabase.from("leads").select("*");
  const { data: deals = [] } = await supabase.from("deals").select("*");

  // Calculate stats
  const totalUsers = users.length;
  const totalLeads = leads.length;
  const totalDeals = deals.length;
  const totalDealValue = deals.reduce(
    (sum, deal) => sum + Number(deal.value || 0),
    0,
  );

  // Get active users (users who have logged in within the last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeUsers = users.filter(
    (user) => new Date(user.last_sign_in_at) > sevenDaysAgo,
  ).length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto">
          <AdminDashboardClient
            totalUsers={totalUsers}
            activeUsers={activeUsers}
            totalLeads={totalLeads}
            totalDeals={totalDeals}
            totalDealValue={totalDealValue}
            users={users}
          />
        </main>
      </div>
    </div>
  );
}
