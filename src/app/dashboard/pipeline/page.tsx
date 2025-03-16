import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/actions";
import PipelineClientPage from "./client-page";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: { stage?: string };
}) {
  console.log("Rendering pipeline page");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch deals with optional stage filter
  let query = supabase.from("deals").select("*").eq("user_id", user.id);

  // Apply stage filter if provided
  if (searchParams.stage) {
    query = query.eq("stage", searchParams.stage);
  }

  const { data: deals = [] } = await query.order("created_at", {
    ascending: false,
  });

  // Fetch leads to potentially convert to deals
  const { data: leads = [] } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 overflow-auto">
      <PipelineClientPage deals={deals} leads={leads} />
    </main>
  );
}
