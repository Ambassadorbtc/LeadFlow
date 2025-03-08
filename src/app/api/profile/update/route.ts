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

    // Update user metadata in auth
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: formData.full_name,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Skip the setup step as we've created a migration that ensures all columns exist

    // Check if user exists in the users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    let profileError;

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          bio: formData.bio,
          job_title: formData.job_title,
          company: formData.company,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      profileError = error;
    } else {
      // Insert new user
      const { error } = await supabase.from("users").insert({
        id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        job_title: formData.job_title,
        company: formData.company,
        avatar_url: formData.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      profileError = error;
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
