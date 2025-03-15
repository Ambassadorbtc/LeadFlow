import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const results = {};

    // 1. Check environment variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_KEY",
      "SUPABASE_PROJECT_ID",
    ];

    results["environment"] = {};
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      results["environment"][envVar] = {
        status: value ? "success" : "error",
        message: value
          ? `Environment variable '${envVar}' is set`
          : `Environment variable '${envVar}' is missing`,
      };
    }

    // 2. Check required tables
    const requiredTables = [
      "users",
      "leads",
      "deals",
      "contacts",
      "companies",
      "notifications",
      "user_settings",
      "system_settings",
    ];

    results["tables"] = {};
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1);

        results["tables"][table] = {
          status: error ? "error" : "success",
          message: error
            ? error.message
            : `Table '${table}' exists and is accessible`,
        };
      } catch (error) {
        results["tables"][table] = {
          status: "error",
          message: error.message,
        };
      }
    }

    // 3. Check edge functions
    try {
      const { data: edgeFunctions, error: edgeFunctionsError } =
        await supabase.functions.list();

      const requiredFunctions = [
        "sync_auth_users",
        "create_users_table_if_not_exists",
        "create_user_settings_if_not_exists",
        "add_missing_columns",
      ];

      results["edgeFunctions"] = {
        status: edgeFunctionsError ? "error" : "success",
        message: edgeFunctionsError
          ? edgeFunctionsError.message
          : "Edge functions are accessible",
        functions: [],
      };

      if (!edgeFunctionsError && edgeFunctions) {
        for (const requiredFunction of requiredFunctions) {
          const exists = edgeFunctions.some((f) => f.name === requiredFunction);
          results["edgeFunctions"].functions.push({
            name: requiredFunction,
            status: exists ? "success" : "error",
            message: exists
              ? `Function '${requiredFunction}' exists`
              : `Function '${requiredFunction}' is missing`,
          });
        }
      }
    } catch (error) {
      results["edgeFunctions"] = {
        status: "error",
        message: error.message,
      };
    }

    // 4. Check authentication
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getSession();

      results["authentication"] = {
        status: authError ? "error" : "success",
        message: authError
          ? authError.message
          : "Authentication system working",
      };
    } catch (error) {
      results["authentication"] = {
        status: "error",
        message: error.message,
      };
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
      overallStatus: Object.values(results).some(
        (result: any) =>
          result.status === "error" ||
          Object.values(result).some((r: any) => r.status === "error"),
      )
        ? "error"
        : "success",
    });
  } catch (error) {
    console.error("Error checking deployment requirements:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check deployment requirements" },
      { status: 500 },
    );
  }
}
