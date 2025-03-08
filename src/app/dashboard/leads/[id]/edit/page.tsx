import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import Link from "next/link";
import EditLeadForm from "./client-form";

export default async function EditLeadPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch lead details
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!lead) {
    return notFound();
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header with back button */}
            <div className="flex items-center mb-6">
              <Link
                href={`/dashboard/leads/${params.id}`}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← Back to Lead
              </Link>
              <h1 className="text-2xl font-bold">
                Edit Lead: {lead.business_name}
              </h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <EditLeadForm lead={lead} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
