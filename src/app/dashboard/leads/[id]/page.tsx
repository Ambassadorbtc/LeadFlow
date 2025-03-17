// Removed navbar and sidebar imports
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, User, UserCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/actions";

export default async function LeadDetailPage({
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

  // Fetch lead details
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!lead) {
    return notFound();
  }

  // Fetch lead comments
  const { data: comments = [] } = await supabase
    .from("lead_comments")
    .select("*")
    .eq("lead_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div className="h-full w-full bg-gray-50">
      <main className="overflow-auto w-full">
        <div className="container mx-auto px-4 py-8">
          {/* Header with back button */}
          <div className="flex items-center mb-6">
            <Link
              href="/dashboard/leads"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              ← Back to Leads
            </Link>
            <h1 className="text-2xl font-bold">{lead.business_name}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lead Details */}
            <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Lead Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Prospect ID
                    </label>
                    <div className="text-gray-900">{lead.prospect_id}</div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Business Name
                    </label>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                      <Link
                        href={`/dashboard/companies?name=${encodeURIComponent(lead.business_name)}`}
                        className="text-blue-600 hover:underline"
                      >
                        {lead.business_name}
                      </Link>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Contact Name
                    </label>
                    <div className="flex items-center">
                      <UserCircle className="h-4 w-4 mr-2 text-gray-500" />
                      <Link
                        href={`/dashboard/contacts?name=${encodeURIComponent(lead.contact_name)}`}
                        className="text-blue-600 hover:underline"
                      >
                        {lead.contact_name}
                      </Link>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {lead.contact_email ? (
                        <a
                          href={`mailto:${lead.contact_email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {lead.contact_email}
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Phone
                    </label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Owner
                    </label>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      {lead.owner ? (
                        <Link
                          href={`/dashboard/leads?owner=${encodeURIComponent(lead.owner)}`}
                          className="text-blue-600 hover:underline"
                        >
                          {lead.owner}
                        </Link>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Address
                </label>
                <div className="text-gray-900">
                  {lead.address || <span className="text-gray-500">-</span>}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <form
                  action="/api/leads/convert"
                  method="POST"
                  className="mr-2"
                >
                  <input type="hidden" name="id" value={params.id} />
                  <Button type="submit" variant="outline">
                    Convert to Deal
                  </Button>
                </form>
                <Link href={`/dashboard/leads/${params.id}/edit`}>
                  <Button>Edit Lead</Button>
                </Link>
              </div>
            </div>

            {/* Status and Activity */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Status</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Current Status
                  </label>
                  {lead.status === "New" ? (
                    <div className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      New
                    </div>
                  ) : lead.status === "Prospect" ? (
                    <div className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                      Prospect
                    </div>
                  ) : lead.status === "Convert" ? (
                    <div className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">
                      Convert
                    </div>
                  ) : (
                    <div className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                      {lead.status || "New"}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Deal Value
                  </label>
                  <div className="text-gray-900 font-medium">
                    {lead.deal_value
                      ? `${Number(lead.deal_value).toLocaleString()}`
                      : "-"}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Interests
                  </label>
                  <div className="flex flex-col space-y-1">
                    <div className="text-gray-900">
                      Business Funding: {lead.bf_interest ? "Yes" : "No"}
                    </div>
                    <div className="text-gray-900">
                      Card Terminal: {lead.ct_interest ? "Yes" : "No"}
                    </div>
                    <div className="text-gray-900">
                      Booking App: {lead.ba_interest ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Created
                  </label>
                  <div className="text-gray-900">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Last Updated
                  </label>
                  <div className="text-gray-900">
                    {new Date(
                      lead.updated_at || lead.created_at || new Date(),
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                <div className="space-y-4">
                  {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border-b pb-3 last:border-0"
                      >
                        <p className="text-sm">{comment.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  )}
                </div>

                <div className="mt-4">
                  <form className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button type="submit" size="sm">
                      Add
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
