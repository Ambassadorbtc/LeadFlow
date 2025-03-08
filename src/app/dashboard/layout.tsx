import { Metadata } from "next";
import { Providers } from "../providers";

export const metadata: Metadata = {
  title: "Dashboard - LeadFlow CRM",
  description: "Manage your sales pipeline and customer relationships",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
