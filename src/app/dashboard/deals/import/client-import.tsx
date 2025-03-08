"use client";

import { useState } from "react";
import { createClient } from "@/app/actions";
import { useRouter } from "next/navigation";
import CSVImport from "@/components/dashboard/csv-import";

export default function ClientCSVImport() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleImport = async (data: any[]) => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Prepare data for insertion
      const recordsToInsert = data.map((record) => ({
        name: record.name || "",
        value: record.value ? Number(record.value) : 0,
        stage: record.stage || "Contact Made",
        company: record.company || "",
        closing_date: record.closing_date || null,
        description: record.description || "",
        prospect_id: record.prospect_id || "",
        deal_type: record.deal_type || "Other",
        user_id: user.id,
      }));

      // Insert data into the deals table
      const { error } = await supabase.from("deals").insert(recordsToInsert);

      if (error) throw error;

      // Redirect after successful import
      setTimeout(() => {
        router.push("/dashboard/deals");
        router.refresh();
      }, 2000);
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
