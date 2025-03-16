import { PIPELINE_STAGES } from "@/types/schema";
import { BarChart3, DollarSign, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch deals
  const { data: deals = [] } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id);

  // Fetch leads
  const { data: leads = [] } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id);

  // Fetch contacts
  const { data: contacts = [] } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", user.id);

  // Calculate metrics
  const totalDeals = deals?.length || 0;
  const totalValue =
    deals?.reduce((sum, deal) => sum + Number(deal.value || 0), 0) || 0;
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  // Get deals by stage for pipeline analysis
  const dealsByStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      const stageDeals = deals?.filter((deal) => deal.stage === stage) || [];
      acc[stage] = {
        count: stageDeals.length,
        value: stageDeals.reduce(
          (sum, deal) => sum + Number(deal.value || 0),
          0,
        ),
      };
      return acc;
    },
    {} as Record<string, { count: number; value: number }>,
  );

  // Calculate win rate
  const closedWonCount = dealsByStage["Deal Closed"]?.count || 0;
  const closedLostCount = dealsByStage["Deal Lost"]?.count || 0;
  const totalClosedDeals = closedWonCount + closedLostCount;
  const winRate =
    totalClosedDeals > 0 ? (closedWonCount / totalClosedDeals) * 100 : 0;

  // Generate monthly data for the last 12 months
  const monthlyData = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get current date
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  // Generate data for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const year =
      currentDate.getFullYear() - (currentMonth < monthIndex ? 1 : 0);
    const month = monthNames[monthIndex];

    // Filter deals for this month
    const monthDeals = deals.filter((deal) => {
      const dealDate = new Date(
        deal.created_at || deal.updated_at || new Date(),
      );
      return (
        dealDate.getMonth() === monthIndex && dealDate.getFullYear() === year
      );
    });

    // Calculate total value for this month
    const value = monthDeals.reduce(
      (sum, deal) => sum + Number(deal.value || 0),
      0,
    );

    // Add to chart data
    monthlyData.push({
      name: month,
      value: value,
      month: monthIndex,
      year: year,
    });
  }

  // Generate deal type distribution data
  const dealTypeMap = deals.reduce(
    (acc, deal) => {
      const type = deal.deal_type || "Other";
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += Number(deal.value || 0);
      return acc;
    },
    {} as Record<string, number>,
  );

  const dealTypeData = Object.entries(dealTypeMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <AnalyticsClient
        totalDeals={totalDeals}
        totalValue={totalValue}
        avgDealValue={avgDealValue}
        winRate={winRate}
        dealsByStage={dealsByStage}
        monthlyData={monthlyData}
        dealTypeData={dealTypeData}
        deals={deals}
        leads={leads}
        contacts={contacts}
      />
    </main>
  );
}
