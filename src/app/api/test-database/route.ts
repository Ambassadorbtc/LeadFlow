import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test all required tables
    const tables = [
      "users",
      "leads",
      "deals",
      "contacts",
      "companies",
      "notifications",
      "user_settings",
      "system_settings",
    ];

    const results = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count")
          .limit(1);

        results[table] = {
          exists: !error,
          error: error ? error.message : null,
        };
      } catch (error) {
        results[table] = {
          exists: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    // Test RLS policies
    const { data: rlsData, error: rlsError } = await supabase.rpc("exec_sql", {
      query: `
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
      `,
    });

    // Check realtime configuration
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

    return NextResponse.json({
      success: true,
      tables: results,
      rlsPolicies: rlsError ? { error: rlsError.message } : rlsData,
      realtime: realtimeError ? { error: realtimeError.message } : realtimeData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error testing database:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error) || "Failed to test database",
      },
      { status: 500 },
    );
  }
}
