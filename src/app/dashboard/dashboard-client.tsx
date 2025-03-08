"use client";

import {
  BarChart3,
  Calendar,
  ClipboardList,
  DollarSign,
  LineChart,
  LayoutGrid,
  LayoutList,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import DraggableSection from "@/components/dashboard/draggable-section";
import DashboardContainer from "@/components/dashboard/dashboard-container";
import ResetLayoutButton from "@/components/dashboard/reset-layout-button";
import Link from "next/link";
import { PIPELINE_STAGES } from "@/types/schema";
import SalesChartRecharts from "./components/sales-chart-recharts";

type DashboardClientProps = {
  user: any;
  deals: any[];
  contacts: any[];
  totalDeals: number;
  totalValue: number;
  totalContacts: number;
  dealsByStage: Record<string, any[]>;
};

export default function DashboardClient({
  user,
  deals,
  contacts,
  totalDeals,
  totalValue,
  totalContacts,
  dealsByStage,
}: DashboardClientProps) {
  return (
    <div className="px-4 py-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Sales Dashboard</h1>
          <p className="text-[#6b7280] mt-2">
            Welcome back, {user.user_metadata?.full_name || user.email}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors">
            <RefreshCw className="h-4 w-4 text-[#6b7280]" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors">
            <LayoutGrid className="h-4 w-4 text-[#6b7280]" />
            <span>Grid</span>
          </button>
          <ResetLayoutButton />
        </div>
      </header>

      <DashboardContainer>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/dashboard/deals"
            className="bg-white rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="rounded-full bg-[#eef2ff] p-3 mr-4">
              <ClipboardList className="h-6 w-6 text-[#4f46e5]" />
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Total Deals</p>
              <h3 className="text-2xl font-bold">{totalDeals}</h3>
            </div>
          </Link>

          <Link
            href="/dashboard/pipeline"
            className="bg-white rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="rounded-full bg-[#dcfce7] p-3 mr-4">
              <DollarSign className="h-6 w-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Total Value</p>
              <h3 className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </h3>
            </div>
          </Link>

          <Link
            href="/dashboard/contacts"
            className="bg-white rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="rounded-full bg-[#f3e8ff] p-3 mr-4">
              <Users className="h-6 w-6 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Contacts</p>
              <h3 className="text-2xl font-bold">{totalContacts}</h3>
            </div>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="bg-white rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="rounded-full bg-[#ffedd5] p-3 mr-4">
              <BarChart3 className="h-6 w-6 text-[#f97316]" />
            </div>
            <div>
              <p className="text-sm text-[#6b7280]">Win Rate</p>
              <h3 className="text-2xl font-bold">
                {totalDeals
                  ? Math.round(
                      ((dealsByStage["Deal Closed"]?.length || 0) /
                        totalDeals) *
                        100,
                    )
                  : 0}
                %
              </h3>
            </div>
          </Link>
        </div>

        {/* Sales Growth Chart */}
        <DraggableSection
          id="sales-growth"
          title="Sales Growth"
          className="w-full flex-shrink-0"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div>
              <h3 className="text-lg font-semibold">
                ${totalValue.toLocaleString()}
              </h3>
              <div className="flex items-center text-sm">
                {(() => {
                  // Calculate growth compared to previous period
                  const currentDate = new Date();
                  const currentMonth = currentDate.getMonth();
                  const currentYear = currentDate.getFullYear();

                  // Current month deals
                  const currentMonthDeals = deals.filter((deal) => {
                    const dealDate = new Date(
                      deal.created_at || deal.updated_at || new Date(),
                    );
                    return (
                      dealDate.getMonth() === currentMonth &&
                      dealDate.getFullYear() === currentYear
                    );
                  });

                  // Previous month deals
                  const prevDate = new Date();
                  prevDate.setMonth(prevDate.getMonth() - 1);
                  const prevMonth = prevDate.getMonth();
                  const prevYear = prevDate.getFullYear();

                  const prevMonthDeals = deals.filter((deal) => {
                    const dealDate = new Date(
                      deal.created_at || deal.updated_at || new Date(),
                    );
                    return (
                      dealDate.getMonth() === prevMonth &&
                      dealDate.getFullYear() === prevYear
                    );
                  });

                  const currentValue = currentMonthDeals.reduce(
                    (sum, deal) => sum + Number(deal.value || 0),
                    0,
                  );

                  const prevValue = prevMonthDeals.reduce(
                    (sum, deal) => sum + Number(deal.value || 0),
                    0,
                  );

                  const growthPercent =
                    prevValue > 0
                      ? ((currentValue - prevValue) / prevValue) * 100
                      : currentValue > 0
                        ? 100
                        : 0;

                  // Ensure we don't display NaN or Infinity
                  const safeGrowthPercent =
                    isNaN(growthPercent) || !isFinite(growthPercent)
                      ? 0
                      : growthPercent;

                  const isPositive = growthPercent >= 0;

                  return (
                    <>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-[#10b981] mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500 mr-1 transform rotate-180" />
                      )}
                      <span
                        className={
                          isPositive
                            ? "text-[#10b981] font-medium"
                            : "text-red-500 font-medium"
                        }
                      >
                        {isPositive ? "+" : ""}
                        {safeGrowthPercent.toFixed(1)}%
                      </span>
                      <span className="text-[#6b7280] ml-1">vs last month</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Chart Container */}
            <div className="w-full mt-4">
              <SalesChartRecharts deals={deals} />
            </div>
          </div>
        </DraggableSection>

        {/* Pipeline Overview */}
        <DraggableSection
          id="pipeline-overview"
          title="Pipeline Overview"
          className="w-full flex-shrink-0"
        >
          <div className="flex justify-end mb-4">
            <a
              href="/dashboard/deals"
              className="text-[#4f46e5] text-sm hover:underline"
            >
              View All Deals
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-x divide-[#f3f4f6] overflow-x-auto">
              {PIPELINE_STAGES.map((stage) => {
                const stageDeals = dealsByStage[stage] || [];
                const stageValue = stageDeals.reduce(
                  (sum, deal) => sum + Number(deal.value || 0),
                  0,
                );

                return (
                  <div key={stage} className="p-4">
                    <div className="mb-3">
                      <h3 className="font-medium text-[#1a1a1a]">{stage}</h3>
                      <div className="flex justify-between text-sm text-[#6b7280] mt-1">
                        <span>{stageDeals.length} deals</span>
                        <span>${stageValue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {stageDeals.slice(0, 3).map((deal) => (
                        <Link
                          href={`/dashboard/deals/${deal.id}`}
                          key={deal.id}
                          className="bg-[#f9fafb] p-3 rounded-md block hover:bg-[#f3f4f6] transition-colors"
                        >
                          <p className="font-medium text-[#1a1a1a] truncate">
                            {deal.name}
                          </p>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-[#6b7280]">
                              {deal.company}
                            </span>
                            <span className="font-medium">
                              ${Number(deal.value).toLocaleString()}
                            </span>
                          </div>
                        </Link>
                      ))}
                      {stageDeals.length > 3 && (
                        <p className="text-sm text-center text-[#6b7280]">
                          +{stageDeals.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DraggableSection>

        {/* Recent Activity */}
        <DraggableSection
          id="recent-activity"
          title="Recent Activity"
          className="w-full flex-shrink-0"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            {deals && deals.length > 0 ? (
              <div className="space-y-4">
                {deals.slice(0, 5).map((deal) => (
                  <Link
                    href={`/dashboard/deals/${deal.id}`}
                    key={deal.id}
                    className="flex items-start pb-4 border-b border-[#f3f4f6] last:border-0 last:pb-0 hover:bg-[#f9fafb] rounded-md p-2 -mx-2 transition-colors"
                  >
                    <div className="rounded-full bg-[#eef2ff] p-2 mr-4">
                      <ClipboardList className="h-4 w-4 text-[#4f46e5]" />
                    </div>
                    <div>
                      <p className="font-medium">{deal.name}</p>
                      <p className="text-sm text-[#6b7280] mt-1">
                        Added to {deal.stage} • $
                        {Number(deal.value).toLocaleString()} •
                        {deal.deal_type || "Other"}
                      </p>
                    </div>
                    <div className="ml-auto text-xs text-[#9ca3af]">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#6b7280]">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </DraggableSection>
      </DashboardContainer>
    </div>
  );
}
