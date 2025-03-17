import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";
import { parseCSV, mapCSVToLeads } from "@/app/dashboard/leads/csv-parser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get("csvFile") as File;
    const supabase = await createClient();

    // Get current user with improved error handling
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 },
      );
    }

    if (!userData?.user) {
      // Try to refresh the session
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError || !refreshData?.user) {
        console.error("Session refresh failed:", refreshError);
        return NextResponse.json(
          { error: "Session expired. Please sign in again." },
          { status: 401 },
        );
      }

      userData.user = refreshData.user;
    }

    const { user } = userData;

    if (!csvFile) {
      return NextResponse.json(
        { error: "No CSV file provided" },
        { status: 400 },
      );
    }

    // Read the file content
    const fileContent = await csvFile.text();
    const rows = fileContent.split("\n");

    if (rows.length === 0 || rows[0].trim() === "") {
      return NextResponse.json(
        { error: "CSV file is empty or invalid" },
        { status: 400 },
      );
    }

    // Parse data rows using the improved CSV parser
    const csvText = fileContent;
    const parsedRows = parseCSV(csvText);

    if (parsedRows.length === 0) {
      return NextResponse.json(
        { error: "No valid data found in CSV file" },
        { status: 400 },
      );
    }

    const leads = mapCSVToLeads(parsedRows, user.id);

    // Create an import history record
    const { data: importRecord, error: importHistoryError } = await supabase
      .from("import_history")
      .insert({
        user_id: user.id,
        import_type: "leads",
        file_name: csvFile.name,
        record_count: leads.length,
        status: "processing",
        metadata: { source: "api_upload" },
      })
      .select()
      .single();

    if (importHistoryError) {
      console.error("Error creating import history:", importHistoryError);
      return NextResponse.json(
        { error: importHistoryError.message },
        { status: 500 },
      );
    }

    // Add import batch ID to each lead
    leads.forEach((lead) => {
      lead.import_batch_id = importRecord.id;
    });

    // Insert leads into database with conflict handling
    const { data, error } = await supabase
      .from("leads")
      .upsert(leads, { onConflict: "prospect_id", ignoreDuplicates: false })
      .select();

    if (error) {
      // Update import history to failed
      await supabase
        .from("import_history")
        .update({
          status: "failed",
          metadata: { error: error.message },
        })
        .eq("id", importRecord.id);

      console.error("Error inserting leads:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update import history to completed
    await supabase
      .from("import_history")
      .update({
        status: "completed",
        metadata: {
          ...importRecord.metadata,
          completed_at: new Date().toISOString(),
        },
      })
      .eq("id", importRecord.id);

    // Create notification for lead import
    try {
      const notificationResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/notifications/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            title: "Leads Imported",
            message: `Successfully imported ${leads.length} leads from ${csvFile.name}`,
            type: "lead",
            relatedId: importRecord.id,
            relatedType: "import",
            metadata: {
              importId: importRecord.id,
              leadCount: leads.length,
              fileName: csvFile.name,
            },
          }),
        },
      );

      if (!notificationResponse.ok) {
        console.error("Failed to create notification for lead import");
      }

      // Send email notification if user has email notifications enabled
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("email_notifications, lead_notifications")
        .eq("user_id", user.id)
        .single();

      if (
        userSettings?.email_notifications &&
        userSettings?.lead_notifications
      ) {
        // In a production environment, you would integrate with an email service here
        console.log(
          `Would send email notification to user ${user.id} about lead import`,
        );
      }
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Continue with the response even if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${leads.length} leads`,
      leads: data,
      importId: importRecord.id,
    });
  } catch (error: any) {
    console.error("Error importing leads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import leads" },
      { status: 500 },
    );
  }
}
