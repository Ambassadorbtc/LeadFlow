import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import DealsImportClient from "./client-import";

export default async function ImportDealsPage() {
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
                Import Deals
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Upload a CSV file to import multiple deals at once
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
                        name
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The name of the deal
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        value
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The monetary value of the deal (numeric)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        stage
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The pipeline stage (Qualification, Needs Analysis, Value
                        Proposition, etc.)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        company
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The company associated with the deal
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        closing_date
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The expected closing date (YYYY-MM-DD format)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        description
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        A description of the deal
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
                  name,value,stage,company,closing_date,description
                  <br />
                  New Software Deal,10000,Qualification,Acme
                  Inc,2023-12-31,Enterprise software license
                  <br />
                  Consulting Project,5000,Needs Analysis,XYZ
                  Corp,2023-11-15,Quarterly consulting services
                  <br />
                  Hardware Upgrade,15000,Value Proposition,123
                  Industries,,Server infrastructure upgrade
                </pre>
              </div>
            </div>

            {/* CSV Import Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-6 dark:text-white">
                Upload CSV File
              </h2>
              <DealsImportClient />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
