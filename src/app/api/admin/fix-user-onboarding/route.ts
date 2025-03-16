import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, action } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!action || !["enable", "disable", "reset"].includes(action)) {
      return NextResponse.json(
        { error: "Valid action is required (enable, disable, or reset)" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Verify the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if current user is admin
    const { data: adminCheck } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!adminCheck?.is_admin) {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Find the target user by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .ilike("email", email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user settings based on action
    let updateData = {};

    if (action === "enable") {
      updateData = {
        user_id: userData.id,
        onboarding_completed: false,
        disable_onboarding: false,
      };
    } else if (action === "disable") {
      updateData = {
        user_id: userData.id,
        onboarding_completed: true,
        disable_onboarding: true,
      };
    } else if (action === "reset") {
      updateData = {
        user_id: userData.id,
        onboarding_completed: false,
        disable_onboarding: false,
      };
    }

    const { error: updateError } = await supabase
      .from("user_settings")
      .upsert(updateData, { onConflict: "user_id" });

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update user settings" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `User onboarding status updated successfully. Action: ${action}`,
    });
  } catch (error) {
    console.error("Error fixing user onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
