"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, LineChart, Calendar } from "lucide-react";

type ChartProps = {
  deals: any[];
};

export default function SalesChart({ deals }: ChartProps) {
  const searchParams = useSearchParams();
  const [chartType, setChartType] = useState(
    searchParams.get("chart") || "bar",
  );
  const [period, setPeriod] = useState(searchParams.get("period") || "monthly");

  // State for chart data
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
        const value =
          period === "monthly"
            ? monthlyValues[i % monthlyValues.length]
            : Math.floor(5000 + Math.random() * 45000);

        if (value > max) max = value;

        const date = new Date();
        if (period === "daily") {
          date.setDate(date.getDate() - (length - 1) + i);
        } else if (period === "weekly") {
          date.setDate(date.getDate() - (length - 1 - i) * 7);
        } else {
          date.setMonth(date.getMonth() - (length - 1) + i);
        }

        return {
          // For monthly view, use fixed labels
          label: period === "monthly" ? monthLabels[i] : labelFn(date, i),
          value,
          date,
          isCurrentPeriod: i === 11, // Always highlight the last month (March)
        };
      });
    };

    if (period === "daily") {
      // Last 30 days
      if (deals && deals.length > 0) {
        data = Array.from({ length: 30 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 29 + i);

          const dayDeals = deals.filter((deal) => {
            const dealDate = new Date(
              deal.created_at || deal.updated_at || new Date(),
            );
            return (
              dealDate.getDate() === date.getDate() &&
              dealDate.getMonth() === date.getMonth() &&
              dealDate.getFullYear() === date.getFullYear()
            );
          });

          const value = dayDeals.reduce(
            (sum, deal) => sum + Number(deal.value || 0),
            0,
          );
          if (value > max) max = value;

          return {
            label: date.getDate().toString(),
            value,
            date,
            isCurrentPeriod:
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear(),
          };
        });
      } else {
        data = generateSampleData(30, (date) => date.getDate().toString());
      }
    } else if (period === "weekly") {
      // Last 12 weeks
      if (deals && deals.length > 0) {
        data = Array.from({ length: 12 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (11 - i) * 7);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          const weekDeals = deals.filter((deal) => {
            const dealDate = new Date(
              deal.created_at || deal.updated_at || new Date(),
            );
            return dealDate >= weekStart && dealDate <= weekEnd;
          });

          const value = weekDeals.reduce(
            (sum, deal) => sum + Number(deal.value || 0),
            0,
          );
          if (value > max) max = value;

          return {
            label: `W${i + 1}`,
            value,
            date,
            isCurrentPeriod: Math.floor(i / 4) === 2, // Highlight a week in the middle
          };
        });
      } else {
        data = generateSampleData(12, (_, i) => `W${i + 1}`);
      }
    } else {
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
    }

    // Ensure we have a reasonable max value for visualization
    if (max <= 1) max = 120000;

    setChartData(data);
    setMaxValue(max);
  }, [deals, period]);

  // Chart type and period selectors
  const ChartControls = () => (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-2">
        <button
          onClick={() => setPeriod("daily")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${period === "daily" ? "bg-[#4f46e5] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"}`}
        >
          Daily
        </button>
        <button
          onClick={() => setPeriod("weekly")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${period === "weekly" ? "bg-[#4f46e5] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setPeriod("monthly")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${period === "monthly" ? "bg-[#4f46e5] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"}`}
        >
          Monthly
        </button>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => setChartType("line")}
          className={`flex items-center text-sm transition-colors ${chartType === "line" ? "text-[#4f46e5]" : "text-[#6b7280] hover:text-[#4f46e5]"}`}
        >
          <LineChart className="h-4 w-4 mr-1" />
          <span>Line</span>
        </button>
        <button
          onClick={() => setChartType("bar")}
          className={`flex items-center text-sm transition-colors ${chartType === "bar" ? "text-[#4f46e5]" : "text-[#6b7280] hover:text-[#4f46e5]"}`}
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          <span>Bar</span>
        </button>
        <button
          onClick={() => setChartType("gradient")}
          className={`flex items-center text-sm transition-colors ${chartType === "gradient" ? "text-[#4f46e5]" : "text-[#6b7280] hover:text-[#4f46e5]"}`}
        >
          <Calendar className="h-4 w-4 mr-1" />
          <span>Gradient</span>
        </button>
      </div>
    </div>
  );

  // Line Chart Component
  const LineChartComponent = () => (
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

  // Gradient Chart Component
  const GradientChartComponent = () => (
    <div className="h-[300px] w-full">
      <div className="h-[240px] w-full flex items-end justify-between px-2">
        {chartData.map((point, i) => {
          // Use a fixed scale to make bars more visible
          const height = (point.value / 120000) * 100;

          return (
            <div
              key={i}
              className="h-full flex flex-col justify-end items-center"
              style={{ width: `${100 / chartData.length}%`, maxWidth: "60px" }}
            >
              <div
                style={{
                  height: `${height}%`,
                  width: "80%",
                  minWidth: "20px",
                  maxWidth: "40px",
                  borderTopLeftRadius: "0.375rem",
                  borderTopRightRadius: "0.375rem",
                  background:
                    i === 11
                      ? "linear-gradient(to top, #2563eb, #60a5fa)"
                      : "linear-gradient(to top, #4f46e5, #818cf8)",
                }}
              ></div>
            </div>
          );
        })}
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

  // Bar Chart Component
  const BarChartComponent = () => (
    <div className="h-[300px] w-full">
      <div className="h-[240px] w-full flex items-end justify-between px-2">
        {chartData.map((point, i) => {
          // Use a fixed scale to make bars more visible
          const height = (point.value / 120000) * 100;

          return (
            <div
              key={i}
              className="h-full flex flex-col justify-end items-center"
              style={{ width: `${100 / chartData.length}%`, maxWidth: "60px" }}
            >
              <div
                className={`rounded-t-md ${i === 11 ? "bg-blue-600" : "bg-indigo-600"}`}
                style={{
                  height: `${height}%`,
                  width: "80%",
                  minWidth: "20px",
                  maxWidth: "40px",
                }}
              ></div>
            </div>
          );
        })}
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

  return (
    <div className="w-full">
      <ChartControls />

      {chartType === "line" && <LineChartComponent />}
      {chartType === "gradient" && <GradientChartComponent />}
      {chartType === "bar" && <BarChartComponent />}
    </div>
  );
}
