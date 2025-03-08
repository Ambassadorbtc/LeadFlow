"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tooltip,
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

  // Only use real data from deals, no fallbacks
  const calculatedDealTypeData = deals.reduce(
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

  // Convert to array format for the chart
  const dealTypeData = Object.entries(calculatedDealTypeData)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  // Only use real data, no fallbacks
  const finalMonthlyData = generatedMonthlyData;
  const finalDealTypeData = dealTypeData;

  return (
    <div className="px-4 py-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Sales Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Track your sales performance and pipeline metrics
        </p>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Total Deals
                  </h3>
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold dark:text-white">
                  {totalDeals}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Across all pipeline stages
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Total Value
                  </h3>
                  <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-2">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold dark:text-white">
                  ${totalValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Sum of all deal values
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Avg. Deal Value
                  </h3>
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold dark:text-white">
                  $
                  {avgDealValue.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Average value per deal
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Win Rate
                  </h3>
                  <div className="rounded-full bg-orange-100 dark:bg-orange-900/50 p-2">
                    <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold dark:text-white">
                  {winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {dealsByStage["Deal Closed"]?.count || 0} won /{" "}
                  {(dealsByStage["Deal Closed"]?.count || 0) +
                    (dealsByStage["Deal Lost"]?.count || 0)}{" "}
                  closed
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Trend Chart */}
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Sales Trend</CardTitle>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartType("area")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${chartType === "area" ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartType("bar")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${chartType === "bar" ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => setChartType("line")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${chartType === "line" ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                  >
                    Line
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart data={finalMonthlyData}>
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
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        className="dark:stroke-gray-700"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        className="dark:text-gray-400"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        className="dark:text-gray-400"
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Sales",
                        ]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.375rem",
                          boxShadow:
                            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                          border: "none",
                          padding: "0.5rem",
                        }}
                        itemStyle={{ color: "#4f46e5" }}
                        labelStyle={{ color: "#111827" }}
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  ) : chartType === "bar" ? (
                    <BarChart data={finalMonthlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        className="dark:stroke-gray-700"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        className="dark:text-gray-400"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        className="dark:text-gray-400"
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Sales",
                        ]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.375rem",
                          boxShadow:
                            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                          border: "none",
                          padding: "0.5rem",
                        }}
                        itemStyle={{ color: "#10b981" }}
                        labelStyle={{ color: "#111827" }}
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={finalMonthlyData.filter((item) => item.value > 0)}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        className="dark:stroke-gray-700"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        className="dark:text-gray-400"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        className="dark:text-gray-400"
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Sales",
                        ]}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.375rem",
                          boxShadow:
                            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                          border: "none",
                          padding: "0.5rem",
                        }}
                        itemStyle={{ color: "#8b5cf6" }}
                        labelStyle={{ color: "#111827" }}
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#8b5cf6" }}
                        activeDot={{ r: 6, fill: "#8b5cf6" }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Deal Type Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deal Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={finalDealTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {finalDealTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Value",
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.375rem",
                          boxShadow:
                            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                          border: "none",
                          padding: "0.5rem",
                        }}
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={finalLeadSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {finalLeadSourceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[(index + 3) % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value, "Leads"]}
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "0.375rem",
                          boxShadow:
                            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                          border: "none",
                          padding: "0.5rem",
                        }}
                        className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          {/* Pipeline Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Stage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {PIPELINE_STAGES.map((stage) => {
                  const stageData = dealsByStage[stage] || {
                    count: 0,
                    value: 0,
                  };
                  const percentage =
                    totalDeals > 0 ? (stageData.count / totalDeals) * 100 : 0;

                  return (
                    <div key={stage}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {stage}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            ({stageData.count} deals)
                          </span>
                        </div>
                        <span className="text-sm font-medium dark:text-gray-300">
                          ${stageData.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Value Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stageData.filter((item) => item.value > 0)}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-700"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      className="dark:text-gray-400"
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      className="dark:text-gray-400"
                      width={120}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Value",
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.375rem",
                        boxShadow:
                          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                        border: "none",
                        padding: "0.5rem",
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                    <Bar
                      dataKey="value"
                      fill="#4f46e5"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Deal Count by Stage */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Count by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData.filter((item) => item.count > 0)}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 12,
                        fill: "#6b7280",
                        angle: -45,
                        textAnchor: "end",
                      }}
                      className="dark:text-gray-400"
                      height={70}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      className="dark:text-gray-400"
                    />
                    <Tooltip
                      formatter={(value) => [value, "Deals"]}
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.375rem",
                        boxShadow:
                          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                        border: "none",
                        padding: "0.5rem",
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                    <Bar
                      dataKey="count"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          {/* Conversion Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Lead to Deal
                  </h3>
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold dark:text-white">
                  {safeLeadToDealRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {deals.length} deals from {leads.length} leads
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Deal to Won
                  </h3>
                  <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-2">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold dark:text-white">
                  {safeDealToWonRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {dealsByStage["Deal Closed"]?.count || 0} won from{" "}
                  {deals.length} deals
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Lead to Won
                  </h3>
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold dark:text-white">
                  {safeLeadToWonRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {dealsByStage["Deal Closed"]?.count || 0} won from{" "}
                  {leads.length} leads
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conversionData.filter((item) => item.value > 0)}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      className="dark:text-gray-400"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      className="dark:text-gray-400"
                    />
                    <Tooltip
                      formatter={(value) => [value, "Count"]}
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.375rem",
                        boxShadow:
                          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                        border: "none",
                        padding: "0.5rem",
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                    <Bar
                      dataKey="value"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                      barSize={60}
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle className="h-5 w-5 mr-2" />
                  Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold mb-2 dark:text-white">
                    {leads.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total leads in the system
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      New
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      {leads.filter((l) => l.status === "New").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Contacted
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      {leads.filter((l) => l.status === "Contacted").length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Qualified
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      {leads.filter((l) => l.status === "Qualified").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold mb-2 dark:text-white">
                    {deals.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total deals in the pipeline
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Open
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      {deals.length -
                        (dealsByStage["Deal Closed"]?.count || 0) -
                        (dealsByStage["Deal Lost"]?.count || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Won
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      {dealsByStage["Deal Closed"]?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Lost
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      {dealsByStage["Deal Lost"]?.count || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold mb-2 dark:text-white">
                    {contacts.filter((c) => c.company).length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Companies with contacts
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      With deals
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      {
                        new Set(deals.map((d) => d.company).filter(Boolean))
                          .size
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Contacts
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      {contacts.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Avg. Deal Size
                    </span>
                    <span className="font-medium dark:text-gray-300">
                      $
                      {avgDealValue.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={finalMonthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-700"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      className="dark:text-gray-400"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      className="dark:text-gray-400"
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "Sales",
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.375rem",
                        boxShadow:
                          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                        border: "none",
                        padding: "0.5rem",
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#4f46e5" }}
                      activeDot={{ r: 6, fill: "#4f46e5" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
