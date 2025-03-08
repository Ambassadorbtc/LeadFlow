"use client";

import LeadForm from "@/components/dashboard/lead-form";
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";

export default function AddLeadClientForm() {
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (data: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated");
        return false;
      }

      const result = await supabase
        .from("leads")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select();

      if (result.error) {
        console.error("Error adding lead:", result.error);
        return false;
      }

      router.push("/dashboard/leads");
      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
    }
  };

  return <LeadForm onSubmit={handleSubmit} isLoading={false} />;
}
