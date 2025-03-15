"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Lead {
  id: string;
  created_at: string;
  status: string;
  source: string;
}

interface Deal {
  id: string;
  created_at: string;
  stage: string;
  value: number;
}

interface User {
  id: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface AdminReportsClientProps {
  leads: Lead[];
  deals: Deal[];
  users: User[];
}

export default function AdminReportsClient({
  leads,
  deals,
  users,
}: AdminReportsClientProps) {
  // Calculate monthly user signups
  const userSignupsByMonth = users.reduce(
    (acc: Record<string, number>, user) => {
      const date = new Date(user.created_at);
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear]++;

      return acc;
    },
    {},
  );

  const userSignupsData = Object.entries(userSignupsByMonth).map(
    ([month, count]) => ({
      month,
      count,
    }),
  );

  // Calculate lead sources
  const leadSources = leads.reduce((acc: Record<string, number>, lead) => {
    const source = lead.source || "Unknown";
    const sourceKey = typeof source === "string" ? source : "Unknown";

    if (!acc[sourceKey]) {
      acc[sourceKey] = 0;
    }
    acc[sourceKey]++;

    return acc;
  }, {});

  const leadSourcesData = Object.entries(leadSources).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate deal stages
  const dealStages = deals.reduce((acc: Record<string, number>, deal) => {
    const stage = deal.stage || "Unknown";
    const stageKey = typeof stage === "string" ? stage : "Unknown";

    if (!acc[stageKey]) {
      acc[stageKey] = 0;
    }
    acc[stageKey] += Number(deal.value) || 0;

    return acc;
  }, {});

  const dealStagesData = Object.entries(dealStages).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate monthly deal values
  const dealValuesByMonth = deals.reduce(
    (acc: Record<string, number>, deal) => {
      const date = new Date(deal.created_at);
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;

      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += Number(deal.value) || 0;

      return acc;
    },
    {},
  );

  const dealValuesData = Object.entries(dealValuesByMonth).map(
    ([month, value]) => ({
      month,
      value,
    }),
  );

  // Colors for pie charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Analytics & Reports</h1>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="deals">Deal Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Signups by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userSignupsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="New Users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-60">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      {users.filter((user) => user.last_sign_in_at).length}
                    </div>
                    <div className="text-muted-foreground">Active Users</div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {Math.round(
                        (users.filter((user) => user.last_sign_in_at).length /
                          users.length) *
                          100,
                      )}
                      % of total users
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-60">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      {users.length}
                    </div>
                    <div className="text-muted-foreground">Total Users</div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {userSignupsData.length > 0
                        ? `Across ${userSignupsData.length} months`
                        : "No data available"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadSourcesData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leadSourcesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Remove the first reduce that was rendering an object directly */}
                  {Object.entries(
                    leads.reduce((acc: Record<string, number>, lead) => {
                      const status = lead.status || "Unknown";
                      const statusKey =
                        typeof status === "string" ? status : "Unknown";
                      if (!acc[statusKey]) acc[statusKey] = 0;
                      acc[statusKey]++;
                      return acc;
                    }, {}),
                  ).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex justify-between items-center"
                    >
                      <div className="font-medium">{status}</div>
                      <div className="flex items-center">
                        <div className="mr-2">{count}</div>
                        <div className="text-xs text-muted-foreground">
                          ({Math.round((count / leads.length) * 100)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-60">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      {leads.length}
                    </div>
                    <div className="text-muted-foreground">Total Leads</div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {leads.length > 0
                        ? `${(leads.length / users.length).toFixed(1)} leads per user`
                        : "No data available"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Value by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealValuesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Value"]} />
                    <Legend />
                    <Bar dataKey="value" name="Deal Value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deal Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dealStagesData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dealStagesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, "Value"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-60">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      $
                      {deals
                        .reduce(
                          (sum, deal) => sum + (Number(deal.value) || 0),
                          0,
                        )
                        .toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">
                      Total Deal Value
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {deals.length > 0
                        ? `Across ${deals.length} deals`
                        : "No data available"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
