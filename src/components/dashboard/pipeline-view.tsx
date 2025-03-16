"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { PIPELINE_STAGES } from "@/types/schema";

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  prospect_id?: string;
  company?: string;
  deal_type?: string;
  contact_name?: string;
  created_at: string;
  updated_at: string;
}

export default function PipelineView({
  initialDeals = [],
}: {
  initialDeals?: Deal[];
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (initialDeals.length === 0) {
      const fetchDeals = async () => {
        try {
          const { data, error } = await supabase
            .from("deals")
            .select("*")
            .order("updated_at", { ascending: false });

          if (error) {
            console.error("Error fetching deals:", error);
            return;
          }

          setDeals(data || []);
        } catch (error) {
          console.error("Failed to fetch deals:", error);
        }
      };

      fetchDeals();
    }
  }, [initialDeals, supabase]);

  const handleDragStart = useCallback((deal: Deal) => {
    setDraggedDeal(deal);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, stage: string) => {
      e.preventDefault();
      if (!draggedDeal || draggedDeal.stage === stage) return;

      try {
        // Update deal stage in UI
        setDeals(
          deals.map((deal) =>
            deal.id === draggedDeal.id ? { ...deal, stage } : deal,
          ),
        );

        // Update deal stage in database
        const { error } = await supabase
          .from("deals")
          .update({ stage })
          .eq("id", draggedDeal.id);

        if (error) {
          console.error("Error updating deal stage:", error);
          // Revert UI change if database update fails
          setDeals(deals);
        }
      } catch (error) {
        console.error("Failed to update deal stage:", error);
      } finally {
        setDraggedDeal(null);
      }
    },
    [draggedDeal, deals, supabase],
  );

  const getStageDeals = useMemo(() => {
    return (stage: string) => {
      return deals.filter((deal) => deal.stage === stage);
    };
  }, [deals]);

  const calculateStageTotal = useMemo(() => {
    return (stage: string) => {
      return getStageDeals(stage).reduce((sum, deal) => {
        const dealValue = Number(deal.value || 0);
        return sum + (isNaN(dealValue) ? 0 : dealValue);
      }, 0);
    };
  }, [getStageDeals]);

  const handleViewDeal = useCallback(
    (dealId: string) => {
      router.push(`/dashboard/deals/${dealId}`);
    },
    [router],
  );

  const handleEditDeal = useCallback(
    (dealId: string) => {
      router.push(`/dashboard/deals/${dealId}/edit`);
    },
    [router],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto">
      {PIPELINE_STAGES.map((stage) => (
        <div
          key={stage}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm h-full min-w-[280px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage)}
        >
          <div className="p-3 border-b bg-white dark:bg-gray-900 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                {stage}
              </h3>
              <Badge variant="outline" className="ml-2">
                {getStageDeals(stage).length}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <DollarSign className="h-3 w-3 mr-1" />
              {calculateStageTotal(stage).toLocaleString()}
            </div>
          </div>

          <div className="p-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {getStageDeals(stage).map((deal) => (
              <Card
                key={deal.id}
                className="mb-2 p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm hover:shadow-md cursor-move"
                draggable
                onDragStart={() => handleDragStart(deal)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    {deal.name}
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDeal(deal.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditDeal(deal.id)}>
                        Edit Deal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  ID: {deal.prospect_id || "N/A"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Company: {deal.company || "No company"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Contact: {deal.contact_name || "No contact"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Type: {deal.deal_type || "Other"}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-600">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Value:
                  </span>
                  <span className="text-sm font-medium dark:text-gray-200">
                    ${Number(deal.value).toLocaleString()}
                  </span>
                </div>
              </Card>
            ))}
            {getStageDeals(stage).length === 0 && (
              <div className="text-center py-4 text-sm text-gray-400 dark:text-gray-500">
                Drop deals here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
