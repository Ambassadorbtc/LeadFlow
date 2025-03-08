"use client";

import Link from "next/link";
import { createClient } from "@/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Bell, Menu, Plus, Search, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./theme-switcher";
import { useState } from "react";
import Image from "next/image";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="w-full border-b border-[#e5e7eb] bg-white dark:bg-gray-900 dark:border-gray-800 py-2 sticky top-0 z-10 flex-shrink-0">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="hidden md:flex items-center mr-4">
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/images/leadflow-logo-with-icon.svg"
              alt="LeadFlow"
              width={120}
              height={30}
            />
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all data..."
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </form>
        </div>

        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden lg:flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/leads/add">New Lead</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/deals/add">New Deal</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/contacts/add">New Contact</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/companies/add">New Company</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
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
