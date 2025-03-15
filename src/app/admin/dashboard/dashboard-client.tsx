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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  UserCheck,
  ClipboardList,
  DollarSign,
  Activity,
  BarChart3,
} from "lucide-react";

interface AdminDashboardClientProps {
  totalUsers: number;
  activeUsers: number;
  totalLeads: number;
  totalDeals: number;
  totalDealValue: number;
  users: any[];
}

export default function AdminDashboardClient({
  totalUsers,
  activeUsers,
  totalLeads,
  totalDeals,
  totalDealValue,
  users,
}: AdminDashboardClientProps) {
  // Prepare data for user activity chart
  const userActivityData = [
    { name: "Active Users", value: activeUsers },
    { name: "Inactive Users", value: totalUsers - activeUsers },
  ];

  // Prepare data for user registration chart (last 6 months)
  const months = [
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
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  const userRegistrationData = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const year =
      currentDate.getFullYear() - (currentMonth < monthIndex ? 1 : 0);
    const month = months[monthIndex];

    // Count users registered in this month
    const usersInMonth = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return (
        createdAt.getMonth() === monthIndex && createdAt.getFullYear() === year
      );
    }).length;

    userRegistrationData.push({
      name: month,
      users: usersInMonth,
    });
  }

  // Colors for charts
  const COLORS = ["#4f46e5", "#94a3b8", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        Admin Dashboard
      </h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Users
                </p>
                <h3 className="text-2xl font-bold">{totalUsers}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Active Users
                </p>
                <h3 className="text-2xl font-bold">{activeUsers}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/30">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Leads
                </p>
                <h3 className="text-2xl font-bold">{totalLeads}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900/30">
                <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Deal Value
                </p>
                <h3 className="text-2xl font-bold">
                  ${totalDealValue.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-full dark:bg-amber-900/30">
                <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  User Registrations (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userRegistrationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="users"
                        fill="#4f46e5"
                        name="New Users"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  User Activity Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userActivityData}
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
                        {userActivityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Average Leads per User
                  </div>
                  <div className="text-2xl font-bold mt-1 dark:text-white">
                    {totalUsers > 0
                      ? (totalLeads / totalUsers).toFixed(1)
                      : "0"}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Average Deals per User
                  </div>
                  <div className="text-2xl font-bold mt-1 dark:text-white">
                    {totalUsers > 0
                      ? (totalDeals / totalUsers).toFixed(1)
                      : "0"}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Average Deal Value per User
                  </div>
                  <div className="text-2xl font-bold mt-1 dark:text-white">
                    $
                    {totalUsers > 0
                      ? (totalDealValue / totalUsers).toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 0,
                          },
                        )
                      : "0"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
