import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { table } = await request.json();

    if (table === "users") {
      try {
        // First try the RPC function
        try {
          await supabase.rpc("create_users_table_if_not_exists");
        } catch (rpcError) {
          console.error("RPC error, trying edge function:", rpcError);
          // If RPC fails, try the edge function
          const { error: edgeFunctionError } = await supabase.functions.invoke(
            "supabase-functions-create-users-table-if-not-exists",
          );
          if (edgeFunctionError) throw edgeFunctionError;
        }
      } catch (error) {
        console.error("Error creating users table:", error);
        // Continue execution even if this fails
      }
    }

    if (table === "user_settings") {
      try {
        // First try the RPC function
        try {
          await supabase.rpc("create_user_settings_if_not_exists");
        } catch (rpcError) {
          console.error("RPC error, trying edge function:", rpcError);
          // If RPC fails, try the edge function
          const { error: edgeFunctionError } = await supabase.functions.invoke(
            "supabase-functions-create-user-settings-if-not-exists",
          );
          if (edgeFunctionError) throw edgeFunctionError;
        }
      } catch (error) {
        console.error("Error creating user_settings table:", error);
        // Continue execution even if this fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting up tables:", error);
    return NextResponse.json(
      { error: "Failed to set up tables" },
      { status: 500 },
    );
  }
}
