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

      // Create notification if deal stage has changed
      if (data.stage && data.stage !== deal.stage) {
        try {
          const response = await fetch(`/api/notifications/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              title: "Deal Stage Updated",
              message: `${deal.name} has moved to ${data.stage} stage`,
              type: "deal",
              relatedId: deal.id,
              relatedType: "deal",
              metadata: {
                dealId: deal.id,
                dealName: deal.name,
                previousStage: deal.stage,
                newStage: data.stage,
                value: deal.value,
              },
            }),
          });

          // Send email notification if user has email notifications enabled
          const { data: userSettings } = await supabase
            .from("user_settings")
            .select("email_notifications, deal_updates")
            .eq("user_id", user.id)
            .single();

          if (userSettings?.email_notifications && userSettings?.deal_updates) {
            // In a production environment, you would integrate with an email service here
            console.log(
              `Would send email notification to user ${user.id} about deal stage change`,
            );
          }
        } catch (notificationError) {
          console.error("Error creating notification:", notificationError);
          // Continue with the response even if notification fails
        }
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
