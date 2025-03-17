import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const checklist = {};

    // 1. Environment Variables
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_KEY",
      "SUPABASE_PROJECT_ID",
    ];

    checklist["environment_variables"] = {
      title: "Environment Variables",
      items: [],
      status: "success",
    };

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      checklist["environment_variables"].items.push({
        name: envVar,
        status: value ? "success" : "error",
        message: value
          ? `Environment variable '${envVar}' is set`
          : `Environment variable '${envVar}' is missing`,
      });

      if (!value) {
        checklist["environment_variables"].status = "error";
      }
    }

    // 2. Edge Functions
    checklist["edge_functions"] = {
      title: "Edge Functions",
      items: [],
      status: "success",
    };

    try {
      const { data: edgeFunctions, error: edgeFunctionsError } =
        await supabase.functions.list();

      if (edgeFunctionsError) {
        checklist["edge_functions"].status = "error";
        checklist["edge_functions"].items.push({
          name: "Edge Functions List",
          status: "error",
          message: edgeFunctionsError.message,
        });
      } else {
        const requiredFunctions = [
          "sync_auth_users",
          "create_users_table_if_not_exists",
          "create_user_settings_if_not_exists",
          "add_missing_columns",
        ];

        for (const func of requiredFunctions) {
          const exists = edgeFunctions?.some((f) => f.name === func);
          checklist["edge_functions"].items.push({
            name: func,
            status: exists ? "success" : "error",
            message: exists
              ? `Edge function '${func}' exists`
              : `Edge function '${func}' is missing`,
          });

          if (!exists) {
            checklist["edge_functions"].status = "error";
          }
        }
      }
    } catch (error: any) {
      checklist["edge_functions"].status = "error";
      checklist["edge_functions"].items.push({
        name: "Edge Functions Check",
        status: "error",
        message: error.message,
      });
    }

    // 3. Database Tables
    checklist["database_tables"] = {
      title: "Database Tables",
      items: [],
      status: "success",
    };

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

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1);

        checklist["database_tables"].items.push({
          name: table,
          status: error ? "error" : "success",
          message: error
            ? `Table '${table}' error: ${error.message}`
            : `Table '${table}' exists and is accessible`,
        });

        if (error) {
          checklist["database_tables"].status = "error";
        }
      } catch (error: any) {
        checklist["database_tables"].items.push({
          name: table,
          status: "error",
          message: `Table '${table}' error: ${error.message}`,
        });
        checklist["database_tables"].status = "error";
      }
    }

    // 4. RLS Policies
    checklist["rls_policies"] = {
      title: "RLS Policies",
      items: [],
      status: "success",
    };

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

      if (rlsError) {
        checklist["rls_policies"].status = "error";
        checklist["rls_policies"].items.push({
          name: "RLS Policies Check",
          status: "error",
          message: rlsError.message,
        });
      } else {
        // Check if each table has at least one policy
        for (const table of requiredTables) {
          const hasPolicies = rlsData?.some(
            (policy) => policy.tablename === table,
          );
          checklist["rls_policies"].items.push({
            name: `${table} policies`,
            status: hasPolicies ? "success" : "warning",
            message: hasPolicies
              ? `Table '${table}' has RLS policies`
              : `Table '${table}' may not have RLS policies`,
          });

          if (!hasPolicies) {
            checklist["rls_policies"].status = "warning";
          }
        }
      }
    } catch (error: any) {
      checklist["rls_policies"].status = "error";
      checklist["rls_policies"].items.push({
        name: "RLS Policies Check",
        status: "error",
        message: error.message,
      });
    }

    // 5. Realtime Configuration
    checklist["realtime"] = {
      title: "Realtime Configuration",
      items: [],
      status: "success",
    };

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

      if (realtimeError) {
        checklist["realtime"].status = "error";
        checklist["realtime"].items.push({
          name: "Realtime Check",
          status: "error",
          message: realtimeError.message,
        });
      } else {
        // Check if each table is in the realtime publication
        for (const table of requiredTables) {
          const isRealtime = realtimeData?.some(
            (rt) =>
              rt.tablename === table && rt.pubname === "supabase_realtime",
          );
          checklist["realtime"].items.push({
            name: `${table} realtime`,
            status: isRealtime ? "success" : "warning",
            message: isRealtime
              ? `Table '${table}' is in realtime publication`
              : `Table '${table}' is not in realtime publication`,
          });

          if (!isRealtime) {
            checklist["realtime"].status = "warning";
          }
        }
      }
    } catch (error: any) {
      checklist["realtime"].status = "error";
      checklist["realtime"].items.push({
        name: "Realtime Check",
        status: "error",
        message: error.message,
      });
    }

    // 6. Authentication
    checklist["authentication"] = {
      title: "Authentication",
      items: [],
      status: "success",
    };

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getSession();

      checklist["authentication"].items.push({
        name: "Auth System",
        status: authError ? "error" : "success",
        message: authError
          ? `Auth error: ${authError.message}`
          : "Authentication system is working",
      });

      if (authError) {
        checklist["authentication"].status = "error";
      }

      // Check auth.users and public.users sync
      try {
        const { data: syncData, error: syncError } =
          await supabase.functions.invoke("sync_auth_users", {
            headers: {
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            },
          });

        checklist["authentication"].items.push({
          name: "Auth-Public Users Sync",
          status: syncError ? "error" : "success",
          message: syncError
            ? `Sync error: ${syncError.message}`
            : "Auth and public users are synchronized",
        });

        if (syncError) {
          checklist["authentication"].status = "error";
        }
      } catch (error: any) {
        checklist["authentication"].items.push({
          name: "Auth-Public Users Sync",
          status: "error",
          message: `Sync error: ${error.message}`,
        });
        checklist["authentication"].status = "error";
      }
    } catch (error: any) {
      checklist["authentication"].items.push({
        name: "Auth System",
        status: "error",
        message: `Auth error: ${error.message}`,
      });
      checklist["authentication"].status = "error";
    }

    // 7. API Routes
    checklist["api_routes"] = {
      title: "API Routes",
      items: [],
      status: "success",
    };

    const criticalApiRoutes = [
      "/api/verify-deployment",
      "/api/test-database",
      "/api/test-auth",
      "/api/test-api-routes",
      "/api/env-check",
      "/api/health",
    ];

    for (const route of criticalApiRoutes) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}${route}`,
        );

        checklist["api_routes"].items.push({
          name: route,
          status: response.ok ? "success" : "error",
          message: response.ok
            ? `API route '${route}' is working`
            : `API route '${route}' returned status ${response.status}`,
        });

        if (!response.ok) {
          checklist["api_routes"].status = "error";
        }
      } catch (error: any) {
        checklist["api_routes"].items.push({
          name: route,
          status: "error",
          message: `API route '${route}' error: ${error.message}`,
        });
        checklist["api_routes"].status = "error";
      }
    }

    // Calculate overall status
    const overallStatus = Object.values(checklist).some(
      (section: any) => section.status === "error",
    )
      ? "error"
      : Object.values(checklist).some(
            (section: any) => section.status === "warning",
          )
        ? "warning"
        : "success";

    return NextResponse.json({
      success: true,
      checklist,
      overallStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating deployment checklist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate deployment checklist" },
      { status: 500 },
    );
  }
}
