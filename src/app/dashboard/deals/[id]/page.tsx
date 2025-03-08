import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/actions";

export default async function DealDetailPage({
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

  // Fetch deal details
  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!deal) {
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
                href="/dashboard/deals"
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ← Back to Deals
              </Link>
              <h1 className="text-2xl font-bold dark:text-white">
                {deal.name}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Deal Details */}
              <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold dark:text-white">
                      {deal.name}
                    </h2>
                    <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                      ${Number(deal.value).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Stage
                      </label>
                      <div className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {deal.stage}
                      </div>
                    </div>

                    {deal.company && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Company
                        </label>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <Link
                            href={`/dashboard/companies?name=${encodeURIComponent(deal.company)}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {deal.company}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {deal.closing_date && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Closing Date
                        </label>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-200">
                            {new Date(deal.closing_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Deal Type
                      </label>
                      <div className="text-gray-900 dark:text-gray-200">
                        {deal.deal_type || "Other"}
                      </div>
                    </div>
                  </div>
                </div>

                {deal.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <div className="text-gray-900 dark:text-gray-200 whitespace-pre-line">
                      {deal.description}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Link href={`/dashboard/deals/${params.id}/edit`}>
                    <Button>Edit Deal</Button>
                  </Link>
                </div>
              </div>

              {/* Stats and Related */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">
                    Details
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Created
                      </span>
                      <span className="font-medium dark:text-white">
                        {new Date(deal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Last Updated
                      </span>
                      <span className="font-medium dark:text-white">
                        {new Date(
                          deal.updated_at || deal.created_at || new Date(),
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {deal.contact_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Contact
                        </span>
                        <Link
                          href={`/dashboard/contacts?name=${encodeURIComponent(deal.contact_name)}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {deal.contact_name}
                        </Link>
                      </div>
                    )}
                    {deal.prospect_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Prospect ID
                        </span>
                        <Link
                          href={`/dashboard/leads?search=${encodeURIComponent(deal.prospect_id)}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {deal.prospect_id}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">
                    Actions
                  </h2>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      Move to Next Stage
                    </Button>
                    <Button className="w-full" variant="outline">
                      Add Activity
                    </Button>
                    <Button className="w-full" variant="outline">
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
