import { NextResponse } from "next/server";
import { createClient } from "@/app/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diagnostics: Record<string, any> = {};

    // 1. Check environment variables
    diagnostics.environment = {
      SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID ? "✓" : "✗",
      SUPABASE_URL: process.env.SUPABASE_URL ? "✓" : "✗",
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? "✓" : "✗",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "✓" : "✗",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "✓"
        : "✗",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "✓"
        : "✗",
    };

    // 2. Try to create Supabase client
    let supabase;
    try {
      supabase = await createClient();
      diagnostics.client = "✓";
    } catch (error: any) {
      diagnostics.client = `✗ - ${error.message}`;
      // Return early if we can't create the client
      return NextResponse.json({
        success: false,
        diagnostics,
        error: "Failed to create Supabase client",
      });
    }

    // 3. Check database connection
    try {
      const { data, error } = await supabase
        .from("users")
        .select("count")
        .limit(1);
      diagnostics.database = error ? `✗ - ${error.message}` : "✓";
    } catch (error: any) {
      diagnostics.database = `✗ - ${error.message}`;
    }

    // 4. Check required tables
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

    diagnostics.tables = {};
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count")
          .limit(1);
        diagnostics.tables[table] = error ? `✗ - ${error.message}` : "✓";
      } catch (error: any) {
        diagnostics.tables[table] = `✗ - ${error.message}`;
      }
    }

    // 5. Check edge functions
    try {
      const { data: functions, error } = await supabase.functions.list();
      if (error) {
        diagnostics.edgeFunctions = `✗ - ${error.message}`;
      } else {
        diagnostics.edgeFunctions = {};
        const requiredFunctions = [
          "sync_auth_users",
          "create_users_table_if_not_exists",
          "create_user_settings_if_not_exists",
          "add_missing_columns",
        ];

        for (const funcName of requiredFunctions) {
          const exists = functions?.some((f) => f.name === funcName);
          diagnostics.edgeFunctions[funcName] = exists ? "✓" : "✗ - Not found";
        }
      }
    } catch (error: any) {
      diagnostics.edgeFunctions = `✗ - ${error.message}`;
    }

    // 6. Try to invoke each edge function
    if (typeof diagnostics.edgeFunctions === "object") {
      diagnostics.functionInvocation = {};
      for (const funcName of Object.keys(diagnostics.edgeFunctions)) {
        if (diagnostics.edgeFunctions[funcName] === "✓") {
          try {
            const { data, error } = await supabase.functions.invoke(funcName, {
              headers: {
                Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
              },
            });
            diagnostics.functionInvocation[funcName] = error
              ? `✗ - ${error.message}`
              : "✓";
          } catch (error: any) {
            diagnostics.functionInvocation[funcName] = `✗ - ${error.message}`;
          }
        }
      }
    }

    // 7. Check auth system
    try {
      const { data, error } = await supabase.auth.getSession();
      diagnostics.auth = error ? `✗ - ${error.message}` : "✓";
    } catch (error: any) {
      diagnostics.auth = `✗ - ${error.message}`;
    }

    // 8. Check RLS policies
    try {
      const { data, error } = await supabase.rpc("exec_sql", {
        query: `
          SELECT tablename, policyname
          FROM pg_policies
          WHERE schemaname = 'public'
        `,
      });
      diagnostics.rls = error
        ? `✗ - ${error.message}`
        : { policies: data || [] };
    } catch (error: any) {
      diagnostics.rls = `✗ - ${error.message}`;
    }

    // 9. Check realtime configuration
    try {
      const { data, error } = await supabase.rpc("exec_sql", {
        query: `
          SELECT pubname, tablename
          FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
        `,
      });
      diagnostics.realtime = error
        ? `✗ - ${error.message}`
        : { tables: data || [] };
    } catch (error: any) {
      diagnostics.realtime = `✗ - ${error.message}`;
    }

    return NextResponse.json({
      success: true,
      diagnostics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in deployment diagnostics:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run diagnostics" },
      { status: 500 },
    );
  }
}
