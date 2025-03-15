import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const results = {};

    // 1. Verify database connection
    try {
      const { data: dbTest, error: dbError } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      results["database"] = {
        status: dbError ? "error" : "success",
        message: dbError ? dbError.message : "Database connection successful",
      };
    } catch (error) {
      results["database"] = {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      };
    }

    // 2. Verify authentication
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
        message: error instanceof Error ? error.message : String(error),
      };
    }

    // 3. Verify required tables
    const requiredTables = [
      "users",
      "leads",
      "deals",
      "contacts",
      "companies",
      "notifications",
      "user_settings",
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
          message: error instanceof Error ? error.message : String(error),
        };
      }
    }

    // 4. Verify environment variables
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

    // 5. Verify edge functions
    try {
      const { data: edgeFunctions, error: edgeFunctionsError } =
        await supabase.functions.list();

      results["edgeFunctions"] = {
        status: edgeFunctionsError ? "error" : "success",
        message: edgeFunctionsError
          ? edgeFunctionsError.message
          : "Edge functions are accessible",
        functions: edgeFunctions || [],
      };
    } catch (error) {
      results["edgeFunctions"] = {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      };
    }

    return NextResponse.json({
      success: true,
      results,
      overallStatus: Object.values(results).some(
        (result) =>
          result.status === "error" ||
          Object.values(result).some((r) => r.status === "error"),
      )
        ? "error"
        : "success",
    });
  } catch (error) {
    console.error("Error verifying deployment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error) || "Failed to verify deployment",
      },
      { status: 500 },
    );
  }
}
