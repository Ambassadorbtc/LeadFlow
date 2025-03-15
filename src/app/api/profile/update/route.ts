import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.json();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("Current user ID:", user.id);
    console.log("Current user email:", user.email);

    // Update user metadata in auth
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: formData.full_name,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Check if user exists in the users table
    const { data: existingUser, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    console.log("Existing user query result:", existingUser, queryError);

    let profileError;

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          email: user.email, // Use the authenticated user's email
          phone: formData.phone,
          bio: formData.bio,
          job_title: formData.job_title,
          company: formData.company,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      profileError = error;
      console.log("Update result:", error);
    } else {
      // Insert new user
      const { error } = await supabase.from("users").upsert(
        {
          id: user.id,
          full_name: formData.full_name,
          email: user.email, // Use the authenticated user's email
          phone: formData.phone,
          bio: formData.bio,
          job_title: formData.job_title,
          company: formData.company,
          avatar_url: formData.avatar_url,
          token_identifier: user.id,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "id", ignoreDuplicates: false },
      );

      profileError = error;
      console.log("Insert result:", error);
    }

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 },
    );
  }
}
