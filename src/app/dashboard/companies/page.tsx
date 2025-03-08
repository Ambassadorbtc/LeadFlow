import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { Building2, Plus, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import Link from "next/link";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { name?: string; industry?: string };
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

  // Apply industry filter if provided
  if (searchParams.industry) {
    query = query.eq("industry", searchParams.industry);
  }

  const { data: companies = [] } = await query.order("name", {
    ascending: true,
  });

  // Get unique industries for filter dropdown
  const industries = [
    ...new Set(companies.map((company) => company.industry).filter(Boolean)),
  ].sort();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-8 w-full">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold dark:text-white">
                  Companies
                </h1>
                <div className="flex items-center mt-2">
                  <p className="text-gray-500 dark:text-gray-400 mr-4">
                    Manage your company accounts
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 flex items-center w-full max-w-md">
                <Search className="text-gray-400 h-5 w-5 ml-2 mr-1" />
                <form action="" method="get" className="w-full">
                  <input
                    type="text"
                    name="name"
                    placeholder="Search companies..."
                    className="w-full px-2 py-2 border-none focus:outline-none focus:ring-0 text-sm dark:bg-gray-700 dark:text-white"
                    defaultValue={searchParams.name || ""}
                  />
                </form>
              </div>
              <Link
                href="/dashboard/companies/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Company</span>
              </Link>
            </header>

            {/* Industry filter */}
            {industries.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Industry
                </label>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/companies"
                    className={`px-3 py-1 text-sm rounded-full ${!searchParams.industry ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
                  >
                    All
                  </Link>
                  {industries.map((industry) => (
                    <Link
                      key={industry}
                      href={`/dashboard/companies?industry=${encodeURIComponent(industry)}`}
                      className={`px-3 py-1 text-sm rounded-full ${searchParams.industry === industry ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}
                    >
                      {industry}
                    </Link>
                  ))}
                </div>
              </div>
            )}

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
