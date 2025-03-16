"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Building2,
  Briefcase,
} from "lucide-react";

interface DashboardMetrics {
  totalLeads: number;
  totalDeals: number;
  totalContacts: number;
  totalCompanies: number;
  totalDealValue: number;
  leadsBySource: { name: string; value: number }[];
  dealsByStage: { name: string; value: number; amount: number }[];
  monthlyDeals: { name: string; deals: number; value: number }[];
  leadConversionRate: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];

export default function ReportingDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const supabase = await createClient();

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        // Fetch total counts
        const [leadsResult, dealsResult, contactsResult, companiesResult] =
          await Promise.all([
            supabase.from("leads").select("count").single(),
            supabase.from("deals").select("count").single(),
            supabase.from("contacts").select("count").single(),
            supabase.from("companies").select("count").single(),
          ]);

        // Fetch total deal value
        const { data: dealValueData } = await supabase
          .from("deals")
          .select("deal_value");

        const totalDealValue =
          dealValueData?.reduce(
            (sum, deal) => sum + (deal.deal_value || 0),
            0,
          ) || 0;

        // Fetch leads by source
        const { data: leadsBySourceData } = await supabase
          .from("leads")
          .select("source, count")
          .not("source", "is", null)
          .group("source");

        const leadsBySource =
          leadsBySourceData?.map((item) => ({
            name: item.source || "Unknown",
            value: item.count,
          })) || [];

        // Fetch deals by stage
        const { data: dealsByStageData } = await supabase
          .from("deals")
          .select("stage, count, sum(deal_value) as amount")
          .group("stage");

        const dealsByStage =
          dealsByStageData?.map((item) => ({
            name: item.stage || "Unknown",
            value: item.count,
            amount: item.amount || 0,
          })) || [];

        // Fetch monthly deals
        const { data: monthlyDealsData } = await supabase
          .from("deals")
          .select("created_at, deal_value")
          .gte("created_at", startDateStr)
          .lte("created_at", endDateStr);

        // Group by month
        const monthlyDealsMap = new Map();
        monthlyDealsData?.forEach((deal) => {
          const date = new Date(deal.created_at);
          const monthYear = date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });

          if (!monthlyDealsMap.has(monthYear)) {
            monthlyDealsMap.set(monthYear, { deals: 0, value: 0 });
          }

          const current = monthlyDealsMap.get(monthYear);
          monthlyDealsMap.set(monthYear, {
            deals: current.deals + 1,
            value: current.value + (deal.deal_value || 0),
          });
        });

        const monthlyDeals = Array.from(monthlyDealsMap.entries()).map(
          ([name, data]) => ({
            name,
            deals: data.deals,
            value: data.value,
          }),
        );

        // Calculate lead conversion rate
        const { data: convertedLeadsData } = await supabase
          .from("leads")
          .select("count")
          .eq("status", "Converted")
          .single();

        const totalLeads = leadsResult.data?.count || 0;
        const convertedLeads = convertedLeadsData?.count || 0;
        const leadConversionRate =
          totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        setMetrics({
          totalLeads: totalLeads,
          totalDeals: dealsResult.data?.count || 0,
          totalContacts: contactsResult.data?.count || 0,
          totalCompanies: companiesResult.data?.count || 0,
          totalDealValue,
          leadsBySource,
          dealsByStage,
          monthlyDeals,
          leadConversionRate,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.leadConversionRate
                ? metrics.leadConversionRate.toFixed(1)
                : 0}
              % conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deal Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalDealValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {metrics?.totalDeals || 0} deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contacts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalContacts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              From {metrics?.totalCompanies || 0} companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.dealsByStage
                .filter((d) => !["Closed Won", "Closed Lost"].includes(d.name))
                .reduce((sum, stage) => sum + stage.value, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.dealsByStage.find((d) => d.name === "Closed Won")
                ?.value || 0}{" "}
              deals won
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Deals</CardTitle>
                <CardDescription>
                  Number of deals and value by month
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics?.monthlyDeals || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "value")
                          return formatCurrency(value as number);
                        return value;
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="deals"
                      fill="#8884d8"
                      name="Deals"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="value"
                      fill="#82ca9d"
                      name="Value"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Deals by Stage</CardTitle>
                <CardDescription>
                  Distribution of deals across pipeline stages
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.dealsByStage || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics?.dealsByStage.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => {
                        const entry =
                          metrics?.dealsByStage[props.payload.index];
                        return [
                          `${value} deals (${formatCurrency(entry?.amount || 0)})`,
                          entry?.name,
                        ];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Leads by Source</CardTitle>
                <CardDescription>
                  Distribution of leads by acquisition source
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.leadsBySource || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics?.leadsBySource.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Lead Conversion</CardTitle>
                <CardDescription>
                  Lead to deal conversion metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-80">
                  <div className="text-5xl font-bold mb-4">
                    {metrics?.leadConversionRate
                      ? metrics.leadConversionRate.toFixed(1)
                      : 0}
                    %
                  </div>
                  <p className="text-muted-foreground text-center mb-6">
                    Lead to Deal Conversion Rate
                  </p>
                  <div className="grid grid-cols-2 gap-8 w-full max-w-xs">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {metrics?.totalLeads || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Leads
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {metrics?.totalDeals || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Deals
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Value by Stage</CardTitle>
              <CardDescription>
                Total value of deals in each pipeline stage
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics?.dealsByStage || []}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" scale="band" />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) => `Stage: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#82ca9d" name="Deal Value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
