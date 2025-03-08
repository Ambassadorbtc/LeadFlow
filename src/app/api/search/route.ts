import { createClient } from "@/app/actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Search across multiple tables in parallel
    const [leadsResult, contactsResult, dealsResult, companiesResult] =
      await Promise.all([
        // Search leads
        supabase
          .from("leads")
          .select("*")
          .eq("user_id", user.id)
          .or(
            `prospect_id.ilike.%${query}%,business_name.ilike.%${query}%,contact_name.ilike.%${query}%,contact_email.ilike.%${query}%,phone.ilike.%${query}%`,
          )
          .limit(10),

        // Search contacts
        supabase
          .from("contacts")
          .select("*")
          .eq("user_id", user.id)
          .or(
            `name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%,phone.ilike.%${query}%,position.ilike.%${query}%`,
          )
          .limit(10),

        // Search deals
        supabase
          .from("deals")
          .select("*")
          .eq("user_id", user.id)
          .or(
            `name.ilike.%${query}%,company.ilike.%${query}%,prospect_id.ilike.%${query}%,contact_name.ilike.%${query}%,description.ilike.%${query}%`,
          )
          .limit(10),

        // Search companies
        supabase
          .from("companies")
          .select("*")
          .eq("user_id", user.id)
          .or(
            `name.ilike.%${query}%,industry.ilike.%${query}%,website.ilike.%${query}%,address.ilike.%${query}%`,
          )
          .limit(10),
      ]);

    // Format results
    const results = {
      leads: leadsResult.data || [],
      contacts: contactsResult.data || [],
      deals: dealsResult.data || [],
      companies: companiesResult.data || [],
    };

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
