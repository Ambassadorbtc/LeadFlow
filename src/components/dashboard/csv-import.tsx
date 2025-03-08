"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

type CSVImportProps = {
  onImport: (data: any[]) => void;
  type: "deals" | "contacts" | "companies" | "leads";
  isLoading?: boolean;
};

export default function CSVImport({
  onImport,
  type,
  isLoading: initialLoading = false,
}: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      return;
    }

    // Check file type
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((header) => header.trim());

        const data = [];
        for (let i = 1; i < Math.min(lines.length, 4); i++) {
          if (lines[i].trim() === "") continue;

          const values = lines[i].split(",").map((value) => value.trim());
          const entry: Record<string, string> = {};

          headers.forEach((header, index) => {
            entry[header] = values[index] || "";
          });

          data.push(entry);
        }

        setPreview(data); // Show first 3 rows as preview
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setError("Error parsing CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n");
          const headers = lines[0].split(",").map((header) => header.trim());

          const data = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === "") continue;

            const values = lines[i].split(",").map((value) => value.trim());
            const entry: Record<string, string> = {};

            headers.forEach((header, index) => {
              entry[header] = values[index] || "";
            });

            data.push(entry);
          }

          // Get current user
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            throw new Error("User not authenticated");
          }

          // Check for duplicates before importing
          let skippedCount = 0;
          const uniqueRecords = [];

          for (const record of data) {
            let isDuplicate = false;

            // Check for duplicates based on type
            if (type === "leads" && record.prospect_id) {
              const { data: existingLeads } = await supabase
                .from("leads")
                .select("id")
                .eq("prospect_id", record.prospect_id)
                .eq("user_id", user.id);

              if (existingLeads && existingLeads.length > 0) {
                isDuplicate = true;
                skippedCount++;
              }
            } else if (type === "contacts" && record.email) {
              const { data: existingContacts } = await supabase
                .from("contacts")
                .select("id")
                .eq("email", record.email)
                .eq("user_id", user.id);

              if (existingContacts && existingContacts.length > 0) {
                isDuplicate = true;
                skippedCount++;
              }
            } else if (type === "deals" && record.prospect_id) {
              const { data: existingDeals } = await supabase
                .from("deals")
                .select("id")
                .eq("prospect_id", record.prospect_id)
                .eq("name", record.name)
                .eq("user_id", user.id);

              if (existingDeals && existingDeals.length > 0) {
                isDuplicate = true;
                skippedCount++;
              }
            } else if (type === "companies" && record.name) {
              const { data: existingCompanies } = await supabase
                .from("companies")
                .select("id")
                .eq("name", record.name)
                .eq("user_id", user.id);

              if (existingCompanies && existingCompanies.length > 0) {
                isDuplicate = true;
                skippedCount++;
              }
            }

            if (!isDuplicate) {
              uniqueRecords.push(record);
            }
          }

          // Process the unique records
          if (uniqueRecords.length > 0) {
            // Add user_id to each record
            const recordsWithUserId = uniqueRecords.map((record) => ({
              ...record,
              user_id: user.id,
            }));

            // Import the data
            onImport(recordsWithUserId);
          }

          // Success message with information about skipped records
          const successMessage =
            skippedCount > 0
              ? `Successfully imported ${uniqueRecords.length} ${type}. Skipped ${skippedCount} duplicate records.`
              : `Successfully imported ${uniqueRecords.length} ${type}.`;

          setSuccess(successMessage);

          // Show toast notification
          toast({
            title: (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Import Successful</span>
              </div>
            ),
            description: `${uniqueRecords.length} records imported successfully.`,
            variant: "success",
          });

          // Redirect after a short delay
          setTimeout(() => {
            router.push(`/dashboard/${type}`);
            router.refresh();
          }, 2000);
        } catch (error: any) {
          console.error("Error processing CSV:", error);
          setError(error.message || "Error processing CSV file");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      console.error("Error reading file:", error);
      setError(error.message || "Error reading file");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Upload CSV File</Label>
          <div className="mt-2 flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CSV file with {type} data
                </p>
              </div>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Selected file: {file.name}
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {preview.length > 0 && (
          <div>
            <Label>Preview (First 3 rows)</Label>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {Object.keys(preview[0]).map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {preview.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                        >
                          {value as string}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!file || isLoading}>
          {isLoading ? "Importing..." : `Import ${type}`}
        </Button>
      </div>
    </form>
  );
}
