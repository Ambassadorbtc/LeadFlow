"use client";

import CSVImport from "@/components/dashboard/csv-import";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseCSV } from "../csv-parser";
import { mapCSVToLeads } from "./csv-parser";

export default function LeadsImportClient() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async (data: any[]) => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Process and validate the data using the mapper function
      const processedData = mapCSVToLeads(data, userData.user.id);

      // Insert the data into the leads table
      const { error } = await supabase.from("leads").insert(processedData);

      if (error) throw error;

      // Redirect to the leads page after successful import
      router.push("/dashboard/leads");
      router.refresh();
    } catch (error) {
      console.error("Error importing leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CSVImport onImport={handleImport} type="leads" isLoading={isLoading} />
  );
}
