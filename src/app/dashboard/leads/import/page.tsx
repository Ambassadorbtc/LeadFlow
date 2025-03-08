import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import ClientCSVImport from "./client-import";

export default async function ImportLeadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold">Import Leads</h1>
              <p className="text-gray-500 mt-2">
                Upload a CSV file to import multiple leads at once
              </p>
            </header>

            {/* Import Instructions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-medium mb-4">
                CSV Format Instructions
              </h2>
              <p className="mb-4">
                Your CSV file should include the following columns:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Column Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Required
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        prospect_id
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Unique identifier for the lead (used for duplicate
                        checking)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        business_name
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Name of the business or company
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        contact_name
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Yes
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Full name of the primary contact
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        contact_email
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Email address of the contact
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        address
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Business address
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        owner
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Person responsible for this lead
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        status
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        No
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Current status of the lead (defaults to "New")
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Example CSV:</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                  Prospect ID,Business Name,Contact Name,Contact Email,Phone
                  Number,Address,Owner
                  <br />
                  LEAD001,Acme Corporation,John Smith,john@acmecorp.com,"123
                  Main St, Anytown, USA",Jane Doe,New
                  <br />
                  LEAD002,XYZ Industries,Sarah Johnson,sarah@xyzind.com,"456 Oak
                  Ave, Somewhere, USA",Jane Doe,Contacted
                  <br />
                  LEAD003,ABC Services,Michael
                  Brown,michael@abcservices.com,"789 Pine Rd, Elsewhere,
                  USA",John Smith,Qualified
                </pre>
              </div>
            </div>

            {/* CSV Import Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-6">Upload CSV File</h2>
              <ClientCSVImport />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
