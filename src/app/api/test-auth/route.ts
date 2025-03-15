import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const results = {};

    // 1. Test authentication flow
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "password123",
      });

    // This will fail since the user doesn't exist, but we're testing the flow
    results["auth_flow"] = {
      status:
        signInError && signInError.message.includes("Invalid login credentials")
          ? "success"
          : "error",
      message: "Authentication flow is working as expected",
    };

    // 2. Test password reset flow
    const { data: resetData, error: resetError } =
      await supabase.auth.resetPasswordForEmail("test@example.com", {
        redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
      });

    // This should work even if the email doesn't exist
    results["reset_flow"] = {
      status: resetError ? "error" : "success",
      message: resetError
        ? resetError.message
        : "Password reset flow is working",
    };

    // 3. Test sign-up flow
    const randomEmail = `test-${Math.random().toString(36).substring(2, 10)}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: randomEmail,
        password: "password123",
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
        },
      },
    );

    results["signup_flow"] = {
      status: signUpError ? "error" : "success",
      message: signUpError ? signUpError.message : "Sign-up flow is working",
    };

    // 4. Check auth.users and public.users synchronization
    try {
      // Invoke the sync_auth_users edge function to ensure synchronization
      const { data: syncData, error: syncError } =
        await supabase.functions.invoke("sync_auth_users", {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          },
        });

      results["sync_users"] = {
        status: syncError ? "error" : "success",
        message: syncError
          ? syncError.message
          : "User synchronization is working",
        data: syncData,
      };
    } catch (error: any) {
      results["sync_users"] = {
        status: "error",
        message: error.message,
      };
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error testing auth flows:", error);
    return NextResponse.json(
      { error: error.message || "Failed to test auth flows" },
      { status: 500 },
    );
  }
}
