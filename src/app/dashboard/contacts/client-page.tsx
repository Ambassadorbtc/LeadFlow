"use client";

import {
  Plus,
  Search,
  UserCircle,
  Filter,
  ArrowUpDown,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ContactsClientPage({
  contacts = [],
  searchParams = {},
}: {
  contacts: any[];
  searchParams: any;
}) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  // Get search params
  const initialSearch = urlSearchParams.get("name") || "";
  const initialCompany = urlSearchParams.get("company") || "";
  const initialSort = urlSearchParams.get("sort") || "name";
  const initialOrder = urlSearchParams.get("order") || "asc";

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [companyFilter, setCompanyFilter] = useState(initialCompany);
  const [sortField, setSortField] = useState(initialSort);
  const [sortOrder, setSortOrder] = useState(initialOrder);
  const [filteredContacts, setFilteredContacts] = useState(contacts);

  // Get unique companies for filter dropdown
  const companies = [
    ...new Set(contacts.map((contact) => contact.company).filter(Boolean)),
  ].sort();

  // Sort options
  const sortOptions = [
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Company", value: "company" },
    { label: "Position", value: "position" },
  ];

  // Apply filters and search
  useEffect(() => {
    // Filter contacts based on search term and company
    let result = [...contacts];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(search) ||
          contact.email?.toLowerCase().includes(search) ||
          contact.phone?.toLowerCase().includes(search),
      );
    }

    if (companyFilter) {
      result = result.filter((contact) => contact.company === companyFilter);
    }

    // Sort contacts
    result.sort((a, b) => {
      let aValue = a[sortField] || "";
      let bValue = b[sortField] || "";

      // Handle strings
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }

      // Compare based on sort order
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredContacts(result);
  }, [contacts, searchTerm, companyFilter, sortField, sortOrder]);

  // Update URL with search params
  const updateSearchParams = (params: Record<string, string>) => {
    const url = new URL(window.location.href);

    // Update or add each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });

    // Replace the current URL without reloading the page
    window.history.pushState({}, "", url.toString());
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSearchParams({ name: value });
  };

  // Handle company filter change
  const handleCompanyChange = (company: string) => {
    setCompanyFilter(company);
    updateSearchParams({ company });
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    // If clicking the same field, toggle order
    if (field === sortField) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      updateSearchParams({ order: newOrder });
    } else {
      // New field, set to asc by default
      setSortField(field);
      setSortOrder("asc");
      updateSearchParams({ sort: field, order: "asc" });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setCompanyFilter("");
    setSortField("name");
    setSortOrder("asc");
    updateSearchParams({ name: "", company: "", sort: "name", order: "asc" });
  };

  return (
    <div className="px-4 py-8 w-full">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Contacts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your contacts and leads
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/dashboard/contacts/import"
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Import Contacts</span>
          </Link>
          <Link
            href="/dashboard/contacts/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Contact</span>
          </Link>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 flex items-center w-full sm:w-auto sm:flex-1 min-w-0">
          <Search className="text-gray-400 h-5 w-5 ml-2 mr-1" />
          <input
            type="text"
            name="name"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search contacts..."
            className="w-full px-2 py-2 border-none focus:outline-none focus:ring-0 text-sm dark:bg-gray-800 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                updateSearchParams({ name: "" });
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          {companies.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white dark:bg-gray-800 shadow-sm border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm h-auto"
                >
                  <Filter className="h-4 w-4" />
                  <span>Company</span>
                  {companyFilter && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-2 py-0.5">
                      {companyFilter}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by Company</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => handleCompanyChange("")}
                    className="flex justify-between items-center"
                  >
                    All Companies
                    {!companyFilter && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  {companies.map((company) => (
                    <DropdownMenuItem
                      key={company}
                      onClick={() => handleCompanyChange(company)}
                      className="flex justify-between items-center"
                    >
                      {company}
                      {company === companyFilter && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white dark:bg-gray-800 shadow-sm border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm h-auto"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
                {sortField !== "name" && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-2 py-0.5">
                    {sortOptions.find((opt) => opt.value === sortField)?.label}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className="flex justify-between items-center"
                  >
                    {option.label}
                    {sortField === option.value && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {(searchTerm ||
            companyFilter ||
            sortField !== "name" ||
            sortOrder !== "asc") && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="bg-white dark:bg-gray-800 shadow-sm border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm h-auto"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter summary */}
      {(searchTerm ||
        companyFilter ||
        sortField !== "name" ||
        sortOrder !== "asc") && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg mb-6 flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Filtered results:</span>{" "}
            {filteredContacts.length} contacts
            {searchTerm && (
              <span className="ml-2">• Search: "{searchTerm}"</span>
            )}
            {companyFilter && (
              <span className="ml-2">• Company: {companyFilter}</span>
            )}
            {sortField !== "name" && (
              <span className="ml-2">
                • Sorted by:{" "}
                {sortOptions.find((opt) => opt.value === sortField)?.label} (
                {sortOrder === "asc" ? "ascending" : "descending"})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSortChange("name")}
              >
                <div className="flex items-center">
                  Name
                  {sortField === "name" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSortChange("email")}
              >
                <div className="flex items-center">
                  Email
                  {sortField === "email" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSortChange("phone")}
              >
                <div className="flex items-center">
                  Phone
                  {sortField === "phone" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSortChange("company")}
              >
                <div className="flex items-center">
                  Company
                  {sortField === "company" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSortChange("position")}
              >
                <div className="flex items-center">
                  Position
                  {sortField === "position" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredContacts && filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/dashboard/contacts/${contact.id}`)
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        <UserCircle className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {contact.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">
                      {contact.email || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">
                      {contact.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">
                      {contact.company || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">
                      {contact.position || "-"}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  {contacts.length > 0 ? (
                    <>
                      No contacts match your search criteria.{" "}
                      <button
                        onClick={clearFilters}
                        className="text-blue-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    </>
                  ) : (
                    <>
                      No contacts found. Add your first contact to get started.
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
