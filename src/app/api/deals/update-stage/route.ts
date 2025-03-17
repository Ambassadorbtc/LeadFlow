import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { dealId, newStage } = await request.json();
    const supabase = await createClient();

    // Validate required fields
    if (!dealId || !newStage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get current user
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }

    const { user } = userData;

    // Get current deal data
    const { data: currentDeal, error: dealError } = await supabase
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .eq("user_id", user.id)
      .single();

    if (dealError || !currentDeal) {
      return NextResponse.json(
        { error: "Deal not found or access denied" },
        { status: 404 },
      );
    }

    // Update deal stage
    const { error: updateError } = await supabase
      .from("deals")
      .update({
        stage: newStage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create notification for stage change
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/notifications/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            title: "Deal Stage Updated",
            message: `${currentDeal.name} has moved to ${newStage} stage`,
            type: "deal",
            relatedId: dealId,
            relatedType: "deal",
            metadata: {
              dealId: dealId,
              dealName: currentDeal.name,
              previousStage: currentDeal.stage,
              newStage: newStage,
              value: currentDeal.value,
            },
          }),
        },
      );

      // Send email notification if user has email notifications enabled
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("email_notifications, deal_updates")
        .eq("user_id", user.id)
        .single();

      if (userSettings?.email_notifications && userSettings?.deal_updates) {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/email-notifications/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              subject: `Deal Stage Updated: ${currentDeal.name}`,
              message: `Your deal ${currentDeal.name} has been moved from ${currentDeal.stage} to ${newStage} stage.`,
              notificationType: "deal",
              metadata: {
                dealId: dealId,
                dealName: currentDeal.name,
                previousStage: currentDeal.stage,
                newStage: newStage,
              },
            }),
          },
        );
      }
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Continue with the response even if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Deal stage updated to ${newStage}`,
      deal: {
        ...currentDeal,
        stage: newStage,
      },
    });
  } catch (error: any) {
    console.error("Error updating deal stage:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update deal stage" },
      { status: 500 },
    );
  }
}
