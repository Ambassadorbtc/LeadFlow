"use client";

import { useEffect, useState } from "react";
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
} from "recharts";

type SalesChartProps = {
  deals: any[];
};

export default function SalesChartRecharts({ deals }: SalesChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<"area" | "bar" | "pie">("area");

  useEffect(() => {
    // Generate monthly data for the last 12 months
    const data = [];
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
      data.push({
        name: month,
        value: value,
        month: monthIndex,
        year: year,
      });
    }

    setChartData(data);

    // Generate pie chart data by deal type
    const dealTypeMap = deals.reduce((acc, deal) => {
      const type = deal.deal_type || "Other";
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += Number(deal.value || 0);
      return acc;
    }, {});

    const pieChartData = Object.entries(dealTypeMap).map(([name, value]) => ({
      name,
      value,
    }));

    setPieData(pieChartData);
  }, [deals]);

  // Colors for pie chart
  const COLORS = [
    "#4f46e5",
    "#10b981",
    "#f97316",
    "#8b5cf6",
    "#ec4899",
    "#0ea5e9",
  ];

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setChartType("area")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${chartType === "area" ? "bg-[#4f46e5] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"}`}
        >
          Area Chart
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${chartType === "bar" ? "bg-[#4f46e5] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"}`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType("pie")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${chartType === "pie" ? "bg-[#4f46e5] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"}`}
        >
          Pie Chart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:col-span-2">
          <h3 className="text-sm font-medium mb-2">Sales Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
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
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium mb-2">Deal Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:col-span-3">
          <h3 className="text-sm font-medium mb-2">Monthly Performance</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toLocaleString()}`,
                    "Revenue",
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
                />
                <Bar
                  dataKey="value"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
