import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const searchQuery = searchParams.q || "";

  if (!searchQuery) {
    return redirect("/dashboard");
  }

  // Search across multiple tables
  const [leadsResult, contactsResult, dealsResult, companiesResult] =
    await Promise.all([
      // Search leads
      supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .or(
          `prospect_id.ilike.%${searchQuery}%,business_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%,contact_email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,owner.ilike.%${searchQuery}%`,
        )
        .limit(10),

      // Search contacts
      supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .or(
          `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,position.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,owner.ilike.%${searchQuery}%`,
        )
        .limit(10),

      // Search deals
      supabase
        .from("deals")
        .select("*")
        .eq("user_id", user.id)
        .or(
          `name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,prospect_id.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%,stage.ilike.%${searchQuery}%,deal_type.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
        )
        .limit(10),

      // Search companies
      supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .or(
          `name.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%,website.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,prospect_id.ilike.%${searchQuery}%`,
        )
        .limit(10),
    ]);

  const leads = leadsResult.data || [];
  const contacts = contactsResult.data || [];
  const deals = dealsResult.data || [];
  const companies = companiesResult.data || [];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Search Results</h1>
              <p className="text-gray-500">Results for "{searchQuery}"</p>
            </div>

            {/* No results */}
            {leads.length === 0 &&
              contacts.length === 0 &&
              deals.length === 0 &&
              companies.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-medium mb-2">No results found</h2>
                  <p className="text-gray-500 mb-4">
                    We couldn't find anything matching "{searchQuery}"
                  </p>
                  <Link
                    href="/dashboard"
                    className="text-blue-600 hover:underline"
                  >
                    Return to dashboard
                  </Link>
                </div>
              )}

            {/* Leads results */}
            {leads.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Leads</h2>
                  <Link
                    href={`/dashboard/leads?search=${searchQuery}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all matching leads
                  </Link>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Business
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Contact
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Deal Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/dashboard/leads/${lead.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {lead.business_name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.contact_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {lead.status || "New"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.deal_value
                              ? `$${Number(lead.deal_value).toLocaleString()}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts results */}
            {contacts.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Contacts</h2>
                  <Link
                    href={`/dashboard/contacts?name=${searchQuery}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all matching contacts
                  </Link>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Company
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Phone
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/dashboard/contacts/${contact.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {contact.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {contact.email || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {contact.company || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {contact.phone || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Deals results */}
            {deals.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Deals</h2>
                  <Link
                    href={`/dashboard/deals?search=${searchQuery}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all matching deals
                  </Link>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Stage
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Company
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/dashboard/deals/${deal.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {deal.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {deal.stage}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {deal.company || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${Number(deal.value).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Companies results */}
            {companies.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Companies</h2>
                  <Link
                    href={`/dashboard/companies?name=${searchQuery}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all matching companies
                  </Link>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Industry
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Website
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companies.map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/dashboard/companies/${company.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {company.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {company.industry || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {company.website || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
