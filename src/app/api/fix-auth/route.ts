import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // First check if the user exists in auth.users
    const {
      data: { user },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        { success: false, error: signInError.message },
        { status: 401 },
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication succeeded but no user data returned",
        },
        { status: 500 },
      );
    }

    // Check if user exists in the public.users table
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // If user doesn't exist in the public.users table, create the record
    if (!existingUser || userError) {
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: email,
        full_name: user.user_metadata?.full_name || email.split("@")[0],
        name: user.user_metadata?.full_name || email.split("@")[0],
        user_id: user.id,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      });

      if (insertError) {
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 },
        );
      }
    }

    // Try to invoke the sync_auth_users edge function to ensure all users are synced
    try {
      const { data: syncData, error: syncError } =
        await supabase.functions.invoke("sync_auth_users", {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

      if (syncError) {
        console.error("Error syncing auth users:", syncError);
      }
    } catch (syncError) {
      console.error("Error invoking sync_auth_users function:", syncError);
    }

    return NextResponse.json({
      success: true,
      user: user.id,
      message: "User authentication fixed successfully",
    });
  } catch (error: any) {
    console.error("Error in fix-auth route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
