import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect("/sign-in");
  }

  const id = formData.get("id") as string;
  const prospect_id = formData.get("prospect_id") as string;
  const business_name = formData.get("business_name") as string;
  const contact_name = formData.get("contact_name") as string;
  const contact_email = formData.get("contact_email") as string;
  const phone = formData.get("phone") as string;
  const status = formData.get("status") as string;
  const owner = formData.get("owner") as string;
  const address = formData.get("address") as string;
  const deal_value = formData.get("deal_value")
    ? Number(formData.get("deal_value"))
    : null;
  const bf_interest =
    formData.get("bf_interest") === "on" ||
    formData.get("bf_interest") === "true";
  const ct_interest =
    formData.get("ct_interest") === "on" ||
    formData.get("ct_interest") === "true";
  const ba_interest =
    formData.get("ba_interest") === "on" ||
    formData.get("ba_interest") === "true";
  // Get the redirect URL if provided
  const redirect_url = formData.get("redirect_url") as string;

  // Update lead
  const { error } = await supabase
    .from("leads")
    .update({
      prospect_id,
      business_name,
      contact_name,
      contact_email,
      phone,
      status,
      owner,
      address,
      deal_value,
      bf_interest,
      ct_interest,
      ba_interest,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If status is "Convert", create a deal but don't redirect
  if (status === "Convert") {
    // Check if deal already exists for this lead
    const { data: existingDeals } = await supabase
      .from("deals")
      .select("id")
      .eq("prospect_id", prospect_id)
      .limit(1);

    if (!existingDeals || existingDeals.length === 0) {
      // Create a new deal
      const { error: dealError } = await supabase.from("deals").insert({
        name: `${business_name} Deal`,
        value: deal_value || 0,
        stage: "Contact Made",
        company: business_name,
        prospect_id: prospect_id,
        deal_type: bf_interest ? "Business Funding" : "Other",
        contact_name: contact_name,
        user_id: user.id,
      });

      if (dealError) {
        console.error("Error creating deal:", dealError);
      }
      // No redirect - we'll continue to the lead detail page
    }
    // No redirect if deal exists - we'll continue to the lead detail page
  }

  // Use absolute URL with the original request's host
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  return NextResponse.redirect(`${protocol}://${host}/dashboard/leads/${id}`);
}
