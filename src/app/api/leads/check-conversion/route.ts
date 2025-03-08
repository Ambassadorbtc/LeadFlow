import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all leads with status Convert that don't have deals
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "Convert");

    if (leadsError) throw leadsError;

    let convertedCount = 0;

    // Process each lead
    for (const lead of leads || []) {
      // Check if a deal already exists for this lead
      const { data: existingDeals, error: dealsError } = await supabase
        .from("deals")
        .select("id")
        .eq("prospect_id", lead.prospect_id)
        .limit(1);

      if (dealsError) throw dealsError;

      // If no deal exists, create one
      if (!existingDeals || existingDeals.length === 0) {
        const { error: dealError } = await supabase.from("deals").insert({
          name: `${lead.business_name} Deal`,
          value: lead.deal_value || 0,
          stage: "Qualification",
          company: lead.business_name,
          prospect_id: lead.prospect_id,
          deal_type: lead.bf_interest
            ? "Business Funding"
            : lead.ct_interest
              ? "Card Terminal"
              : lead.ba_interest
                ? "Booking App"
                : "Other",
          contact_name: lead.contact_name,
          user_id: user.id,
        });

        if (dealError) {
          console.error(`Error creating deal: ${dealError.message}`);
          throw dealError;
        }

        convertedCount++;
      }
    }

    return NextResponse.json({ success: true, converted: convertedCount });
  } catch (error: any) {
    console.error("Error checking conversions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
