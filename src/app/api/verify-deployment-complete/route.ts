import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = {};
    const supabase = await createClient();

    // 1. Check environment variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_KEY",
      "SUPABASE_PROJECT_ID",
    ];

    results["environment"] = {
      status: "success",
      details: {},
    };

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      results["environment"].details[envVar] = {
        status: value ? "success" : "error",
        message: value
          ? `Environment variable '${envVar}' is set`
          : `Environment variable '${envVar}' is missing`,
      };

      if (!value) {
        results["environment"].status = "error";
      }
    }

    // 2. Check database connection
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
        message: error.message,
      };
    }

    // 3. Check required tables
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

    results["tables"] = {
      status: "success",
      details: {},
    };

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1);

        results["tables"].details[table] = {
          status: error ? "error" : "success",
          message: error
            ? error.message
            : `Table '${table}' exists and is accessible`,
        };

        if (error) {
          results["tables"].status = "error";
        }
      } catch (error) {
        results["tables"].details[table] = {
          status: "error",
          message: error.message,
        };
        results["tables"].status = "error";
      }
    }

    // 4. Check edge functions
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
        status: "success",
        message: "Edge functions are accessible",
        details: {},
      };

      if (edgeFunctionsError) {
        results["edgeFunctions"].status = "error";
        results["edgeFunctions"].message = edgeFunctionsError.message;
      } else if (edgeFunctions) {
        for (const requiredFunction of requiredFunctions) {
          const exists = edgeFunctions.some((f) => f.name === requiredFunction);
          results["edgeFunctions"].details[requiredFunction] = {
            status: exists ? "success" : "error",
            message: exists
              ? `Function '${requiredFunction}' exists`
              : `Function '${requiredFunction}' is missing`,
          };

          if (!exists) {
            results["edgeFunctions"].status = "error";
          }
        }
      }
    } catch (error) {
      results["edgeFunctions"] = {
        status: "error",
        message: error.message,
      };
    }

    // 5. Check authentication
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

    // 6. Check RLS policies
    try {
      const { data: rlsData, error: rlsError } = await supabase.rpc(
        "exec_sql",
        {
          query: `
          SELECT tablename, policyname
          FROM pg_policies
          WHERE schemaname = 'public'
        `,
        },
      );

      results["rls"] = {
        status: rlsError ? "error" : "success",
        message: rlsError ? rlsError.message : "RLS policies are configured",
        policies: rlsData || [],
      };
    } catch (error) {
      results["rls"] = {
        status: "error",
        message: error.message,
      };
    }

    // 7. Check realtime configuration
    try {
      const { data: realtimeData, error: realtimeError } = await supabase.rpc(
        "exec_sql",
        {
          query: `
          SELECT pubname, tablename
          FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
        `,
        },
      );

      results["realtime"] = {
        status: realtimeError ? "error" : "success",
        message: realtimeError
          ? realtimeError.message
          : "Realtime is configured",
        tables: realtimeData || [],
      };
    } catch (error) {
      results["realtime"] = {
        status: "error",
        message: error.message,
      };
    }

    // 8. Check API endpoints
    const apiEndpoints = [
      "/api/health",
      "/api/env-check",
      "/api/verify-deployment",
      "/api/test-database",
      "/api/test-auth",
    ];

    results["apiEndpoints"] = {
      status: "success",
      details: {},
    };

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}${endpoint}`,
        );
        results["apiEndpoints"].details[endpoint] = {
          status: response.ok ? "success" : "error",
          statusCode: response.status,
          message: response.ok
            ? `Endpoint ${endpoint} is working`
            : `Endpoint ${endpoint} returned status ${response.status}`,
        };

        if (!response.ok) {
          results["apiEndpoints"].status = "error";
        }
      } catch (error) {
        results["apiEndpoints"].details[endpoint] = {
          status: "error",
          message: error.message,
        };
        results["apiEndpoints"].status = "error";
      }
    }

    // Calculate overall status
    const overallStatus = Object.values(results).some(
      (result: any) => result.status === "error",
    )
      ? "error"
      : "success";

    return NextResponse.json({
      success: true,
      results,
      overallStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error verifying deployment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify deployment" },
      { status: 500 },
    );
  }
}
