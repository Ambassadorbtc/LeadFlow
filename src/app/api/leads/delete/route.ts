import { createClient } from "@/supabase/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { leadIds } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid lead IDs provided" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Delete the leads
    const { error } = await supabase.from("leads").delete().in("id", leadIds);

    if (error) {
      console.error("Error deleting leads:", error);
      return NextResponse.json(
        { error: "Failed to delete leads" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, deletedCount: leadIds.length });
  } catch (error) {
    console.error("Error in delete leads API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
