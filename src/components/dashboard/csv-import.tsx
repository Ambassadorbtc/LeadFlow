"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

type CSVImportProps = {
  onImport: (data: any[]) => void;
  type: "deals" | "contacts" | "companies" | "leads";
  isLoading?: boolean;
  onFileSelect?: (file: File) => void;
};

export default function CSVImport({
  onImport,
  type,
  isLoading: initialLoading = false,
  onFileSelect,
}: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
    parseCSV(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    setSuccess(null);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }

      setFile(droppedFile);
      if (onFileSelect) {
        onFileSelect(droppedFile);
      }
      parseCSV(droppedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/);

        if (lines.length === 0 || lines[0].trim() === "") {
          setError("CSV file appears to be empty");
          return;
        }

        // Parse headers safely
        let headers: string[] = [];
        try {
          headers = parseCSVLine(lines[0]);
        } catch (headerError) {
          console.error("Error parsing CSV headers:", headerError);
          setError("Error parsing CSV headers. Please check the format.");
          return;
        }

        const data = [];
        // Only process up to 3 rows for preview
        for (let i = 1; i < Math.min(lines.length, 4); i++) {
          if (lines[i].trim() === "") continue;

          try {
            const values = parseCSVLine(lines[i]);

            // Handle mismatched column counts
            while (values.length < headers.length) values.push("");
            if (values.length > headers.length) values.length = headers.length;

            const entry: Record<string, string> = {};
            headers.forEach((header, index) => {
              entry[header] = values[index] || "";
            });

            data.push(entry);
          } catch (rowError) {
            console.error(`Error parsing CSV row ${i}:`, rowError);
            // Continue with next row instead of failing the entire preview
          }
        }

        setPreview(data); // Show preview rows
      } catch (error) {
        console.error("Error parsing CSV:", error);
        setError("Error parsing CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  // Helper function to parse a CSV line, handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        // Handle escaped quotes (double quotes inside quoted fields)
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current.trim());
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData for direct API upload
      const formData = new FormData();
      formData.append("csvFile", file);

      // Send to API endpoint
      const response = await fetch(`/api/${type}/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const recordCount = result.leads?.length || 0;
        setSuccess(`Successfully imported ${recordCount} ${type}`);
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Import Successful</span>
            </div>
          ),
          description: `${recordCount} records imported successfully.`,
          variant: "success",
        });

        // Process the data for the parent component
        if (result.leads) {
          onImport(result.leads);
        }

        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/dashboard/${type}`);
          router.refresh();
        }, 2000);
      } else {
        setError(result.error || `There was an error importing the ${type}.`);
        toast({
          title: "Import Failed",
          description:
            result.error || `There was an error importing the ${type}.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`Error importing ${type}:`, error);
      setError(error.message || `Error importing ${type}`);
      toast({
        title: "Import Failed",
        description:
          error.message || `There was an error importing the ${type}.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Upload CSV File</Label>
          <div
            className={`mt-2 flex flex-col items-center justify-center w-full h-32 border-2 ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-dashed border-gray-300 dark:border-gray-600"} rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
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
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
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
