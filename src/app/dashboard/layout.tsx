import { Metadata } from "next";
import { Providers } from "../providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { NotFoundBoundary } from "@/components/not-found-boundary";
import { redirect } from "next/navigation";
import { createClient } from "@/app/actions";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardNavbar from "@/components/dashboard-navbar";
import UserOnboarding from "@/components/dashboard/user-onboarding";
import MobileNavigation from "@/components/dashboard/mobile-responsive";

export const metadata: Metadata = {
  title: "Dashboard - LeadFlow CRM",
  description: "Manage your sales pipeline and customer relationships",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <Providers>
      <ErrorBoundary>
        <NotFoundBoundary>
          <div className="flex min-h-screen flex-col">
            <DashboardNavbar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {children}
              </main>
            </div>
          </div>
          <MobileNavigation />
          <UserOnboarding />
        </NotFoundBoundary>
      </ErrorBoundary>
    </Providers>
  );
}
