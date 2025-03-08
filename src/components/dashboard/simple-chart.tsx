"use client";

import { useEffect, useState } from "react";

type SimpleChartProps = {
  deals: any[];
};

export default function SimpleChart({ deals }: SimpleChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [maxValue, setMaxValue] = useState(1);

  // Process data based on period
  useEffect(() => {
    let data: any[] = [];
    let max = 1;

    // Fixed monthly values for consistent display
    const monthlyValues = [
      15000, 22000, 18000, 25000, 30000, 28000, 35000, 42000, 38000, 45000,
      40000, 120000,
    ];

    // Fixed month labels
    const monthLabels = [
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
    ];

    // Generate some sample data if no deals exist
    const generateSampleData = (
      length: number,
      labelFn: (date: Date, i: number) => string,
    ) => {
      return Array.from({ length }).map((_, i) => {
        // Use fixed values for monthly view, random for others
        const value = monthlyValues[i % monthlyValues.length];

        if (value > max) max = value;

        const date = new Date();
        date.setMonth(date.getMonth() - (length - 1) + i);

        return {
          // For monthly view, use fixed labels
          label: monthLabels[i],
          value,
          date,
          isCurrentPeriod: i === 11, // Always highlight the last month (March)
        };
      });
    };

    // Monthly (default)
    if (deals && deals.length > 0) {
      data = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);

        const monthDeals = deals.filter((deal) => {
          const dealDate = new Date(
            deal.created_at || deal.updated_at || new Date(),
          );
          return (
            dealDate.getMonth() === date.getMonth() &&
            dealDate.getFullYear() === date.getFullYear()
          );
        });

        const value = monthDeals.reduce(
          (sum, deal) => sum + Number(deal.value || 0),
          0,
        );
        if (value > max) max = value;

        return {
          label: date.toLocaleString("default", { month: "short" }),
          value,
          date,
          isCurrentPeriod:
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear(),
        };
      });
    } else {
      data = generateSampleData(12, (date) =>
        date.toLocaleString("default", { month: "short" }),
      );
    }

    // Ensure we have a reasonable max value for visualization
    if (max <= 1) max = 120000;

    setChartData(data);
    setMaxValue(max);
  }, [deals]);

  return (
    <div className="h-[300px] w-full">
      <div className="h-[240px] w-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 240"
          preserveAspectRatio="none"
        >
          <path
            d={`M ${chartData
              .map((point, i) => {
                const x = (i / (chartData.length - 1)) * 800;
                // Use fixed scale for consistent display
                const y = 240 - (point.value / 120000) * 220;
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}`}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
          />
          {chartData.map((point, i) => {
            const x = (i / (chartData.length - 1)) * 800;
            // Use fixed scale for consistent display
            const y = 240 - (point.value / 120000) * 220;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill={i === 11 ? "#2563eb" : "#4f46e5"}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex items-center justify-between h-[60px] w-full px-2 overflow-x-auto">
        {chartData.map((point, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center text-center min-w-[40px]"
          >
            <div className="text-xs font-medium text-[#6b7280] whitespace-nowrap">
              {point.label}
            </div>
            <div className="text-xs text-[#6b7280] whitespace-nowrap">
              ${point.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
