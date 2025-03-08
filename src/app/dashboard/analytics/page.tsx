import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { PIPELINE_STAGES } from "@/types/schema";
import { BarChart3, DollarSign, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import AnalyticsClient from "./client-page";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch data for analytics
  const [dealsResult, leadsResult, contactsResult] = await Promise.all([
    supabase.from("deals").select("*").eq("user_id", user.id),
    supabase.from("leads").select("*").eq("user_id", user.id),
    supabase.from("contacts").select("*").eq("user_id", user.id),
  ]);

  // Convert to plain objects to avoid serialization issues
  const deals = JSON.parse(JSON.stringify(dealsResult.data || []));
  const leads = JSON.parse(JSON.stringify(leadsResult.data || []));
  const contacts = JSON.parse(JSON.stringify(contactsResult.data || []));

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <AnalyticsClient deals={deals} leads={leads} contacts={contacts} />
        </main>
      </div>
    </div>
  );
}
