"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { searchAction } from "@/app/actions/search-actions";
import { Button } from "./ui/button";

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // No router needed with server actions

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/search?q=${encodeURIComponent(searchQuery)}`;
      setIsOpen(false);
    }
  };

  return (
    <div className="relative md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Search className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 z-50">
          <form action={searchAction} className="flex">
            <input
              type="text"
              name="searchQuery"
              defaultValue={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-3 py-2 text-sm border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
