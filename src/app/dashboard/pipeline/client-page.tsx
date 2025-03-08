"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/types/schema";
import { DollarSign, Plus, Search, X } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import { useRouter } from "next/navigation";

type Deal = {
  id: string;
  name: string;
  value: number;
  stage: string;
  prospect_id?: string;
  company?: string;
  deal_type?: string;
  contact_name?: string;
};

type Lead = {
  id: string;
  prospect_id: string;
  business_name: string;
  contact_name?: string;
};

export const DEAL_TYPES = [
  "Card Terminal",
  "Business Funding",
  "Booking App",
  "Other",
];

// Run a check for any leads that should be converted to deals
async function checkConversions() {
  try {
    console.log("Checking for leads to convert...");
    const response = await fetch("/api/leads/check-conversion", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Conversion check result:", result);
    return result;
  } catch (error) {
    console.error("Error checking conversions:", error);
    return null;
  }
}

export default function PipelineClientPage({
  deals = [],
  leads = [],
}: {
  deals: Deal[];
  leads: Lead[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Check for leads that need to be converted when the component mounts
  useEffect(() => {
    const convertLeads = async () => {
      try {
        // Use fetch directly instead of the server function
        const response = await fetch("/api/leads/check-conversion", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result?.converted > 0) {
          console.log(`Converted ${result.converted} leads to deals`);
          router.refresh();
        }
      } catch (error) {
        console.error("Error checking conversions:", error);
      }
    };

    convertLeads();
  }, [router]);

  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [showNewDealForm, setShowNewDealForm] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: "",
    value: "",
    stage: PIPELINE_STAGES[0],
    prospect_id: "",
    company: "",
    deal_type: DEAL_TYPES[0],
  });
  const supabase = createClient();

  // Filter deals based on search term
  const filteredDeals = useMemo(() => {
    if (!searchTerm) return deals;
    return deals.filter(
      (deal) =>
        deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.prospect_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.deal_type?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [deals, searchTerm]);

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    return PIPELINE_STAGES.reduce(
      (acc, stage) => {
        acc[stage] = filteredDeals.filter((deal) => deal.stage === stage);
        return acc;
      },
      {} as Record<string, Deal[]>,
    );
  }, [filteredDeals]);

  // Handle drag start
  const handleDragStart = useCallback((deal: Deal) => {
    setDraggedDeal(deal);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    async (e: React.DragEvent, stage: string) => {
      e.preventDefault();
      if (draggedDeal && draggedDeal.stage !== stage) {
        // Update deal stage in UI
        const updatedDeals = deals.map((deal) =>
          deal.id === draggedDeal.id ? { ...deal, stage } : deal,
        );

        // Update deal stage in database
        const { error } = await supabase
          .from("deals")
          .update({ stage })
          .eq("id", draggedDeal.id);

        if (error) {
          console.error("Error updating deal stage:", error);
        } else {
          router.refresh();
        }
      }
      setDraggedDeal(null);
    },
    [draggedDeal, deals, router, supabase],
  );

  // Handle creating a new deal
  const handleCreateDeal = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Find the contact name from the selected lead
      const selectedLead = leads.find(
        (lead) => lead.prospect_id === newDeal.prospect_id,
      );
      const contactName = selectedLead?.contact_name || "";

      const { error } = await supabase.from("deals").insert({
        name: newDeal.name,
        value: parseFloat(newDeal.value),
        stage: newDeal.stage,
        prospect_id: newDeal.prospect_id,
        company: newDeal.company,
        deal_type: newDeal.deal_type,
        contact_name: contactName,
        user_id: user.id,
      });

      if (error) throw error;

      setShowNewDealForm(false);
      setNewDeal({
        name: "",
        value: "",
        stage: PIPELINE_STAGES[0],
        prospect_id: "",
        company: "",
        deal_type: DEAL_TYPES[0],
      });
      router.refresh();
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  }, [newDeal, router, supabase, leads]);

  // Calculate stage metrics
  const stageMetrics = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => {
      const stageDeals = dealsByStage[stage] || [];
      const totalValue = stageDeals.reduce((sum, deal) => {
        const dealValue = Number(deal.value || 0);
        return sum + (isNaN(dealValue) ? 0 : dealValue);
      }, 0);
      return {
        stage,
        count: stageDeals.length,
        value: totalValue,
      };
    });
  }, [dealsByStage]);

  return (
    <div className="px-4 py-8 w-full">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pipeline</h1>
          <div className="flex items-center mt-2">
            <p className="text-gray-500 mr-4">
              Manage your deals through the sales pipeline
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-2 flex items-center w-full max-w-md">
          <Search className="text-gray-400 h-5 w-5 ml-2 mr-1" />
          <input
            type="text"
            placeholder="Search deals by name, prospect ID, company, or type..."
            className="w-full px-2 py-2 border-none focus:outline-none focus:ring-0 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={() => setShowNewDealForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Deal</span>
        </Button>
      </header>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {stageMetrics.map((metric) => (
          <div
            key={metric.stage}
            className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
          >
            <div className="text-sm font-medium text-gray-500">
              {metric.stage}
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{metric.count}</div>
              <div className="text-sm text-gray-500 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                {metric.value.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm h-full min-w-[200px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="p-2 border-b bg-white rounded-t-lg">
              <h3 className="font-medium text-gray-800">{stage}</h3>
              <div className="text-xs text-gray-500 mt-1">
                {dealsByStage[stage]?.length || 0} deals
              </div>
            </div>

            <div className="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {dealsByStage[stage]?.map((deal) => (
                <Card
                  key={deal.id}
                  className="mb-2 p-3 bg-white rounded-md shadow-sm hover:shadow-md cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(deal)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">
                      {deal.name}
                    </h4>
                    <div className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {deal.deal_type || "Other"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    ID: {deal.prospect_id || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Company: {deal.company || "No company"}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Contact: {deal.contact_name || "No contact"}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Type: {deal.deal_type || "Other"}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Value:</span>
                    <span className="text-sm font-medium">
                      ${Number(deal.value).toLocaleString()}
                    </span>
                  </div>
                </Card>
              ))}
              {dealsByStage[stage]?.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-400">
                  Drop deals here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Deal Form */}
      {showNewDealForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Deal</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Name *
                </label>
                <input
                  type="text"
                  value={newDeal.name}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prospect ID
                </label>
                <select
                  value={newDeal.prospect_id}
                  onChange={(e) =>
                    setNewDeal({
                      ...newDeal,
                      prospect_id: e.target.value,
                      company:
                        leads.find((l) => l.prospect_id === e.target.value)
                          ?.business_name || "",
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a prospect</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.prospect_id}>
                      {lead.prospect_id} - {lead.business_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={newDeal.company}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, company: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Value *
                </label>
                <input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, value: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Type *
                </label>
                <select
                  value={newDeal.deal_type}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, deal_type: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {DEAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage *
                </label>
                <select
                  value={newDeal.stage}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, stage: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {PIPELINE_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNewDealForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDeal}
                disabled={!newDeal.name || !newDeal.value}
              >
                Create Deal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
