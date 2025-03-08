import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/actions";
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
  let query = supabase.from("leads").select("*").eq("user_id", user.id);

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <LeadsClientPage initialLeads={leads} />
        </main>
      </div>
    </div>
  );
}
