import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get("csvFile") as File;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!csvFile) {
      return NextResponse.json(
        { error: "No CSV file provided" },
        { status: 400 },
      );
    }

    // Read the file content
    const fileContent = await csvFile.text();
    const rows = fileContent.split("\n");

    // Parse headers (first row)
    const headers = rows[0].split(",").map((header) => header.trim());

    // Validate required headers
    const requiredHeaders = ["business_name", "contact_name"];
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required headers: ${missingHeaders.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Parse data rows
    const leads = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows

      const values = rows[i].split(",").map((value) => value.trim());
      if (values.length !== headers.length) continue; // Skip malformed rows

      const lead: Record<string, any> = {};
      headers.forEach((header, index) => {
        lead[header] = values[index];
      });

      // Add required fields if missing
      lead.user_id = user.id;
      lead.created_at = new Date().toISOString();
      lead.updated_at = new Date().toISOString();
      lead.status = lead.status || "New";
      lead.prospect_id =
        lead.prospect_id || `LEAD-${Math.floor(Math.random() * 10000)}`;

      // Convert numeric values
      if (lead.deal_value) {
        lead.deal_value = parseFloat(lead.deal_value) || 0;
      }

      // Convert boolean values
      if (lead.bf_interest) {
        lead.bf_interest =
          lead.bf_interest.toLowerCase() === "true" || lead.bf_interest === "1";
      }
      if (lead.ct_interest) {
        lead.ct_interest =
          lead.ct_interest.toLowerCase() === "true" || lead.ct_interest === "1";
      }
      if (lead.ba_interest) {
        lead.ba_interest =
          lead.ba_interest.toLowerCase() === "true" || lead.ba_interest === "1";
      }

      leads.push(lead);
    }

    if (leads.length === 0) {
      return NextResponse.json(
        { error: "No valid leads found in CSV" },
        { status: 400 },
      );
    }

    // Insert leads into database
    const { data, error } = await supabase.from("leads").insert(leads).select();

    if (error) {
      console.error("Error inserting leads:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${leads.length} leads`,
      leads: data,
    });
  } catch (error: any) {
    console.error("Error importing leads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import leads" },
      { status: 500 },
    );
  }
}
