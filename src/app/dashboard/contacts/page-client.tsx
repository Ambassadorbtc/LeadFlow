"use client";

import {
  Building2,
  Plus,
  Search,
  UserCircle,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  X,
  Check,
  CheckCircle,
  Download,
} from "lucide-react";
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
import { createClient } from "@/supabase/client";
import { exportToCSV } from "@/utils/export-utils";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function ContactsPageClient({ contacts = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toast } = useToast();

  // Get search params
  const initialSearch = searchParams.get("name") || "";
  const initialCompany = searchParams.get("company") || "";
  const initialSort = searchParams.get("sort") || "created_at";
  const initialOrder = searchParams.get("order") || "desc";

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [companyFilter, setCompanyFilter] = useState(initialCompany);
  const [sortField, setSortField] = useState(initialSort);
  const [sortOrder, setSortOrder] = useState(initialOrder);
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState([]);

  // Sort options
  const sortOptions = [
    { label: "Created Date", value: "created_at" },
    { label: "Name", value: "name" },
    { label: "Email", value: "email" },
    { label: "Company", value: "company" },
    { label: "Position", value: "position" },
  ];

  // Update filtered contacts when filters change
  useEffect(() => {
    setIsLoading(true);
    let filtered = [...contacts];

    // Apply company filter
    if (companyFilter) {
      filtered = filtered.filter(
        (contact) =>
          contact.company &&
          contact.company.toLowerCase() === companyFilter.toLowerCase(),
      );
    }

    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          (contact.name && contact.name.toLowerCase().includes(search)) ||
          (contact.email && contact.email.toLowerCase().includes(search)) ||
          (contact.company && contact.company.toLowerCase().includes(search)) ||
          (contact.position && contact.position.toLowerCase().includes(search)),
      );
    }

    // Sort contacts
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (!aValue) aValue = "";
      if (!bValue) bValue = "";

      const comparison =
        typeof aValue === "string"
          ? aValue.localeCompare(bValue)
          : aValue - bValue;

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredContacts(filtered);
    setIsLoading(false);

    // Extract unique companies for filter
    const uniqueCompanies = [
      ...new Set(
        contacts
          .map((contact) => contact.company)
          .filter((company) => company && company.trim() !== ""),
      ),
    ];
    setCompanies(uniqueCompanies.sort());
  }, [contacts, searchTerm, companyFilter, sortField, sortOrder]);

  // Update URL with search params
  const updateSearchParams = (params) => {
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
    router.refresh();
  };

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSearchParams({ name: value });
  };

  // Handle company filter change
  const handleCompanyChange = (company) => {
    setCompanyFilter(company);
    updateSearchParams({ company });
  };

  // Handle sort change
  const handleSortChange = (field) => {
    // If clicking the same field, toggle order
    if (field === sortField) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      updateSearchParams({ order: newOrder });
    } else {
      // New field, set to desc by default
      setSortField(field);
      setSortOrder("desc");
      updateSearchParams({ sort: field, order: "desc" });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setCompanyFilter("");
    setSortField("created_at");
    setSortOrder("desc");
    updateSearchParams({
      name: "",
      company: "",
      sort: "created_at",
      order: "desc",
    });
  };

  // Export contacts to CSV
  const handleExport = () => {
    const success = exportToCSV(contacts, "contacts-export.csv");
    if (success) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>Export Successful</span>
          </div>
        ),
        description: `${contacts.length} contacts exported successfully.`,
        variant: "success",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your contacts.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-2 py-4 w-full bg-[#f6f6f8] dark:bg-gray-900">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white">
            Contacts
          </h1>
          <div className="flex items-center mt-2">
            <p className="text-[#6b7280] dark:text-gray-400 mr-4">
              Manage your contacts and relationships
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 flex items-center w-full max-w-md">
          <Search className="text-gray-400 h-5 w-5 ml-2 mr-1" />
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search contacts by name, email, or company..."
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
          <Button
            onClick={handleExport}
            variant="outline"
            className="bg-white dark:bg-gray-800 border border-[#e5e7eb] dark:border-gray-700 text-[#4b5563] dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Download className="h-5 w-5" />
            <span>Export</span>
          </Button>
          <Link
            href="/dashboard/contacts/import"
            className="bg-white dark:bg-gray-800 border border-[#e5e7eb] dark:border-gray-700 text-[#4b5563] dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Import Contacts</span>
          </Link>
          <Link
            href="/dashboard/contacts/add"
            className="bg-[#4f46e5] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#4338ca] transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Add Contact</span>
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          {companies.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white dark:bg-gray-800 shadow-sm border border-[#e5e7eb] dark:border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-[#4b5563] dark:text-gray-300 text-sm h-auto"
                >
                  <Filter className="h-4 w-4" />
                  <span>Company</span>
                  {companyFilter && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
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
                className="bg-white dark:bg-gray-800 shadow-sm border border-[#e5e7eb] dark:border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-[#4b5563] dark:text-gray-300 text-sm h-auto"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
                {sortField !== "created_at" && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
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
            sortField !== "created_at" ||
            sortOrder !== "desc") && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="bg-white dark:bg-gray-800 shadow-sm border border-[#e5e7eb] dark:border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-[#4b5563] dark:text-gray-300 text-sm h-auto"
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
        sortField !== "created_at" ||
        sortOrder !== "desc") && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg mb-4 flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Filtered results:</span>{" "}
            {filteredContacts.length} contacts
            {searchTerm && (
              <span className="ml-2">• Search: "{searchTerm}"</span>
            )}
            {companyFilter && (
              <span className="ml-2">• Company: {companyFilter}</span>
            )}
            {sortField !== "created_at" && (
              <span className="ml-2">
                • Sorted by:{" "}
                {sortOptions.find((opt) => opt.value === sortField)?.label} (
                {sortOrder === "asc" ? "ascending" : "descending"})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading contacts...</p>
        </div>
      )}

      {/* Contacts List */}
      {!isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-auto">
          <div>
            <table className="w-full divide-y divide-[#f3f4f6] text-sm">
              <thead className="bg-[#f9fafb] dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
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
                    className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
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
                    className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider cursor-pointer group"
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
                    className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider cursor-pointer group hidden md:table-cell"
                    onClick={() => handleSortChange("position")}
                  >
                    <div className="flex items-center">
                      Position
                      {sortField === "position" && (
                        <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider hidden md:table-cell cursor-pointer group"
                    onClick={() => handleSortChange("created_at")}
                  >
                    <div className="flex items-center">
                      Created
                      {sortField === "created_at" && (
                        <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider"
                  >
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-[#f3f4f6] dark:divide-gray-700">
                {filteredContacts && filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-[#f9fafb] dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/dashboard/contacts/${contact.id}`)
                      }
                    >
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-[#eef2ff] dark:bg-indigo-900/30 text-[#4f46e5] dark:text-indigo-300">
                            <UserCircle className="h-3 w-3" />
                          </div>
                          <div className="ml-1">
                            <div className="text-xs font-medium text-[#111827] dark:text-white">
                              {contact.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        <div className="text-xs text-[#4b5563] dark:text-gray-400">
                          {contact.email || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-xs text-[#4b5563] dark:text-gray-400">
                          {contact.phone || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        {contact.company ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full bg-[#f3f4f6] dark:bg-gray-700 text-[#6b7280] dark:text-gray-400">
                              <Building2 className="h-3 w-3" />
                            </div>
                            <div className="ml-1 text-xs text-[#4b5563] dark:text-gray-400">
                              {contact.company}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-[#9ca3af] dark:text-gray-500">
                            -
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap hidden md:table-cell">
                        <div className="text-xs text-[#4b5563] dark:text-gray-400">
                          {contact.position || "-"}
                        </div>
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs text-[#6b7280] hidden md:table-cell">
                        {new Date(
                          contact.created_at || new Date(),
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-right">
                        <button
                          className="text-[#6b7280] hover:text-[#111827]"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add action menu functionality here
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-[#6b7280] dark:text-gray-400"
                    >
                      {contacts.length > 0 ? (
                        <>
                          No contacts match your search criteria.{" "}
                          <button
                            onClick={clearFilters}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Clear filters
                          </button>
                        </>
                      ) : (
                        <>
                          No contacts found. Import or add your first contact to
                          get started.
                        </>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
