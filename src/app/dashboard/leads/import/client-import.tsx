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
        prospect_id:
          record.prospect_id ||
          `LEAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        business_name: record.business_name || record.company || "",
        contact_name: record.contact_name || record.name || "",
        contact_email: record.contact_email || record.email || "",
        phone: record.phone || "",
        status: record.status || "New",
        owner: record.owner || "",
        address: record.address || "",
        deal_value: record.deal_value ? Number(record.deal_value) : null,
        bf_interest:
          record.bf_interest === "true" ||
          record.bf_interest === "yes" ||
          false,
        ct_interest:
          record.ct_interest === "true" ||
          record.ct_interest === "yes" ||
          false,
        ba_interest:
          record.ba_interest === "true" ||
          record.ba_interest === "yes" ||
          false,
        user_id: user.id,
      }));

      // Insert data into the leads table
      const { error } = await supabase.from("leads").insert(recordsToInsert);

      if (error) throw error;

      // Redirect after successful import
      setTimeout(() => {
        router.push("/dashboard/leads");
        router.refresh();
      }, 2000);
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
