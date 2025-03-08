"use client";

import CSVImport from "@/components/dashboard/csv-import";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContactsImportClient() {
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
        name: item.name || "Unknown Contact",
        email: item.email || null,
        phone: item.phone || null,
        company: item.company || null,
        position: item.position || null,
        address: item.address || null,
        prospect_id: item.prospect_id || null,
        owner: item.owner || null,
        user_id: user.user?.id,
      }));

      // Insert the data into the contacts table
      const { error } = await supabase.from("contacts").insert(processedData);

      if (error) throw error;

      // Redirect to the contacts page after successful import
      router.push("/dashboard/contacts");
      router.refresh();
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
