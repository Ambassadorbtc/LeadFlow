import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leadId = formData.get("id") as string;

  try {
    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("user_id", user.id)
      .single();

    if (leadError || !lead) {
      throw new Error(leadError?.message || "Lead not found");
    }

    // Update lead status to Convert
    const { error: updateError } = await supabase
      .from("leads")
      .update({ status: "Convert" })
      .eq("id", leadId)
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Check if deal already exists for this lead
    const { data: existingDeals } = await supabase
      .from("deals")
      .select("id")
      .eq("prospect_id", lead.prospect_id)
      .limit(1);

    if (!existingDeals || existingDeals.length === 0) {
      // Create a new deal
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
        throw new Error(dealError.message);
      }
    }

    // Use absolute URL with the original request's host
    const host = request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return NextResponse.redirect(
      `${protocol}://${host}/dashboard/leads/${leadId}`,
    );
  } catch (error: any) {
    console.error("Error converting lead:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
