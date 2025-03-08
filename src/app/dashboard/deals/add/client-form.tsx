"use client";

import DealForm from "@/components/dashboard/deal-form";
import { createClient } from "../../../../../supabase/client";
import { useRouter } from "next/navigation";

export default function AddDealClientForm() {
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
        .from("deals")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select();

      if (result.error) {
        console.error("Error adding deal:", result.error);
        return false;
      }

      router.push("/dashboard/deals");
      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
    }
  };

  return <DealForm onSubmit={handleSubmit} isLoading={false} />;
}
