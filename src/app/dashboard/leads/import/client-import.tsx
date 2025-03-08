"use client";

import CSVImport from "@/components/dashboard/csv-import";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LeadsImportClient() {
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
        prospect_id:
          item.prospect_id || `LEAD-${Math.floor(Math.random() * 10000)}`,
        business_name: item.business_name || "Unknown Business",
        contact_name: item.contact_name || "Unknown Contact",
        contact_email: item.contact_email || null,
        phone: item.phone || null,
        address: item.address || null,
        status: item.status || "New",
        owner: item.owner || null,
        deal_value: item.deal_value ? Number(item.deal_value) : null,
        bf_interest:
          item.bf_interest === "true" || item.bf_interest === "yes" || false,
        user_id: user.user?.id,
      }));

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
