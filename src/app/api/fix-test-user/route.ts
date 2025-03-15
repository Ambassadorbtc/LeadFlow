import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Create a test user directly with signUp
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: "ibbysj@gmail.com",
      password: "1234567",
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
        data: {
          full_name: "Test User",
        },
      },
    });

    if (signUpError) {
      // If user already exists, try to sign in
      if (signUpError.message.includes("already registered")) {
        console.log("User already exists, attempting to sign in");

        // Check if user exists in public.users table
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", "ibbysj@gmail.com")
          .single();

        if (!existingUser) {
          // Try to get the user ID by signing in
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: "ibbysj@gmail.com",
              password: "1234567",
            });

          if (signInError) {
            // If sign in fails, we can't get the user ID
            console.error("Error signing in:", signInError);
            return NextResponse.json(
              { error: "Could not authenticate test user" },
              { status: 500 },
            );
          }

          // Create the user in public.users if they don't exist
          const { error: insertError } = await supabase.from("users").insert({
            id: signInData.user.id,
            email: "ibbysj@gmail.com",
            full_name: "Test User",
            name: "Test User",
            token_identifier: signInData.user.id,
            user_id: signInData.user.id,
            created_at: new Date().toISOString(),
            is_active: true,
          });

          if (insertError) {
            console.error("Error creating public user:", insertError);
            return NextResponse.json(
              { error: insertError.message },
              { status: 500 },
            );
          }
        }

        return NextResponse.json({
          success: true,
          message: "Test user verified successfully",
        });
      } else {
        console.error("Error creating auth user:", signUpError);
        return NextResponse.json(
          { error: signUpError.message },
          { status: 500 },
        );
      }
    }

    if (authData?.user) {
      // Create the user in public.users
      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: "ibbysj@gmail.com",
        full_name: "Test User",
        name: "Test User",
        token_identifier: authData.user.id,
        user_id: authData.user.id,
        created_at: new Date().toISOString(),
        is_active: true,
      });

      if (insertError) {
        console.error("Error creating public user:", insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Test user created successfully",
      });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to create test user",
    });
  } catch (error) {
    console.error("Error in fix-test-user API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
