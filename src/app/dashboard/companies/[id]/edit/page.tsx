import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import EditCompanyClientForm from "./client-form";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import Link from "next/link";

export default async function EditCompanyPage({
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

  // Fetch company details
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!company) {
    return notFound();
  }

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
                href={`/dashboard/companies/${params.id}`}
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ← Back to Company
              </Link>
              <h1 className="text-2xl font-bold dark:text-white">
                Edit Company: {company.name}
              </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <EditCompanyClientForm company={company} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
