import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import AddLeadClientForm from "./client-form";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import Link from "next/link";

export default async function AddLeadPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const handleSubmit = async (formData: any) => {
    "use server";

    try {
      const { error } = await supabase.from("leads").insert({
        ...formData,
        user_id: user.id,
      });

      if (error) throw error;
      return redirect("/dashboard/leads");
    } catch (error) {
      console.error("Error adding lead:", error);
      return { error: "Failed to add lead" };
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header with back button */}
            <div className="flex items-center mb-6">
              <Link
                href="/dashboard/leads"
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ← Back to Leads
              </Link>
              <h1 className="text-2xl font-bold dark:text-white">
                Add New Lead
              </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <AddLeadClientForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
