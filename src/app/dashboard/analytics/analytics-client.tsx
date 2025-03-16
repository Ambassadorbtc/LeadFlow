"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PIPELINE_STAGES } from "@/types/schema";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  UserCircle,
  ClipboardList,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

type AnalyticsClientProps = {
  totalDeals: number;
  totalValue: number;
  avgDealValue: number;
  winRate: number;
  dealsByStage: Record<string, { count: number; value: number }>;
  monthlyData: any[];
  dealTypeData: any[];
  deals: any[];
  leads: any[];
  contacts: any[];
};

export default function AnalyticsClient(props: AnalyticsClientProps) {
  const {
    totalDeals,
    totalValue,
    avgDealValue,
    winRate,
    dealsByStage,
    deals,
    leads,
    contacts,
  } = props;

  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");

  // Colors for charts
  const COLORS = [
    "#4f46e5", // Indigo
    "#10b981", // Emerald
    "#f97316", // Orange
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#0ea5e9", // Sky
    "#f43f5e", // Rose
    "#14b8a6", // Teal
    "#a855f7", // Purple
    "#06b6d4", // Cyan
  ];

  // Generate data for lead sources based on actual lead data
  const leadSources = leads.reduce((acc, lead) => {
    const source = lead.source || "Other";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const leadSourceData = Object.entries(leadSources)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .filter((item) => item.value > 0);

  // Only use real data from leads, no fallbacks
  const finalLeadSourceData = leadSourceData;

  // Generate data for deal stages
  const stageData = PIPELINE_STAGES.map((stage) => ({
    name: stage,
    count: dealsByStage[stage]?.count || 0,
    value: dealsByStage[stage]?.value || 0,
  }));

  // Generate conversion rate data
  const conversionData = [
    { name: "Leads", value: leads.length },
    { name: "Deals", value: deals.length },
    { name: "Won", value: dealsByStage["Deal Closed"]?.count || 0 },
  ];

  // Calculate conversion rates with safety checks
  const leadToDealRate =
    leads.length > 0 ? (deals.length / leads.length) * 100 : 0;
  const dealToWonRate =
    deals.length > 0
      ? ((dealsByStage["Deal Closed"]?.count || 0) / deals.length) * 100
      : 0;
  const leadToWonRate =
    leads.length > 0
      ? ((dealsByStage["Deal Closed"]?.count || 0) / leads.length) * 100
      : 0;

  // Ensure rates are valid numbers
  const safeLeadToDealRate =
    isNaN(leadToDealRate) || !isFinite(leadToDealRate) ? 0 : leadToDealRate;
  const safeDealToWonRate =
    isNaN(dealToWonRate) || !isFinite(dealToWonRate) ? 0 : dealToWonRate;
  const safeLeadToWonRate =
    isNaN(leadToWonRate) || !isFinite(leadToWonRate) ? 0 : leadToWonRate;

  // Generate monthly data for the last 12 months using actual deal data
  const generatedMonthlyData = (() => {
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
    const currentYear = currentDate.getFullYear();

    // Create a map to store monthly data
    const monthlyDataMap = new Map();

    // Process all deals and group by month/year
    deals.forEach((deal) => {
      const dealDate = new Date(
        deal.created_at || deal.updated_at || new Date(),
      );
      const dealMonth = dealDate.getMonth();
      const dealYear = dealDate.getFullYear();

      // Only include deals from the last 12 months
      const monthsAgo =
        (currentYear - dealYear) * 12 + (currentMonth - dealMonth);
      if (monthsAgo >= 0 && monthsAgo < 12) {
        const key = `${dealYear}-${dealMonth}`;
        if (!monthlyDataMap.has(key)) {
          monthlyDataMap.set(key, {
            name: monthNames[dealMonth],
            value: 0,
            month: dealMonth,
            year: dealYear,
            count: 0,
          });
        }

        const monthData = monthlyDataMap.get(key);
        monthData.value += Number(deal.value || 0);
        monthData.count += 1;
      }
    });

    // Generate data for the last 12 months, including months with no deals
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentYear - (currentMonth < monthIndex ? 1 : 0);
      const month = monthNames[monthIndex];
      const key = `${year}-${monthIndex}`;

      if (monthlyDataMap.has(key)) {
        result.push(monthlyDataMap.get(key));
      } else {
        // Add empty data for months with no deals
        result.push({
          name: month,
          value: 0,
          month: monthIndex,
          year: year,
          count: 0,
        });
      }
    }

    // Sort by date (oldest to newest)
    return result.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  })();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <div className="text-xs text-gray-500 mt-1">
              Active deals in pipeline
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Sum of all deal values
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgDealValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Average value per deal
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <div className="text-xs text-gray-500 mt-1">
              Closed deals conversion
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={chartType === "area" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("area")}
                >
                  Area
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                >
                  Line
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart data={generatedMonthlyData}>
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <RechartsTooltip
                        formatter={(value: any) => [
                          `${value.toLocaleString()}`,
                          "Value",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  ) : chartType === "bar" ? (
                    <BarChart data={generatedMonthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <RechartsTooltip
                        formatter={(value: any) => [
                          `${value.toLocaleString()}`,
                          "Value",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={generatedMonthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <RechartsTooltip
                        formatter={(value: any) => [
                          `${value.toLocaleString()}`,
                          "Value",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stageData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <RechartsTooltip
                      formatter={(value: any, name: any) =>
                        name === "count"
                          ? [value, "Deals"]
                          : [`${value.toLocaleString()}`, "Value"]
                      }
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" name="Deal Count" />
                    <Bar dataKey="value" fill="#4f46e5" name="Deal Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Lead to Deal Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {safeLeadToDealRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Leads that convert to deals
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Deal to Won Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {safeDealToWonRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Deals that close successfully
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Lead to Won Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {safeLeadToWonRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Overall conversion rate
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conversionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#4f46e5">
                      {conversionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={finalLeadSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {finalLeadSourceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: any) => [value, "Leads"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
