import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import ContactsPageClient from "./page-client";

export default async function ContactsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch contacts
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contacts:", error);
    return <div>Error loading contacts. Please try again later.</div>;
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <ContactsPageClient contacts={contacts || []} />
    </main>
  );
}
