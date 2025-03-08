"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Building2,
  User,
  FileText,
  Building,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function SearchResultsDropdown() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setResults(null);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`,
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data.results);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm)}`);
      setIsOpen(false);
    }
  };

  const handleItemClick = (type: string, id: string) => {
    setIsOpen(false);
    setSearchTerm("");
    router.push(`/dashboard/${type}/${id}`);
  };

  const hasResults =
    results &&
    (results.leads?.length > 0 ||
      results.contacts?.length > 0 ||
      results.deals?.length > 0 ||
      results.companies?.length > 0);

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            ref={inputRef}
            type="text"
            name="q"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search across all data..."
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
          )}
        </div>
      </form>

      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Loader2 className="h-5 w-5 mx-auto animate-spin mb-2" />
              <p>Searching...</p>
            </div>
          ) : hasResults ? (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.leads && results.leads.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Leads
                  </h3>
                  <div className="space-y-1">
                    {results.leads.slice(0, 3).map((lead: any) => (
                      <div
                        key={lead.id}
                        className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer flex items-center"
                        onClick={() => handleItemClick("leads", lead.id)}
                      >
                        <Building2 className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">
                            {lead.business_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lead.contact_name}
                          </p>
                        </div>
                      </div>
                    ))}
                    {results.leads.length > 3 && (
                      <p
                        className="text-xs text-blue-500 px-2 py-1 cursor-pointer hover:underline"
                        onClick={() => {
                          router.push(
                            `/dashboard/search?q=${encodeURIComponent(searchTerm)}`,
                          );
                          setIsOpen(false);
                        }}
                      >
                        View all {results.leads.length} leads
                      </p>
                    )}
                  </div>
                </div>
              )}

              {results.contacts && results.contacts.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Contacts
                  </h3>
                  <div className="space-y-1">
                    {results.contacts.slice(0, 3).map((contact: any) => (
                      <div
                        key={contact.id}
                        className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer flex items-center"
                        onClick={() => handleItemClick("contacts", contact.id)}
                      >
                        <User className="h-4 w-4 text-purple-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{contact.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {contact.company || contact.email || ""}
                          </p>
                        </div>
                      </div>
                    ))}
                    {results.contacts.length > 3 && (
                      <p
                        className="text-xs text-blue-500 px-2 py-1 cursor-pointer hover:underline"
                        onClick={() => {
                          router.push(
                            `/dashboard/search?q=${encodeURIComponent(searchTerm)}`,
                          );
                          setIsOpen(false);
                        }}
                      >
                        View all {results.contacts.length} contacts
                      </p>
                    )}
                  </div>
                </div>
              )}

              {results.deals && results.deals.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Deals
                  </h3>
                  <div className="space-y-1">
                    {results.deals.slice(0, 3).map((deal: any) => (
                      <div
                        key={deal.id}
                        className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer flex items-center"
                        onClick={() => handleItemClick("deals", deal.id)}
                      >
                        <FileText className="h-4 w-4 text-green-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{deal.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ${Number(deal.value).toLocaleString()} •{" "}
                            {deal.stage}
                          </p>
                        </div>
                      </div>
                    ))}
                    {results.deals.length > 3 && (
                      <p
                        className="text-xs text-blue-500 px-2 py-1 cursor-pointer hover:underline"
                        onClick={() => {
                          router.push(
                            `/dashboard/search?q=${encodeURIComponent(searchTerm)}`,
                          );
                          setIsOpen(false);
                        }}
                      >
                        View all {results.deals.length} deals
                      </p>
                    )}
                  </div>
                </div>
              )}

              {results.companies && results.companies.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2 py-1">
                    Companies
                  </h3>
                  <div className="space-y-1">
                    {results.companies.slice(0, 3).map((company: any) => (
                      <div
                        key={company.id}
                        className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer flex items-center"
                        onClick={() => handleItemClick("companies", company.id)}
                      >
                        <Building className="h-4 w-4 text-orange-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{company.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {company.industry || ""}
                          </p>
                        </div>
                      </div>
                    ))}
                    {results.companies.length > 3 && (
                      <p
                        className="text-xs text-blue-500 px-2 py-1 cursor-pointer hover:underline"
                        onClick={() => {
                          router.push(
                            `/dashboard/search?q=${encodeURIComponent(searchTerm)}`,
                          );
                          setIsOpen(false);
                        }}
                      >
                        View all {results.companies.length} companies
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                  onClick={handleSearch}
                >
                  View all search results
                </button>
              </div>
            </div>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
