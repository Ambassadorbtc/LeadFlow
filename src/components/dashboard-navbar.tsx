"use client";

import Link from "next/link";
import { createClient } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Bell, Menu, Plus, UserCircle } from "lucide-react";
import SearchResultsDropdown from "./search-results-dropdown";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";
import { useTheme } from "next-themes";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <nav className="w-full border-b border-[#e5e7eb] bg-white dark:bg-gray-900 dark:border-gray-800 py-2 sticky top-0 z-10 flex-shrink-0">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="hidden lg:flex flex-1 max-w-md relative">
          <SearchResultsDropdown />
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <ThemeSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="dark:bg-gray-800 dark:border-gray-700"
            >
              <DropdownMenuItem
                className="dark:text-white dark:hover:bg-gray-700"
                onClick={() => router.push("/dashboard/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="dark:text-white dark:hover:bg-gray-700"
                onClick={() => router.push("/dashboard/settings")}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="dark:text-white dark:hover:bg-gray-700"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.refresh();
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
