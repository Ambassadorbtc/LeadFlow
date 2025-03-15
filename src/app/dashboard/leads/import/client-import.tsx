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
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error("Authentication failed. Please sign in again.");
      }

      if (!userData?.user) {
        // Try to refresh the session before giving up
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError || !refreshData?.user) {
          console.error("Session refresh failed:", refreshError);
          // Redirect to sign-in page
          router.push(
            "/sign-in?error=Your session has expired. Please sign in again.",
          );
          return;
        }

        // Use the refreshed user data
        userData.user = refreshData.user;
      }

      // Process and validate the data using the mapper function
      const processedData = mapCSVToLeads(data, userData.user.id);

      // Insert the data into the leads table
      const { error } = await supabase.from("leads").insert(processedData);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Redirect to the leads page after successful import
      router.push("/dashboard/leads");
      router.refresh();
    } catch (error: any) {
      console.error("Error importing leads:", error);
      alert(error?.message || "Failed to import leads. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CSVImport onImport={handleImport} type="leads" isLoading={isLoading} />
  );
}
