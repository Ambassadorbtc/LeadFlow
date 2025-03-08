import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import LeadsImportClient from "./client-import";

export default async function ImportLeadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold dark:text-white">
                Import Leads
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Upload a CSV file to import multiple leads at once
              </p>
            </header>

            {/* Import Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-medium mb-4 dark:text-white">
                CSV Format Instructions
              </h2>
              <p className="mb-4 dark:text-gray-300">
                Your CSV file should include the following columns:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Column Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Required
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        prospect_id
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        A unique identifier for the lead (will be generated if
                        not provided)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        business_name
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The name of the business
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        contact_name
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The name of the primary contact
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        contact_email
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The email address of the primary contact
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        phone
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The phone number of the business or primary contact
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        status
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The status of the lead (New, Contacted, Qualified, etc.)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-medium mb-2 dark:text-white">
                  Example CSV:
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto text-sm dark:text-gray-300">
                  business_name,contact_name,contact_email,phone,status
                  <br />
                  Acme Inc,John Smith,john@acme.com,555-123-4567,New
                  <br />
                  XYZ Corp,Jane Doe,jane@xyz.com,555-987-6543,Contacted
                  <br />
                  123 Industries,Bob Johnson,bob@123industries.com,,Qualified
                </pre>
              </div>
            </div>

            {/* CSV Import Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-6 dark:text-white">
                Upload CSV File
              </h2>
              <LeadsImportClient />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
