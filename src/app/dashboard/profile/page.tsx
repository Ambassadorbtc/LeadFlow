import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  console.log("Auth user ID:", user.id);
  console.log("Auth user email:", user.email);

  // Fetch user profile data
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  console.log("Profile query result:", profile, profileError);

  // Fetch user activity
  const { data: recentDeals = [] } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentContacts = [] } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <ProfileClient
        user={user}
        profile={profile || {}}
        recentDeals={recentDeals}
        recentContacts={recentContacts}
      />
    </main>
  );
}
