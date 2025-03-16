import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Find the user by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .ilike("email", email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user settings to mark onboarding as completed
    const { error: updateError } = await supabase.from("user_settings").upsert(
      {
        user_id: userData.id,
        onboarding_completed: true,
      },
      { onConflict: "user_id" },
    );

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update user settings" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User onboarding status updated successfully",
    });
  } catch (error) {
    console.error("Error fixing user onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
