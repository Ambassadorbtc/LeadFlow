"use client";

import DealForm from "@/components/dashboard/deal-form";
import { createClient } from "../../../../../../supabase/client";
import { useRouter } from "next/navigation";

export default function EditDealClientForm({ deal }: { deal: any }) {
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
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deal.id)
        .eq("user_id", user.id);

      if (result.error) {
        console.error("Error updating deal:", result.error);
        return false;
      }

      router.push(`/dashboard/deals/${deal.id}`);
      return true;
    } catch (error) {
      console.error("Error in form submission:", error);
      return false;
    }
  };

  return (
    <DealForm initialData={deal} onSubmit={handleSubmit} isLoading={false} />
  );
}
