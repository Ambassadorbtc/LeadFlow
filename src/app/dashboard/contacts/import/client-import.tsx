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
        email: record.email || "",
        phone: record.phone || "",
        company: record.company || "",
        position: record.position || "",
        address: record.address || "",
        owner: record.owner || "",
        prospect_id: record.prospect_id || "",
        user_id: user.id,
      }));

      // Insert data into the contacts table
      const { error } = await supabase.from("contacts").insert(recordsToInsert);

      if (error) throw error;

      // Redirect after successful import
      setTimeout(() => {
        router.push("/dashboard/contacts");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error importing contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CSVImport onImport={handleImport} type="contacts" isLoading={isLoading} />
  );
}
