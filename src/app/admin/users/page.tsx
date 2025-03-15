import { createClient } from "@/app/actions";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminNavbar from "@/components/admin/navbar";
import UsersClient from "./users-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/admin-login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.email !== "admin@leadflowapp.online") {
    console.log("Not admin, redirecting to dashboard");
    return redirect("/dashboard");
  }

  // Fetch all users from the public.users table only
  const { data: users = [], error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Error fetching users:", error);
  }

  // Map users to the expected format
  const mergedUsers = users.map((user) => {
    return {
      ...user,
    };
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto">
          <UsersClient users={mergedUsers} />
        </main>
      </div>
    </div>
  );
}
