import { createClient } from "@/app/actions";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminNavbar from "@/components/admin/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Fetch the specific user
  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !userData) {
    console.error("Error fetching user:", error);
    return redirect("/admin/users");
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </h3>
                  <p className="text-lg font-semibold">{userData.full_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </h3>
                  <p className="text-lg">{userData.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </h3>
                  <Badge
                    variant={userData.is_active ? "success" : "destructive"}
                  >
                    {userData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Created At
                  </h3>
                  <p>{new Date(userData.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Last Sign In
                  </h3>
                  <p>
                    {userData.last_sign_in_at
                      ? new Date(userData.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
                {userData.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Phone
                    </h3>
                    <p>{userData.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {userData.user_metadata && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>User Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                  {JSON.stringify(userData.user_metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {userData.app_metadata && (
            <Card>
              <CardHeader>
                <CardTitle>App Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                  {JSON.stringify(userData.app_metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
