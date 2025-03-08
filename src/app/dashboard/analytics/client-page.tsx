"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsChart from "@/components/dashboard/analytics-chart";

type AnalyticsClientProps = {
  deals: any[];
  leads: any[];
  contacts: any[];
};

export default function AnalyticsClient({
  deals,
  leads,
  contacts,
}: AnalyticsClientProps) {
  // No need for isMounted ref anymore as we handle this in the AnalyticsChart component

  const [timeframe, setTimeframe] = useState<
    "weekly" | "monthly" | "quarterly" | "yearly"
  >("monthly");

  // Add state to track active tab
  const [activeTab, setActiveTab] = useState("revenue");

  // Calculate monthly data for deals using real data
  const getMonthlyData = () => {
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
    const currentYear = currentDate.getFullYear();

    // Get last 12 months in order
    const labels = [];
    const monthsData = [];

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      labels.push(months[monthIndex]);
      monthsData.push({ month: monthIndex, year });
    }

    // Calculate real deal values by month
    const dealValues = monthsData.map(({ month, year }) => {
      return deals
        .filter((deal) => {
          const dealDate = new Date(deal.created_at);
          return (
            dealDate.getMonth() === month && dealDate.getFullYear() === year
          );
        })
        .reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    });

    // Calculate real lead counts by month
    const leadCounts = monthsData.map(({ month, year }) => {
      return leads.filter((lead) => {
        const leadDate = new Date(lead.created_at);
        return leadDate.getMonth() === month && leadDate.getFullYear() === year;
      }).length;
    });

    return {
      labels,
      dealValues,
      leadCounts,
    };
  };

  const getQuarterlyData = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const quarters = [
      { name: `Q1 ${currentYear}`, months: [0, 1, 2] },
      { name: `Q2 ${currentYear}`, months: [3, 4, 5] },
      { name: `Q3 ${currentYear}`, months: [6, 7, 8] },
      { name: `Q4 ${currentYear}`, months: [9, 10, 11] },
    ];

    // Calculate real deal values by quarter
    const dealValues = quarters.map((quarter) => {
      return deals
        .filter((deal) => {
          const dealDate = new Date(deal.created_at);
          return (
            quarter.months.includes(dealDate.getMonth()) &&
            dealDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    });

    // Calculate real lead counts by quarter
    const leadCounts = quarters.map((quarter) => {
      return leads.filter((lead) => {
        const leadDate = new Date(lead.created_at);
        return (
          quarter.months.includes(leadDate.getMonth()) &&
          leadDate.getFullYear() === currentYear
        );
      }).length;
    });

    return {
      labels: quarters.map((q) => q.name),
      dealValues,
      leadCounts,
    };
  };

  const getWeeklyData = () => {
    // Get the last 8 weeks
    const weeks = [];
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * msPerWeek);
      const weekEnd = new Date(weekStart.getTime() + msPerWeek - 1);
      weeks.push({
        label: `Week ${8 - i}`,
        start: weekStart,
        end: weekEnd,
      });
    }

    // Calculate real deal values by week
    const dealValues = weeks.map((week) => {
      return deals
        .filter((deal) => {
          const dealDate = new Date(deal.created_at);
          return dealDate >= week.start && dealDate <= week.end;
        })
        .reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    });

    // Calculate real lead counts by week
    const leadCounts = weeks.map((week) => {
      return leads.filter((lead) => {
        const leadDate = new Date(lead.created_at);
        return leadDate >= week.start && leadDate <= week.end;
      }).length;
    });

    return {
      labels: weeks.map((w) => w.label),
      dealValues,
      leadCounts,
    };
  };

  const getYearlyData = () => {
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear - 3,
      currentYear - 2,
      currentYear - 1,
      currentYear,
    ];

    // Calculate real deal values by year
    const dealValues = years.map((year) => {
      return deals
        .filter((deal) => {
          const dealDate = new Date(deal.created_at);
          return dealDate.getFullYear() === year;
        })
        .reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    });

    // Calculate real lead counts by year
    const leadCounts = years.map((year) => {
      return leads.filter((lead) => {
        const leadDate = new Date(lead.created_at);
        return leadDate.getFullYear() === year;
      }).length;
    });

    return {
      labels: years.map((y) => y.toString()),
      dealValues,
      leadCounts,
    };
  };

  let chartData;
  switch (timeframe) {
    case "weekly":
      chartData = getWeeklyData();
      break;
    case "quarterly":
      chartData = getQuarterlyData();
      break;
    case "yearly":
      chartData = getYearlyData();
      break;
    default:
      chartData = getMonthlyData();
  }

  // Calculate deal type distribution
  const dealTypes = deals.reduce((acc, deal) => {
    const type = deal.deal_type || "Other";
    acc[type] = (acc[type] || 0) + Number(deal.value || 0);
    return acc;
  }, {});

  const dealTypeData = {
    labels: Object.keys(dealTypes),
    datasets: [Object.values(dealTypes)],
  };

  // Calculate real conversion rates
  const calculateConversionRates = () => {
    if (timeframe === "monthly") {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyRates = [];

      for (let i = 11; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

        // Count leads created in this month
        const monthLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.created_at);
          return (
            leadDate.getMonth() === monthIndex &&
            leadDate.getFullYear() === year
          );
        }).length;

        // Count leads converted to deals in this month
        const convertedLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.created_at);
          return (
            leadDate.getMonth() === monthIndex &&
            leadDate.getFullYear() === year &&
            lead.status === "Convert"
          );
        }).length;

        // Calculate conversion rate (avoid division by zero)
        const rate = monthLeads > 0 ? (convertedLeads / monthLeads) * 100 : 0;
        monthlyRates.push(Math.round(rate));
      }

      return monthlyRates;
    } else if (timeframe === "quarterly") {
      // Similar logic for quarterly data
      const currentYear = new Date().getFullYear();
      const quarters = [
        { months: [0, 1, 2] },
        { months: [3, 4, 5] },
        { months: [6, 7, 8] },
        { months: [9, 10, 11] },
      ];

      return quarters.map((quarter) => {
        const quarterLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.created_at);
          return (
            quarter.months.includes(leadDate.getMonth()) &&
            leadDate.getFullYear() === currentYear
          );
        }).length;

        const convertedLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.created_at);
          return (
            quarter.months.includes(leadDate.getMonth()) &&
            leadDate.getFullYear() === currentYear &&
            lead.status === "Convert"
          );
        }).length;

        return quarterLeads > 0
          ? Math.round((convertedLeads / quarterLeads) * 100)
          : 0;
      });
    } else if (timeframe === "weekly") {
      // Weekly conversion rates
      const now = new Date();
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeklyRates = [];

      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - i * msPerWeek);
        const weekEnd = new Date(weekStart.getTime() + msPerWeek - 1);

        const weekLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.created_at);
          return leadDate >= weekStart && leadDate <= weekEnd;
        }).length;

        const convertedLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.created_at);
          return (
            leadDate >= weekStart &&
            leadDate <= weekEnd &&
            lead.status === "Convert"
          );
        }).length;

        weeklyRates.push(
          weekLeads > 0 ? Math.round((convertedLeads / weekLeads) * 100) : 0,
        );
      }

      return weeklyRates;
    } else {
      // Yearly conversion rates
      const currentYear = new Date().getFullYear();
      const years = [
        currentYear - 3,
        currentYear - 2,
        currentYear - 1,
        currentYear,
      ];

      return years.map((year) => {
        const yearLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.created_at);
          return leadDate.getFullYear() === year;
        }).length;

        const convertedLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.created_at);
          return leadDate.getFullYear() === year && lead.status === "Convert";
        }).length;

        return yearLeads > 0
          ? Math.round((convertedLeads / yearLeads) * 100)
          : 0;
      });
    }
  };

  const conversionRates = calculateConversionRates();

  const conversionRateData = {
    labels: chartData.labels,
    datasets: [conversionRates],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Total Deals</h2>
          <p className="text-3xl font-bold">{deals.length}</p>
          <p className="text-sm text-gray-500 mt-2">Across all pipelines</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Total Value</h2>
          <p className="text-3xl font-bold">
            $
            {deals
              .reduce((sum, deal) => sum + Number(deal.value || 0), 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">Sum of all deals</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Conversion Rate</h2>
          <p className="text-3xl font-bold">
            {(() => {
              // Calculate overall conversion rate
              const totalLeads = leads.length;
              const convertedLeads = leads.filter(
                (lead) => lead.status === "Convert",
              ).length;
              const rate =
                totalLeads > 0
                  ? Math.round((convertedLeads / totalLeads) * 100)
                  : 0;
              return `${rate}%`;
            })()}
          </p>
          <p className="text-sm text-gray-500 mt-2">Leads to deals</p>
        </Card>
      </div>

      <Tabs
        defaultValue="revenue"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Rate</TabsTrigger>
          <TabsTrigger value="distribution">Deal Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="w-full">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
            <div className="h-80">
              <div
                className="w-full h-full"
                key={`revenue-${timeframe}-${activeTab}`}
              >
                <AnalyticsChart
                  type="bar"
                  colors={["#4f46e5"]}
                  axisOptions={{
                    xAxisMode: "tick",
                    yAxisMode: "tick",
                    xIsSeries: true,
                  }}
                  height={300}
                  data={{
                    labels: chartData.labels,
                    datasets: [{ values: chartData.dealValues }],
                  }}
                  tooltipOptions={{
                    formatTooltipX: (d) => d,
                    formatTooltipY: (d) => `${(d || 0).toLocaleString()}`,
                  }}
                  chartKey={`revenue-${timeframe}-${activeTab}`}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="w-full">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Lead Generation</h2>
            <div className="h-80">
              <div
                className="w-full h-full"
                key={`leads-${timeframe}-${activeTab}`}
              >
                <AnalyticsChart
                  type="line"
                  colors={["#10b981"]}
                  axisOptions={{
                    xAxisMode: "tick",
                    yAxisMode: "tick",
                    xIsSeries: true,
                  }}
                  height={300}
                  data={{
                    labels: chartData.labels,
                    datasets: [{ values: chartData.leadCounts }],
                  }}
                  lineOptions={{
                    dotSize: 5,
                    hideLine: 0,
                    hideDots: 0,
                    heatline: 0,
                    regionFill: 1,
                    areaFill: 0.2,
                  }}
                  chartKey={`leads-${timeframe}-${activeTab}`}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="w-full">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Conversion Rate Trend
            </h2>
            <div className="h-80">
              <div
                className="w-full h-full"
                key={`conversion-${timeframe}-${activeTab}`}
              >
                <AnalyticsChart
                  type="percentage"
                  colors={["#f97316"]}
                  axisOptions={{
                    xAxisMode: "tick",
                    yAxisMode: "tick",
                    xIsSeries: true,
                  }}
                  height={300}
                  data={conversionRateData}
                  tooltipOptions={{
                    formatTooltipX: (d) => d,
                    formatTooltipY: (d) => `${d || 0}%`,
                  }}
                  chartKey={`conversion-${timeframe}-${activeTab}`}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="w-full">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Deal Type Distribution
            </h2>
            <div className="h-80">
              <div
                className="w-full h-full"
                key={`distribution-${timeframe}-${activeTab}`}
              >
                <AnalyticsChart
                  type="pie"
                  colors={[
                    "#4f46e5",
                    "#10b981",
                    "#f97316",
                    "#8b5cf6",
                    "#ec4899",
                  ]}
                  height={300}
                  data={dealTypeData}
                  chartKey={`distribution-${timeframe}-${activeTab}`}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performing Deals</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals
                  .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
                  .slice(0, 5)
                  .map((deal, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {deal.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Number(deal.value || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.stage}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  )
                  .slice(0, 5)
                  .map((lead, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.business_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.contact_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.status}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
