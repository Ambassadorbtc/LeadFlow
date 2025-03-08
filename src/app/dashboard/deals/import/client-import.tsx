"use client";

import CSVImport from "@/components/dashboard/csv-import";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DealsImportClient() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async (data: any[]) => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Process and validate the data
      const processedData = data.map((item) => ({
        name: item.name || "Unnamed Deal",
        value: Number(item.value) || 0,
        stage: item.stage || "Qualification",
        company: item.company || null,
        contact_name: item.contact_name || null,
        closing_date: item.closing_date || null,
        description: item.description || null,
        prospect_id: item.prospect_id || null,
        deal_type: item.deal_type || "Other",
        user_id: user.user?.id,
      }));

      // Insert the data into the deals table
      const { error } = await supabase.from("deals").insert(processedData);

      if (error) throw error;

      // Redirect to the deals page after successful import
      router.push("/dashboard/deals");
      router.refresh();
    } catch (error) {
      console.error("Error importing deals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CSVImport onImport={handleImport} type="deals" isLoading={isLoading} />
  );
}
