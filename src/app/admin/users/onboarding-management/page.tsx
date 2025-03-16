import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import OnboardingManagementClient from "./onboarding-management-client";

export const dynamic = "force-dynamic";

export default async function OnboardingManagementPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!userData?.is_admin) {
    return redirect("/dashboard");
  }

  // Fetch users with their onboarding status
  const { data: users = [] } = await supabase
    .from("users")
    .select(
      `
      id,
      email,
      full_name,
      created_at,
      user_settings:user_id(onboarding_completed, disable_onboarding)
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <OnboardingManagementClient users={users} />
    </main>
  );
}
