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
import { Button } from "@/components/ui/button";

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

  // Use the generated monthly data
  const monthlyData = generatedMonthlyData;

  // Generate data for deal types
  const dealTypes = deals.reduce((acc, deal) => {
    const type = deal.deal_type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const dealTypeData = Object.entries(dealTypes)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="text-xs text-muted-foreground">
              Across all pipeline stages
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined value of all deals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Deal Value
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${avgDealValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average value per deal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Percentage of deals won
            </p>
          </CardContent>
        </Card>
      </div>

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
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Performance</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={chartType === "area" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("area")}
                    className="h-8"
                  >
                    Area
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className="h-8"
                  >
                    Bar
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    className="h-8"
                  >
                    Line
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart
                      data={monthlyData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Value",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS[0]}
                        fill={COLORS[0]}
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  ) : chartType === "bar" ? (
                    <BarChart
                      data={monthlyData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Value",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        fill={COLORS[0]}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={monthlyData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Value",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS[0]}
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

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deal Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dealTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {dealTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          value,
                          props.payload.name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: "John Doe", value: 120000 },
                        { name: "Jane Smith", value: 98000 },
                        { name: "Robert Johnson", value: 86000 },
                        { name: "Emily Davis", value: 72000 },
                        { name: "Michael Brown", value: 65000 },
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Value",
                        ]}
                      />
                      <Bar
                        dataKey="value"
                        fill={COLORS[1]}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stageData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke={COLORS[0]}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={COLORS[1]}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "value"
                          ? `$${Number(value).toLocaleString()}`
                          : value,
                        name === "value" ? "Value" : "Count",
                      ]}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="value"
                      fill={COLORS[0]}
                      name="Value"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="count"
                      fill={COLORS[1]}
                      name="Count"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Lead to Deal Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {safeLeadToDealRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {leads.length} leads → {deals.length} deals
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Deal to Won Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {safeDealToWonRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {deals.length} deals →{" "}
                  {dealsByStage["Deal Closed"]?.count || 0} won
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Lead to Won Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {safeLeadToWonRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {leads.length} leads →{" "}
                  {dealsByStage["Deal Closed"]?.count || 0} won
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={conversionData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS[2]} radius={[4, 4, 0, 0]}>
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
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={finalLeadSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
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
                    <Tooltip
                      formatter={(value, name, props) => [
                        value,
                        props.payload.name,
                      ]}
                    />
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
