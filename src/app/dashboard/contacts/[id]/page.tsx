import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/actions";

export default async function ContactDetailPage({
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

  // Fetch contact details
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!contact) {
    return notFound();
  }

  // Fetch deals associated with this contact
  const { data: deals = [] } = await supabase
    .from("deals")
    .select("*")
    .eq("contact_name", contact.name)
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
                href="/dashboard/contacts"
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ← Back to Contacts
              </Link>
              <h1 className="text-2xl font-bold dark:text-white">
                {contact.name}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Details */}
              <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center mb-6">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold dark:text-white">
                      {contact.name}
                    </h2>
                    {contact.position && (
                      <p className="text-gray-500 dark:text-gray-400">
                        {contact.position}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {contact.email && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Email
                        </label>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {contact.phone && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Phone
                        </label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {contact.company && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Company
                        </label>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <Link
                            href={`/dashboard/companies?name=${encodeURIComponent(contact.company)}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {contact.company}
                          </Link>
                        </div>
                      </div>
                    )}

                    {contact.owner && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Owner
                        </label>
                        <div className="text-gray-900 dark:text-gray-200">
                          {contact.owner}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {contact.address && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </label>
                    <div className="text-gray-900 dark:text-gray-200">
                      {contact.address}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Link href={`/dashboard/contacts/${params.id}/edit`}>
                    <Button>Edit Contact</Button>
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
                            (sum, deal) => sum + Number(deal.value),
                            0,
                          ) || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Added On
                      </span>
                      <span className="font-medium dark:text-white">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {deals && deals.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">
                      Deals
                    </h2>
                    <div className="space-y-3">
                      {deals.slice(0, 3).map((deal) => (
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
                              ${Number(deal.value).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contact.prospect_id && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">
                      Lead Info
                    </h2>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Prospect ID
                        </span>
                        <span className="font-medium dark:text-white">
                          {contact.prospect_id}
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/leads?search=${encodeURIComponent(contact.prospect_id)}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View associated lead
                      </Link>
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
