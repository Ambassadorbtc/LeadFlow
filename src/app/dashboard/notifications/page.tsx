import { createClient } from "@/app/actions";
import { redirect } from "next/navigation";
import NotificationsClient from "./notifications-client";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch notifications from the database
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-auto">
      <NotificationsClient user={user} notifications={notifications || []} />
    </div>
  );
}
