import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Try to sign in with the test user credentials to check if they exist
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "ibbysj@gmail.com",
        password: "1234567",
      });

    let userId;

    if (signInError) {
      // If sign in fails, try to create the test user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: "ibbysj@gmail.com",
          password: "1234567",
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
            data: {
              full_name: "Test User",
            },
          },
        },
      );

      if (signUpError) {
        return NextResponse.json(
          { error: signUpError.message },
          { status: 500 },
        );
      }

      userId = authData?.user?.id;
    } else {
      userId = signInData?.user?.id;
    }

    if (userId) {
      // Check if user exists in public.users table
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", "ibbysj@gmail.com")
        .single();

      if (!existingUser) {
        // Create the user in public.users if they don't exist
        const { error: insertError } = await supabase.from("users").insert({
          id: userId,
          email: "ibbysj@gmail.com",
          full_name: "Test User",
          name: "Test User",
          token_identifier: userId,
          user_id: userId,
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
    }

    return NextResponse.json({
      success: true,
      message: "Test user created/updated successfully",
    });
  } catch (error) {
    console.error("Error in create-test-user API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
