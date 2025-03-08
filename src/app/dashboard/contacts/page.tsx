import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import ContactsClientPage from "./client-page";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: {
    name?: string;
    company?: string;
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

  // Fetch initial contacts with server-side filtering
  let query = supabase.from("contacts").select("*").eq("user_id", user.id);

  // Apply name filter if provided
  if (searchParams.name) {
    query = query.ilike("name", `%${searchParams.name}%`);
  }

  // Apply company filter if provided
  if (searchParams.company) {
    query = query.eq("company", searchParams.company);
  }

  // Apply sorting
  const sortField = searchParams.sort || "name";
  const sortOrder = searchParams.order || "asc";
  query = query.order(sortField, { ascending: sortOrder === "asc" });

  const { data: contacts = [] } = await query;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <ContactsClientPage
            initialContacts={contacts}
            initialSearchParams={searchParams}
          />
        </main>
      </div>
    </div>
  );
}
