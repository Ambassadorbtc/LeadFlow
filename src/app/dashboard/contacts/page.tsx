import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import ContactsClientPage from "./client-page";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // First, fetch all leads to create contacts from them
  const { data: leads = [] } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id);

  // Create contacts from leads if they don't exist
  for (const lead of leads) {
    // Check if contact already exists with this name
    const { data: existingContacts } = await supabase
      .from("contacts")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", lead.contact_name)
      .limit(1);

    // If contact doesn't exist, create it
    if (!existingContacts || existingContacts.length === 0) {
      await supabase.from("contacts").insert({
        name: lead.contact_name,
        email: lead.contact_email,
        phone: lead.phone,
        company: lead.business_name,
        prospect_id: lead.prospect_id,
        address: lead.address,
        owner: lead.owner,
        user_id: user.id,
      });
    }
  }

  // Now fetch all contacts with optional name filter
  let query = supabase.from("contacts").select("*").eq("user_id", user.id);

  // Apply name filter if provided
  if (searchParams.name) {
    query = query.ilike("name", `%${searchParams.name}%`);
  }

  const { data: contacts = [] } = await query.order("name", {
    ascending: true,
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <ContactsClientPage contacts={contacts} searchParams={searchParams} />
        </main>
      </div>
    </div>
  );
}
