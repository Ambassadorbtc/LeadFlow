import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import Link from "next/link";
import AddDealClientForm from "./client-form";

export default async function AddDealPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Link
            href="/dashboard/deals"
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ← Back to Deals
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">Add New Deal</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <AddDealClientForm />
        </div>
      </div>
    </main>
  );
}
