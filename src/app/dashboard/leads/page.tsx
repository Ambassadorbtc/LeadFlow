import { createClient } from "@/app/actions";
import { redirect } from "next/navigation";
import LeadsClientPage from "./client-page";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: {
    owner?: string;
    search?: string;
    status?: string;
    sort?: string;
    order?: string;
  };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch initial leads for server-side rendering
  let query = supabase.from("leads").select("*");

  // Apply initial filters from URL if present
  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  if (searchParams.search) {
    query = query.or(
      `business_name.ilike.%${searchParams.search}%,contact_name.ilike.%${searchParams.search}%,prospect_id.ilike.%${searchParams.search}%,contact_email.ilike.%${searchParams.search}%`,
    );
  }

  // Apply sorting
  const sortField = searchParams.sort || "created_at";
  const sortOrder = searchParams.order || "desc";
  query = query.order(sortField, { ascending: sortOrder === "asc" });

  const { data: leads = [] } = await query;

  return (
    <main className="flex-1 overflow-auto">
      <LeadsClientPage initialLeads={leads} />
    </main>
  );
}
