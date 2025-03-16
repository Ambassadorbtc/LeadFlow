import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const errors = [];

    // Check database connection
    const { error: dbError } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    if (dbError) {
      errors.push({
        type: "Database",
        message: "Database connection error",
        details: dbError.message,
      });
    }

    // Check auth connection
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      errors.push({
        type: "Authentication",
        message: "Authentication service error",
        details: authError.message,
      });
    }

    // Check storage buckets
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();
    if (bucketsError) {
      errors.push({
        type: "Storage",
        message: "Storage service error",
        details: bucketsError.message,
      });
    } else {
      // Check if required buckets exist
      const requiredBuckets = ["avatars"];
      const missingBuckets = requiredBuckets.filter(
        (bucket) => !buckets.some((b) => b.name === bucket),
      );

      if (missingBuckets.length > 0) {
        errors.push({
          type: "Storage",
          message: "Missing required storage buckets",
          details: `Missing buckets: ${missingBuckets.join(", ")}`,
        });
      }
    }

    // Check required tables
    const requiredTables = [
      "users",
      "user_settings",
      "leads",
      "companies",
      "deals",
      "contacts",
      "notifications",
    ];

    for (const table of requiredTables) {
      const { error: tableError } = await supabase
        .from(table)
        .select("count")
        .limit(1);
      if (tableError) {
        errors.push({
          type: "Database",
          message: `Missing or inaccessible table: ${table}`,
          details: tableError.message,
        });
      }
    }

    // Check specific users
    const specificEmails = ["ibbysj@gmail.com", "admin@leadflowapp.online"];
    for (const email of specificEmails) {
      // Check in auth.users
      const { data: authUser, error: authUserError } =
        await supabase.auth.admin.getUserByEmail(email);
      if (authUserError || !authUser?.user) {
        errors.push({
          type: "Authentication",
          message: `User not found in auth: ${email}`,
          details: authUserError?.message || "User not found",
        });
      } else {
        // Check in public.users
        const { data: publicUser, error: publicUserError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.user.id)
          .single();

        if (publicUserError && publicUserError.code !== "PGRST116") {
          errors.push({
            type: "Database",
            message: `Error checking user in public.users: ${email}`,
            details: publicUserError.message,
          });
        } else if (!publicUser) {
          errors.push({
            type: "Database",
            message: `User not found in public.users: ${email}`,
            details: "User exists in auth but not in public.users table",
          });
        }

        // Check user_settings
        const { data: userSettings, error: settingsError } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", authUser.user.id)
          .single();

        if (settingsError && settingsError.code !== "PGRST116") {
          errors.push({
            type: "Database",
            message: `Error checking user_settings: ${email}`,
            details: settingsError.message,
          });
        } else if (!userSettings) {
          errors.push({
            type: "Database",
            message: `User settings not found: ${email}`,
            details: "User exists but has no settings record",
          });
        } else if (userSettings.onboarding_completed !== true) {
          errors.push({
            type: "Configuration",
            message: `Onboarding not marked as completed: ${email}`,
            details: "User settings exist but onboarding_completed is not true",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      errors: errors,
      errorCount: errors.length,
      status:
        errors.length === 0 ? "All systems operational" : "Issues detected",
    });
  } catch (error: any) {
    console.error("Error checking system status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        errors: [
          {
            type: "System",
            message: "Error running diagnostics",
            details: error.message || "Unknown error",
          },
        ],
      },
      { status: 500 },
    );
  }
}
