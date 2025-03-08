"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type SalesChartProps = {
  deals: any[];
};

export default function SalesChartRecharts({ deals }: SalesChartProps) {
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

  // Process deals to get monthly data
  const monthlyData = useMemo(() => {
    const data: Record<string, { month: string; value: number }> = {};

    // Initialize with all months
    monthNames.forEach((month) => {
      data[month] = { month, value: 0 };
    });

    // Add deal values to corresponding months
    if (deals && Array.isArray(deals)) {
      deals.forEach((deal) => {
        const date = new Date(deal.created_at || deal.updated_at || new Date());
        const month = monthNames[date.getMonth()];
        const dealValue = Number(deal.value || 0);
        data[month].value += isNaN(dealValue) ? 0 : dealValue;
      });
    }

    // Convert to array and sort by month index
    return Object.values(data).sort(
      (a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month),
    );
  }, [deals]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlyData}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
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
  );
}
