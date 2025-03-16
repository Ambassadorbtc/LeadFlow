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

    // Get user from auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserByEmail(email);

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { error: "User not found in auth" },
        { status: 404 },
      );
    }

    const userId = authUser.user.id;

    // Check if user exists in public.users table
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError && userError.code !== "PGRST116") {
      // Error other than "no rows returned"
      return NextResponse.json(
        { error: "Error checking user existence" },
        { status: 500 },
      );
    }

    // If user doesn't exist in public.users, create it
    if (!existingUser) {
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email: email,
        is_active: true,
        token_identifier: userId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        return NextResponse.json(
          { error: "Failed to create user record" },
          { status: 500 },
        );
      }
    }

    // Ensure user_settings exists and onboarding is completed
    const { error: settingsError } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          onboarding_completed: true,
        },
        { onConflict: "user_id" },
      );

    if (settingsError) {
      return NextResponse.json(
        { error: "Failed to update user settings" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User authentication fixed successfully",
    });
  } catch (error) {
    console.error("Error fixing user authentication:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
