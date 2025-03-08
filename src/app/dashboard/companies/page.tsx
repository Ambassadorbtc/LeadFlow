import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { Building2, Plus, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import Link from "next/link";

export default async function CompaniesPage({
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

  // First, fetch all leads to create companies from them
  const { data: leads = [] } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id);

  // Create companies from leads if they don't exist
  for (const lead of leads || []) {
    // Check if company already exists with this name
    const { data: existingCompanies } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", lead.business_name)
      .limit(1);

    // If company doesn't exist, create it
    if (!existingCompanies || existingCompanies.length === 0) {
      await supabase.from("companies").insert({
        name: lead.business_name,
        prospect_id: lead.prospect_id,
        user_id: user.id,
      });
    }
  }

  // Now fetch all companies with optional name filter
  let query = supabase.from("companies").select("*").eq("user_id", user.id);

  // Apply name filter if provided
  if (searchParams.name) {
    query = query.ilike("name", `%${searchParams.name}%`);
  }

  const { data: companies = [] } = await query.order("name", {
    ascending: true,
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-8 w-full">
            {/* Header Section */}
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold dark:text-white">
                  Companies
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Manage your company accounts
                </p>
              </div>
              <Link
                href="/dashboard/companies/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Company</span>
              </Link>
            </header>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <form action="" method="get">
                  <input
                    type="text"
                    name="name"
                    placeholder="Search companies..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    defaultValue={searchParams.name || ""}
                  />
                </form>
              </div>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies && companies.length > 0 ? (
                companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/dashboard/companies/${company.id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {company.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {company.industry || "No industry specified"}
                          </p>
                        </div>
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>

                      {company.website && (
                        <div className="mt-4">
                          <a
                            href={
                              company.website.startsWith("http")
                                ? company.website
                                : `https://${company.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Added:
                          </span>
                          <span className="dark:text-gray-300">
                            {new Date(company.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-10 text-center text-gray-500 dark:text-gray-400">
                  <Building2 className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="mb-4">
                    No companies found. Add your first company to get started.
                  </p>
                  <Link
                    href="/dashboard/companies/add"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Company</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
