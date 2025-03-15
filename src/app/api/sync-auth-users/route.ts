import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

// Add export const dynamic = 'force-dynamic' to prevent static rendering
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Call the sync_auth_users edge function with credentials in headers
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";

    console.log("Using Supabase URL:", supabaseUrl);
    console.log("Service key available:", supabaseKey ? "Yes" : "No");

    const { data, error } = await supabase.functions.invoke("sync_auth_users", {
      headers: {
        "x-supabase-url": supabaseUrl,
        "x-supabase-key": supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (error) {
      console.error("Error syncing auth users:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in sync-auth-users route:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
