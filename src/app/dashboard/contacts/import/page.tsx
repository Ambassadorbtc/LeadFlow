import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import ContactsImportClient from "./client-import";

export default async function ImportContactsPage() {
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
                Import Contacts
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Upload a CSV file to import multiple contacts at once
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
                        The full name of the contact
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        email
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The email address of the contact
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
                        The phone number of the contact
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
                        The company the contact works for
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        position
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The job title or position of the contact
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        address
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        The address of the contact
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
                  name,email,phone,company,position,address
                  <br />
                  John Smith,john@example.com,555-123-4567,Acme Inc,CEO,123 Main
                  St
                  <br />
                  Jane Doe,jane@example.com,555-987-6543,XYZ Corp,CTO,456 Oak
                  Ave
                  <br />
                  Bob Johnson,bob@example.com,,123 Industries,Manager,
                </pre>
              </div>
            </div>

            {/* CSV Import Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-6 dark:text-white">
                Upload CSV File
              </h2>
              <ContactsImportClient />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
