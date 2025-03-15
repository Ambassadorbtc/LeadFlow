import { Metadata } from "next";
import { Providers } from "../providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { NotFoundBoundary } from "@/components/not-found-boundary";

export const metadata: Metadata = {
  title: "Dashboard - LeadFlow CRM",
  description: "Manage your sales pipeline and customer relationships",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ErrorBoundary>
        <NotFoundBoundary>{children}</NotFoundBoundary>
      </ErrorBoundary>
    </Providers>
  );
}
