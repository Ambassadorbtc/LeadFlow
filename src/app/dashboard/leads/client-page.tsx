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
  Trash2,
} from "lucide-react";
import {
  ResizableHeader,
  ResizableTable,
} from "@/components/ui/resizable-table";
import Link from "next/link";
import LeadCommentCell from "@/components/dashboard/lead-comment-cell";
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

export default function LeadsClientPage({
  initialLeads = [],
}: {
  initialLeads: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { toast } = useToast();

  // Get search params
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialSort = searchParams.get("sort") || "created_at";
  const initialOrder = searchParams.get("order") || "desc";

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortField, setSortField] = useState(initialSort);
  const [sortOrder, setSortOrder] = useState(initialOrder);
  const [filteredLeads, setFilteredLeads] = useState(initialLeads);
  const [leads, setLeads] = useState(initialLeads);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Status options for filtering
  const statusOptions = [
    "All",
    "New",
    "Prospect",
    "Convert",
    "Contacted",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost",
  ];

  // Sort options
  const sortOptions = [
    { label: "Created Date", value: "created_at" },
    { label: "Business Name", value: "business_name" },
    { label: "Contact Name", value: "contact_name" },
    { label: "Status", value: "status" },
    { label: "Deal Value", value: "deal_value" },
  ];

  // Fetch leads with filters
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("leads").select("*");

      // Apply status filter if provided
      if (statusFilter && statusFilter !== "All") {
        query = query.eq("status", statusFilter);
      }

      // Apply search term if provided
      if (searchTerm) {
        query = query.or(
          `business_name.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%,prospect_id.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%`,
        );
      }

      // Apply sorting
      const currentSortField = sortField || "created_at";
      const currentSortOrder = sortOrder || "desc";
      query = query.order(currentSortField, {
        ascending: currentSortOrder === "asc",
      });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching leads:", error);
        return;
      }

      setLeads(data || []);
      setFilteredLeads(data || []);
    } catch (error) {
      console.error("Error in fetchLeads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL with search params
  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Update or add each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Create the new URL and navigate
    const url = `${window.location.pathname}?${newParams.toString()}`;
    router.push(url, { scroll: false });
  };

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debounce search parameter update
    const timer = setTimeout(() => {
      updateSearchParams({ search: value });
    }, 300);
    return () => clearTimeout(timer);
  };

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    const newStatus = status === "All" ? "" : status;
    setStatusFilter(newStatus);
    updateSearchParams({ status: newStatus });
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
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
    setStatusFilter("");
    setSortField("created_at");
    setSortOrder("desc");
    updateSearchParams({
      search: "",
      status: "",
      sort: "created_at",
      order: "desc",
    });
  };

  // Handle lead selection
  const handleSelectLead = (leadId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeads((prev) => [...prev, leadId]);
    } else {
      setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
    }
  };

  // Handle select all leads
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  // Delete selected leads
  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedLeads.length} lead${selectedLeads.length > 1 ? "s" : ""}?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Deleting leads:", selectedLeads);
      const response = await fetch("/api/leads/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadIds: selectedLeads }),
      });

      const result = await response.json();
      console.log("Delete response:", response.status, result);

      if (response.ok) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Deletion Successful</span>
            </div>
          ),
          description: `${result.deletedCount} lead${result.deletedCount > 1 ? "s" : ""} deleted successfully.`,
          variant: "success",
        });

        // Refresh leads
        setSelectedLeads([]);
        await fetchLeads();
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "There was an error deleting the leads.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting leads:", error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the leads.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export leads to CSV
  const handleExport = () => {
    const success = exportToCSV(leads, "leads-export.csv");
    if (success) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>Export Successful</span>
          </div>
        ),
        description: `${leads.length} leads exported successfully.`,
        variant: "success",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your leads.",
        variant: "destructive",
      });
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Fetch leads when filters change
  useEffect(() => {
    fetchLeads();
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, sortField, sortOrder]);

  return (
    <div className="px-2 py-4 w-full overflow-x-auto bg-[#f6f6f8] dark:bg-gray-900">
      {/* Header Section */}
      <header className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white">
              Leads
            </h1>
            <p className="text-[#6b7280] dark:text-gray-400 mt-2">
              Manage your prospects and leads
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {selectedLeads.length > 0 ? (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <Trash2 className="h-5 w-5" />
                <span>
                  {isDeleting
                    ? "Deleting..."
                    : `Delete (${selectedLeads.length})`}
                </span>
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="bg-white dark:bg-gray-800 border border-[#e5e7eb] dark:border-gray-700 text-[#4b5563] dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  <Download className="h-5 w-5" />
                  <span>Export</span>
                </Button>
                <a
                  href="/dashboard/leads/import"
                  className="bg-white dark:bg-gray-800 border border-[#e5e7eb] dark:border-gray-700 text-[#4b5563] dark:text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                  <span>Import Leads</span>
                </a>
                <Link
                  href="/dashboard/leads/add"
                  className="bg-[#4f46e5] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#4338ca] transition-colors shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Lead</span>
                </Link>
                <div className="text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                  {filteredLeads.length} lead
                  {filteredLeads.length !== 1 ? "s" : ""} in total
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 flex items-center w-full max-w-2xl">
          <Search className="text-gray-400 h-5 w-5 ml-2 mr-1" />
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search leads by name, business, or prospect ID..."
            className="w-full px-2 py-2 border-none focus:outline-none focus:ring-0 text-sm dark:bg-gray-800 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                updateSearchParams({ search: "" });
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white dark:bg-gray-800 shadow-sm border border-[#e5e7eb] dark:border-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 text-[#4b5563] dark:text-gray-300 text-sm h-auto"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {statusFilter && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                    {statusFilter}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="flex justify-between items-center"
                  >
                    {status}
                    {(status === "All" && !statusFilter) ||
                    status === statusFilter ? (
                      <Check className="h-4 w-4" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

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
            statusFilter ||
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
        statusFilter ||
        sortField !== "created_at" ||
        sortOrder !== "desc") && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg mb-4 flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Filtered results:</span>{" "}
            {filteredLeads.length} leads
            {searchTerm && (
              <span className="ml-2">• Search: "{searchTerm}"</span>
            )}
            {statusFilter && (
              <span className="ml-2">• Status: {statusFilter}</span>
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
          <p className="mt-2 text-gray-600">Loading leads...</p>
        </div>
      )}

      {/* Leads List */}
      {!isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-auto">
          <ResizableTable>
            <thead className="bg-[#f9fafb] dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={
                        selectedLeads.length > 0 &&
                        selectedLeads.length === filteredLeads.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </div>
                  <div className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500 hover:opacity-100 transition-opacity" />
                </th>
                <ResizableHeader
                  className="hidden md:table-cell cursor-pointer group"
                  onClick={() => handleSortChange("prospect_id")}
                >
                  Prospect ID
                  {sortField === "prospect_id" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </ResizableHeader>
                <ResizableHeader
                  className="cursor-pointer group"
                  onClick={() => handleSortChange("business_name")}
                >
                  Business
                  {sortField === "business_name" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </ResizableHeader>
                <ResizableHeader
                  className="cursor-pointer group"
                  onClick={() => handleSortChange("contact_name")}
                >
                  Contact
                  {sortField === "contact_name" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </ResizableHeader>
                <ResizableHeader
                  className="hidden lg:table-cell cursor-pointer group"
                  onClick={() => handleSortChange("contact_email")}
                >
                  Email
                  {sortField === "contact_email" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </ResizableHeader>
                <ResizableHeader className="hidden lg:table-cell">
                  Phone
                </ResizableHeader>
                <ResizableHeader
                  className="cursor-pointer group"
                  onClick={() => handleSortChange("status")}
                >
                  Status
                  {sortField === "status" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </ResizableHeader>
                <ResizableHeader
                  className="hidden md:table-cell cursor-pointer group"
                  onClick={() => handleSortChange("owner")}
                >
                  Owner
                  {sortField === "owner" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </ResizableHeader>
                <ResizableHeader
                  className="cursor-pointer group"
                  onClick={() => handleSortChange("deal_value")}
                >
                  Deal Value
                  {sortField === "deal_value" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </ResizableHeader>
                <ResizableHeader
                  className="hidden md:table-cell cursor-pointer group"
                  onClick={() => handleSortChange("created_at")}
                >
                  Created
                  {sortField === "created_at" && (
                    <ArrowUpDown className="h-3 w-3 ml-1 text-blue-600" />
                  )}
                </ResizableHeader>
                <ResizableHeader className="whitespace-nowrap sm:table-cell">
                  Comment
                </ResizableHeader>
                <th
                  scope="col"
                  className="px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider"
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-[#f3f4f6] dark:divide-gray-700">
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#f9fafb] dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-2 py-1 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) =>
                            handleSelectLead(lead.id, e.target.checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap hidden md:table-cell"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      <div className="text-xs font-medium text-[#111827] dark:text-white">
                        {lead.prospect_id}
                      </div>
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      <div className="flex items-center">
                        <Link
                          href={`/dashboard/companies?name=${encodeURIComponent(lead.business_name)}`}
                          className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-[#f3f4f6] dark:bg-gray-700 text-[#6b7280] dark:text-gray-400 hover:bg-[#e5e7eb] dark:hover:bg-gray-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Building2 className="h-3 w-3" />
                        </Link>
                        <div className="ml-1">
                          <div className="text-xs font-medium text-[#111827] dark:text-white">
                            {lead.business_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      <div className="flex items-center">
                        <Link
                          href={`/dashboard/contacts?name=${encodeURIComponent(lead.contact_name)}`}
                          className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-[#eef2ff] dark:bg-indigo-900/30 text-[#4f46e5] dark:text-indigo-300 hover:bg-[#e0e7ff] dark:hover:bg-indigo-900/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <UserCircle className="h-3 w-3" />
                        </Link>
                        <div className="ml-1">
                          <div className="text-xs font-medium text-[#111827] dark:text-white">
                            {lead.contact_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap hidden lg:table-cell"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      <div className="text-xs text-[#4b5563] dark:text-gray-400">
                        {lead.contact_email || "-"}
                      </div>
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap hidden lg:table-cell"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      <div className="text-xs text-[#4b5563] dark:text-gray-400">
                        {lead.phone || "-"}
                      </div>
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      {lead.status === "New" ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-[#dbeafe] dark:bg-blue-900/30 text-[#1e40af] dark:text-blue-300">
                          New
                        </span>
                      ) : lead.status === "Prospect" ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-[#f3e8ff] dark:bg-purple-900/30 text-[#6b21a8] dark:text-purple-300">
                          Prospect
                        </span>
                      ) : lead.status === "Convert" ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-[#dcfce7] dark:bg-green-900/30 text-[#166534] dark:text-green-300">
                          Convert
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-[#f3f4f6] dark:bg-gray-700 text-[#4b5563] dark:text-gray-300">
                          {typeof lead.status === "string"
                            ? lead.status
                            : "New"}
                        </span>
                      )}
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap hidden md:table-cell"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      {lead.owner ? (
                        <Link
                          href={`/dashboard/leads?owner=${encodeURIComponent(lead.owner)}`}
                          className="text-xs text-[#4f46e5] hover:underline inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.owner}
                        </Link>
                      ) : (
                        <div className="text-xs text-[#9ca3af] dark:text-gray-500">
                          -
                        </div>
                      )}
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      <div className="text-xs font-medium text-[#111827] dark:text-white">
                        {lead.deal_value
                          ? `${(isNaN(Number(lead.deal_value)) ? 0 : Number(lead.deal_value)).toLocaleString()}`
                          : "-"}
                      </div>
                      <div className="text-xs">
                        {lead.bf_interest && (
                          <span className="text-[#4f46e5] mr-1">BF</span>
                        )}
                        {lead.ct_interest && (
                          <span className="text-[#10b981] mr-1">CT</span>
                        )}
                        {lead.ba_interest && (
                          <span className="text-[#8b5cf6]">BA</span>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-2 py-1 whitespace-nowrap text-xs text-[#6b7280] hidden md:table-cell"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      {new Date(
                        lead.created_at || new Date(),
                      ).toLocaleDateString()}
                    </td>
                    <td
                      className="px-2 py-1 min-w-[250px] sm:table-cell"
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    >
                      <LeadCommentCell leadId={lead.id} />
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
                    colSpan={12}
                    className="px-6 py-10 text-center text-[#6b7280] dark:text-gray-400"
                  >
                    {leads.length > 0 ? (
                      <>
                        No leads match your search criteria.{" "}
                        <button
                          onClick={clearFilters}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Clear filters
                        </button>
                      </>
                    ) : (
                      <>
                        No leads found. Import or add your first lead to get
                        started.
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </ResizableTable>

          {/* Pagination Controls */}
          {filteredLeads.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {indexOfLastItem > filteredLeads.length
                      ? filteredLeads.length
                      : indexOfLastItem}
                  </span>{" "}
                  of <span className="font-medium">{filteredLeads.length}</span>{" "}
                  results
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <label
                    htmlFor="itemsPerPage"
                    className="mr-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Items per page:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 dark:border-gray-600 rounded-md text-sm py-1 px-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={400}>400</option>
                    <option value={600}>600</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`px-3 py-1 border ${currentPage === pageNum ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"} rounded-md text-sm`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-gray-500 dark:text-gray-400">
                          ...
                        </span>
                        <button
                          onClick={() => paginate(totalPages)}
                          className={`px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-sm`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
