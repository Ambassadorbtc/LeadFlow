"use client";

import { PIPELINE_STAGES } from "@/types/schema";
import { ClipboardList, Filter, Plus, Search } from "lucide-react";
import Link from "next/link";

export default function DealsClientPage({ deals = [] }: { deals: any[] }) {
  // Get deals by stage for pipeline view
  const dealsByStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = deals?.filter((deal) => deal.stage === stage) || [];
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Deals Pipeline</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage and track your sales pipeline
          </p>
        </div>
        <Link
          href="/dashboard/deals/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Deal</span>
        </Link>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search deals..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white">
              <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span>Filter</span>
            </button>
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">All Stages</option>
              {PIPELINE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 mb-8">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage] || [];
          const stageValue = stageDeals.reduce(
            (sum, deal) => sum + Number(deal.value || 0),
            0,
          );

          return (
            <div
              key={stage}
              className="bg-white dark:bg-gray-800 rounded-lg shadow min-w-[300px]"
            >
              <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {stage}
                </h3>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    {stageDeals.length} deals
                  </span>
                  <span className="font-medium dark:text-white">
                    ${stageValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {stageDeals.length > 0 ? (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/dashboard/deals/${deal.id}`)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {deal.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {deal.company || "No company"}
                          </p>
                        </div>
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                          <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Value:
                          </span>
                          <span className="font-medium dark:text-white">
                            ${Number(deal.value).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500 dark:text-gray-400">
                            Type:
                          </span>
                          <span className="dark:text-white">
                            {deal.deal_type || "Other"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500 dark:text-gray-400">
                            Closing:
                          </span>
                          <span className="dark:text-white">
                            {deal.closing_date
                              ? new Date(
                                  deal.closing_date || new Date(),
                                ).toLocaleDateString()
                              : "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <p>No deals in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
