import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID || null,
      SUPABASE_URL:
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        null,
      SUPABASE_ANON_KEY:
        process.env.SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        null,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || null,
    };

    // Check which variables are missing
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => value === null)
      .map(([key]) => key);

    // Mask sensitive keys for security
    const maskedVars = {
      ...envVars,
      SUPABASE_ANON_KEY: envVars.SUPABASE_ANON_KEY ? "[PRESENT]" : null,
      SUPABASE_SERVICE_KEY: envVars.SUPABASE_SERVICE_KEY ? "[PRESENT]" : null,
    };

    // Test database connection
    let dbStatus = "Unknown";
    let dbError = null;
    let tablesStatus = [];

    try {
      const supabase = await createClient();

      // Test a simple query
      const { data, error } = await supabase
        .from("users")
        .select("count()")
        .limit(1);

      if (error) {
        dbStatus = "Error";
        dbError = error.message;
      } else {
        dbStatus = "Connected";

        // Check critical tables
        const criticalTables = [
          "users",
          "leads",
          "deals",
          "contacts",
          "companies",
          "notifications",
          "user_settings",
          "system_settings",
        ];

        for (const table of criticalTables) {
          const { data, error } = await supabase
            .from(table)
            .select("count()")
            .limit(1);
          tablesStatus.push({
            table,
            exists: !error,
            error: error ? error.message : null,
          });
        }
      }
    } catch (error) {
      dbStatus = "Error";
      dbError = error.message;
    }

    // Test edge function availability
    let edgeFunctionStatus = "Unknown";
    let edgeFunctionError = null;
    let edgeFunctions = [];

    try {
      const supabase = await createClient();

      // Check if we can list functions
      const { data, error } = await supabase.functions.list();

      if (error) {
        edgeFunctionStatus = "Error";
        edgeFunctionError = error.message;
      } else {
        edgeFunctionStatus = "Available";
        edgeFunctions = data || [];

        // Check for required edge functions
        const requiredFunctions = [
          "sync_auth_users",
          "create_users_table_if_not_exists",
          "create_user_settings_if_not_exists",
          "add_missing_columns",
        ];

        const missingFunctions = requiredFunctions.filter(
          (fn) => !data.some((f) => f.name === fn),
        );

        if (missingFunctions.length > 0) {
          edgeFunctionStatus = "Missing Required Functions";
          edgeFunctionError = `Missing functions: ${missingFunctions.join(", ")}`;
        }
      }
    } catch (error) {
      edgeFunctionStatus = "Error";
      edgeFunctionError = error.message;
    }

    // Check authentication system
    let authStatus = "Unknown";
    let authError = null;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getSession();

      authStatus = error ? "Error" : "Working";
      authError = error ? error.message : null;
    } catch (error) {
      authStatus = "Error";
      authError = error.message;
    }

    return NextResponse.json({
      success: true,
      environmentVariables: {
        status: missingVars.length === 0 ? "Complete" : "Missing",
        missingVars,
        envStatus: maskedVars,
      },
      database: {
        status: dbStatus,
        error: dbError,
        tables: tablesStatus,
      },
      edgeFunctions: {
        status: edgeFunctionStatus,
        error: edgeFunctionError,
        functions: edgeFunctions,
      },
      authentication: {
        status: authStatus,
        error: authError,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in deploy-status route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
