import { createClient } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Call the sync_missing_users function
    const { data, error } = await supabase.rpc("sync_missing_users");

    if (error) {
      console.error("Error syncing users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get all auth users
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
    }

    // Get all public users
    const { data: publicUsers, error: publicError } = await supabase
      .from("users")
      .select("*");

    if (publicError) {
      console.error("Error fetching public users:", publicError);
    }

    return NextResponse.json({
      success: true,
      message: "User synchronization completed",
      authUserCount: authUsers?.users?.length || 0,
      publicUserCount: publicUsers?.length || 0,
    });
  } catch (error) {
    console.error("Error in sync-users API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
