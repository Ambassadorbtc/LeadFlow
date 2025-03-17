import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the user ID from the authenticated session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get email logs for the user
    const { data: emailLogs, error } = await supabase
      .from("email_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch email logs" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: emailLogs,
    });
  } catch (error: any) {
    console.error("Error fetching email notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch email notifications" },
      { status: 500 },
    );
  }
}
