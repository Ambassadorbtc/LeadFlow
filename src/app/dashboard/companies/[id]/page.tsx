import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Building2, Globe, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/actions";

export default async function CompanyDetailPage({
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

  // Fetch contacts associated with this company
  const { data: contacts = [] } = await supabase
    .from("contacts")
    .select("*")
    .eq("company", company.name)
    .eq("user_id", user.id);

  // Fetch deals associated with this company
  const { data: deals = [] } = await supabase
    .from("deals")
    .select("*")
    .eq("company", company.name)
    .eq("user_id", user.id);

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
                href="/dashboard/companies"
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ← Back to Companies
              </Link>
              <h1 className="text-2xl font-bold dark:text-white">
                {company.name}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Company Details */}
              <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {company.name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Industry
                      </label>
                      <div className="text-gray-900 dark:text-gray-200">
                        {company.industry || "Not specified"}
                      </div>
                    </div>

                    {company.website && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Website
                        </label>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <a
                            href={
                              company.website.startsWith("http")
                                ? company.website
                                : `https://${company.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {company.address && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Address
                        </label>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-200">
                            {company.address}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Added On
                      </label>
                      <div className="text-gray-900 dark:text-gray-200">
                        {new Date(
                          company.created_at || new Date(),
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link href={`/dashboard/companies/${params.id}/edit`}>
                    <Button>Edit Company</Button>
                  </Link>
                </div>
              </div>

              {/* Stats and Related */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">
                    Stats
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Contacts
                      </span>
                      <span className="font-medium dark:text-white">
                        {contacts?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Deals
                      </span>
                      <span className="font-medium dark:text-white">
                        {deals?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Deal Value
                      </span>
                      <span className="font-medium dark:text-white">
                        $
                        {(
                          deals?.reduce(
                            (sum, deal) => sum + Number(deal.value || 0),
                            0,
                          ) || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {contacts && contacts.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">
                      Contacts
                    </h2>
                    <div className="space-y-3">
                      {contacts?.slice(0, 5).map((contact) => (
                        <Link
                          key={contact.id}
                          href={`/dashboard/contacts/${contact.id}`}
                          className="block p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="font-medium dark:text-white">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.position || "No position"}
                          </div>
                        </Link>
                      ))}
                      {contacts && contacts.length > 5 && (
                        <Link
                          href={`/dashboard/contacts?company=${encodeURIComponent(company.name)}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View all {contacts?.length} contacts
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {deals && deals.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">
                      Deals
                    </h2>
                    <div className="space-y-3">
                      {deals?.slice(0, 3).map((deal) => (
                        <div
                          key={deal.id}
                          className="p-3 rounded-md bg-gray-50 dark:bg-gray-700"
                        >
                          <div className="font-medium dark:text-white">
                            {deal.name}
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500 dark:text-gray-400">
                              {deal.stage}
                            </span>
                            <span className="font-medium dark:text-white">
                              ${Number(deal.value || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
