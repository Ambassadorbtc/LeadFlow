import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import DashboardClient from "./dashboard-client";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch summary data
  const { data: dealsData = [] } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id);
  const { data: contactsData = [] } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", user.id);

  // Convert to plain objects to avoid serialization issues
  const deals = JSON.parse(JSON.stringify(dealsData));
  const contacts = JSON.parse(JSON.stringify(contactsData));

  // Calculate metrics
  const totalDeals = deals?.length || 0;
  const totalValue =
    deals?.reduce((sum, deal) => sum + Number(deal.value || 0), 0) || 0;
  const totalContacts = contacts?.length || 0;

  // Get deals by stage for pipeline overview
  const dealsByStage =
    deals?.reduce(
      (acc, deal) => {
        acc[deal.stage] = acc[deal.stage] || [];
        acc[deal.stage].push(deal);
        return acc;
      },
      {} as Record<string, any[]>,
    ) || {};

  return (
    <div className="flex h-screen bg-[#f6f6f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <DashboardClient
            user={user}
            deals={deals}
            contacts={contacts}
            totalDeals={totalDeals}
            totalValue={totalValue}
            totalContacts={totalContacts}
            dealsByStage={dealsByStage}
          />
        </main>
      </div>
    </div>
  );
}
