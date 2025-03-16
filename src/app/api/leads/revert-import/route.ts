import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { importId } = await request.json();
    const supabase = await createClient();

    // Get current user
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }

    // Verify the import record exists and belongs to the user
    const { data: importRecord, error: fetchError } = await supabase
      .from("import_history")
      .select("*")
      .eq("id", importId)
      .eq("user_id", userData.user.id)
      .single();

    if (fetchError || !importRecord) {
      return NextResponse.json(
        { error: "Import record not found or access denied" },
        { status: 404 },
      );
    }

    // Check if the import is already reverted
    if (importRecord.status === "reverted") {
      return NextResponse.json(
        { error: "This import has already been reverted" },
        { status: 400 },
      );
    }

    // Delete all leads associated with this import batch
    const { error: deleteError } = await supabase
      .from("leads")
      .delete()
      .eq("import_batch_id", importId);

    if (deleteError) {
      console.error("Error deleting leads:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Update the import history record
    const { error: updateError } = await supabase
      .from("import_history")
      .update({
        status: "reverted",
        metadata: {
          ...importRecord.metadata,
          reverted_at: new Date().toISOString(),
          reverted_by: userData.user.id,
        },
      })
      .eq("id", importId);

    if (updateError) {
      console.error("Error updating import history:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully reverted import of ${importRecord.record_count} leads`,
    });
  } catch (error: any) {
    console.error("Error reverting import:", error);
    return NextResponse.json(
      { error: error.message || "Failed to revert import" },
      { status: 500 },
    );
  }
}
