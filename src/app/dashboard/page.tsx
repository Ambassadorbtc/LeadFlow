import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import DashboardClient from "./dashboard-client";
import { serializeSupabaseData } from "@/app/serialize";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch summary data
  const { data: deals = [] } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id);
  const { data: contacts = [] } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", user.id);

  // Calculate metrics
  const totalDeals = deals.length || 0;
  const totalValue = deals.reduce(
    (sum, deal) => sum + Number(deal.value || 0),
    0,
  );
  const totalContacts = contacts.length || 0;

  // Get deals by stage for pipeline overview
  const dealsByStage = deals.reduce(
    (acc, deal) => {
      const stage = deal.stage || "Unknown";
      acc[stage] = acc[stage] || [];
      acc[stage].push(deal);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  // Serialize data for client components
  const serializedDeals = await serializeSupabaseData(deals);
  const serializedContacts = await serializeSupabaseData(contacts);
  const serializedDealsByStage = await serializeSupabaseData(dealsByStage);

  return (
    <div className="flex h-screen bg-[#f6f6f8] dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <DashboardClient
            user={user}
            deals={serializedDeals}
            contacts={serializedContacts}
            totalDeals={totalDeals}
            totalValue={totalValue}
            totalContacts={totalContacts}
            dealsByStage={serializedDealsByStage}
          />
        </main>
      </div>
    </div>
  );
}
