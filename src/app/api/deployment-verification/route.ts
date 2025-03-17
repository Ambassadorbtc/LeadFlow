import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const results = {};

    // 1. Verify environment variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_KEY",
      "SUPABASE_PROJECT_ID",
      "SUPABASE_ANON_KEY",
    ];

    results["environment_variables"] = {
      status: "success",
      items: [],
    };

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      results["environment_variables"].items.push({
        name: envVar,
        status: value ? "success" : "error",
        message: value
          ? `Environment variable '${envVar}' is set`
          : `Environment variable '${envVar}' is missing`,
      });

      if (!value) {
        results["environment_variables"].status = "error";
      }
    }

    // 2. Verify edge functions
    try {
      const { data: edgeFunctions, error: edgeFunctionsError } =
        await supabase.functions.list();

      results["edge_functions"] = {
        status: edgeFunctionsError ? "error" : "success",
        message: edgeFunctionsError
          ? edgeFunctionsError.message
          : "Edge functions are accessible",
        functions: edgeFunctions || [],
      };

      // Check for required edge functions
      const requiredFunctions = [
        "sync_auth_users",
        "create_users_table_if_not_exists",
        "create_user_settings_if_not_exists",
        "add_missing_columns",
      ];

      const missingFunctions = requiredFunctions.filter(
        (func) => !edgeFunctions?.some((f) => f.name === func),
      );

      if (missingFunctions.length > 0) {
        results["edge_functions"].status = "warning";
        results["edge_functions"].missingFunctions = missingFunctions;
      }
    } catch (error: any) {
      results["edge_functions"] = {
        status: "error",
        message: error.message,
      };
    }

    // 3. Verify database tables
    const requiredTables = [
      "users",
      "leads",
      "deals",
      "contacts",
      "companies",
      "notifications",
      "user_settings",
      "system_settings",
      "email_logs",
      "import_history",
    ];

    results["tables"] = {
      status: "success",
      items: [],
    };

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1);

        results["tables"].items.push({
          name: table,
          status: error ? "error" : "success",
          message: error
            ? `Table '${table}' error: ${error.message}`
            : `Table '${table}' exists and is accessible`,
        });

        if (error) {
          results["tables"].status = "error";
        }
      } catch (error: any) {
        results["tables"].items.push({
          name: table,
          status: "error",
          message: `Table '${table}' error: ${error.message}`,
        });
        results["tables"].status = "error";
      }
    }

    // 4. Verify token_identifier constraint
    try {
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        "exec_sql",
        {
          query: `
          SELECT COUNT(*) as null_count 
          FROM public.users 
          WHERE token_identifier IS NULL;
        `,
        },
      );

      results["token_identifier"] = {
        status: tokenError ? "error" : "success",
        message: tokenError
          ? tokenError.message
          : "token_identifier check completed",
        null_count: tokenData?.[0]?.null_count || 0,
      };

      if (!tokenError && tokenData?.[0]?.null_count > 0) {
        results["token_identifier"].status = "warning";
        results["token_identifier"].message =
          `Found ${tokenData[0].null_count} users with NULL token_identifier values`;
      }
    } catch (error: any) {
      results["token_identifier"] = {
        status: "error",
        message: error.message,
      };
    }

    // 5. Verify realtime publication
    try {
      const { data: realtimeData, error: realtimeError } = await supabase.rpc(
        "exec_sql",
        {
          query: `
          SELECT pubname, tablename
          FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public';
        `,
        },
      );

      results["realtime"] = {
        status: realtimeError ? "error" : "success",
        message: realtimeError
          ? realtimeError.message
          : "Realtime publication check completed",
        tables: realtimeData || [],
      };

      // Check which required tables are missing from realtime
      if (!realtimeError) {
        const missingRealtimeTables = requiredTables.filter(
          (table) => !realtimeData?.some((rt) => rt.tablename === table),
        );

        if (missingRealtimeTables.length > 0) {
          results["realtime"].status = "warning";
          results["realtime"].missingTables = missingRealtimeTables;
          results["realtime"].message =
            `${missingRealtimeTables.length} tables missing from realtime publication`;
        }
      }
    } catch (error: any) {
      results["realtime"] = {
        status: "error",
        message: error.message,
      };
    }

    // Calculate overall status
    const hasErrors = Object.values(results).some(
      (result: any) => result.status === "error",
    );
    const hasWarnings = Object.values(results).some(
      (result: any) => result.status === "warning",
    );

    const overallStatus = hasErrors
      ? "error"
      : hasWarnings
        ? "warning"
        : "success";

    return NextResponse.json({
      success: true,
      results,
      overallStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error verifying deployment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 },
    );
  }
}
