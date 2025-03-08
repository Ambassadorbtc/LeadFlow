"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Home,
  LayoutDashboard,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Leads",
    href: "/dashboard/leads",
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    title: "Pipeline",
    href: "/dashboard/pipeline",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Contacts",
    href: "/dashboard/contacts",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Companies",
    href: "/dashboard/companies",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-auto min-h-screen w-20 lg:w-28 flex-col border-r border-[#e5e7eb] bg-white dark:bg-gray-900 dark:border-gray-800 flex-shrink-0">
      <div className="flex h-14 items-center border-b px-4 dark:border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold dark:text-white"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">CRM</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium",
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800",
                )}
              >
                {item.icon}
                <span className="text-[10px] lg:text-xs">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
