import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Try to sign in with the admin credentials to check if they exist
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "admin@leadflowapp.online",
        password: "admin123",
      });

    let adminId;

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

      adminId = authData?.user?.id;
    } else {
      adminId = signInData?.user?.id;
    }

    if (adminId) {
      // Check if admin exists in public.users table
      const { data: existingAdmin } = await supabase
        .from("users")
        .select("*")
        .eq("email", "admin@leadflowapp.online")
        .single();

      if (!existingAdmin) {
        // Create the admin in public.users if they don't exist
        const { error: insertError } = await supabase.from("users").upsert(
          {
            id: adminId,
            email: "admin@leadflowapp.online",
            full_name: "Admin User",
            name: "Admin User",
            token_identifier: adminId,
            user_id: adminId,
            created_at: new Date().toISOString(),
            is_active: true,
          },
          { onConflict: "id", ignoreDuplicates: false },
        );

        if (insertError) {
          console.error("Error creating admin in public.users:", insertError);
          return NextResponse.json(
            { error: insertError.message },
            { status: 500 },
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created/updated successfully",
    });
  } catch (error) {
    console.error("Error in create-admin-user API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
