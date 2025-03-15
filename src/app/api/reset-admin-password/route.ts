import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Try to sign in with the admin credentials to check if they exist
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "admin@leadflowapp.online",
        password: "admin123",
      });

    if (signInError) {
      // If sign in fails, try to create the admin user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: "admin@leadflowapp.online",
          password: "admin123",
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
            data: {
              full_name: "Admin User",
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

      if (authData?.user) {
        // Create the user in public.users
        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: "admin@leadflowapp.online",
          full_name: "Admin User",
          name: "Admin User",
          token_identifier: authData.user.id,
          user_id: authData.user.id,
          created_at: new Date().toISOString(),
          is_active: true,
        });

        if (insertError) {
          console.error("Error creating admin user:", insertError);
          return NextResponse.json(
            { error: insertError.message },
            { status: 500 },
          );
        }

        return NextResponse.json({
          success: true,
          message: "Admin user created successfully",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin user verified successfully",
    });
  } catch (error) {
    console.error("Error in reset-admin-password API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
