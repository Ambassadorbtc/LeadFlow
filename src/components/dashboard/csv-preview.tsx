"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CSVPreviewProps {
  onFileSelect: (file: File) => void;
  onCancel: () => void;
  requiredHeaders?: string[];
  entityType: "leads" | "contacts" | "deals";
}

export default function CSVPreview({
  onFileSelect,
  onCancel,
  requiredHeaders = [],
  entityType,
}: CSVPreviewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{
    headers: string[];
    rows: string[][];
  }>({ headers: [], rows: [] });
  const [error, setError] = useState<string | null>(null);
  const [headerMap, setHeaderMap] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"upload" | "map" | "preview">("upload");

  // Common field suggestions based on entity type
  const getFieldSuggestions = () => {
    const common = ["email", "phone", "notes", "status"];

    switch (entityType) {
      case "leads":
        return [
          ...common,
          "business_name",
          "contact_name",
          "source",
          "bf_interest",
          "ct_interest",
          "ba_interest",
          "deal_value",
        ];
      case "contacts":
        return [
          ...common,
          "first_name",
          "last_name",
          "job_title",
          "company",
          "address",
          "city",
          "state",
          "zip",
          "country",
        ];
      case "deals":
        return [
          ...common,
          "deal_name",
          "deal_value",
          "stage",
          "closing_date",
          "contact_id",
          "company_id",
          "probability",
        ];
      default:
        return common;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = async (csvFile: File) => {
    try {
      setError(null);
      const text = await csvFile.text();
      const rows = text
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()));

      if (rows.length < 2) {
        setError(
          "CSV file must contain at least a header row and one data row",
        );
        return;
      }

      const headers = rows[0];
      const dataRows = rows
        .slice(1)
        .filter(
          (row) => row.length === headers.length && row.some((cell) => cell),
        );

      if (dataRows.length === 0) {
        setError("No valid data rows found in CSV");
        return;
      }

      // Initialize header mapping
      const initialHeaderMap: Record<string, string> = {};
      headers.forEach((header) => {
        // Try to find a match in required headers (case insensitive)
        const matchedRequiredHeader = requiredHeaders.find(
          (req) => req.toLowerCase() === header.toLowerCase(),
        );

        if (matchedRequiredHeader) {
          initialHeaderMap[header] = matchedRequiredHeader;
        } else {
          initialHeaderMap[header] = "";
        }
      });

      setHeaderMap(initialHeaderMap);
      setPreview({ headers, rows: dataRows.slice(0, 5) }); // Preview first 5 rows
      setStep("map");
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setError("Failed to parse CSV file. Please check the file format.");
    }
  };

  const handleHeaderMapChange = (
    originalHeader: string,
    mappedHeader: string,
  ) => {
    setHeaderMap((prev) => ({
      ...prev,
      [originalHeader]: mappedHeader,
    }));
  };

  const handleContinue = () => {
    // Check if all required headers are mapped
    const mappedHeaders = Object.values(headerMap);
    const missingRequiredHeaders = requiredHeaders.filter(
      (header) => !mappedHeaders.includes(header),
    );

    if (missingRequiredHeaders.length > 0) {
      setError(
        `Missing required headers: ${missingRequiredHeaders.join(", ")}`,
      );
      return;
    }

    if (step === "map") {
      setStep("preview");
    } else if (step === "preview" && file) {
      onFileSelect(file);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview({ headers: [], rows: [] });
    setError(null);
    setHeaderMap({});
    setStep("upload");
    onCancel();
  };

  const renderUploadStep = () => (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <FileText className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Drag and drop your CSV file here, or click to browse
      </p>
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="max-w-xs"
      />
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderMapStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Map CSV Headers</h3>
      <p className="text-sm text-gray-500">
        Match your CSV headers to our system fields. Required fields are marked
        with *.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preview.headers.map((header, index) => (
          <div key={index} className="space-y-2">
            <Label>
              CSV Header: <span className="font-medium">{header}</span>
            </Label>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={headerMap[header] || ""}
                onChange={(e) => handleHeaderMapChange(header, e.target.value)}
              >
                <option value="">-- Skip this column --</option>
                {getFieldSuggestions().map((field) => (
                  <option
                    key={field}
                    value={field}
                    disabled={
                      Object.values(headerMap).includes(field) &&
                      headerMap[header] !== field
                    }
                  >
                    {field}
                    {requiredHeaders.includes(field) ? " *" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleCancel}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button onClick={handleContinue}>
          Continue <Upload className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Preview Import Data</h3>
      <p className="text-sm text-gray-500">
        Review the data before importing. Only mapped fields will be imported.
      </p>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {preview.headers.map((header, index) => (
                <TableHead key={index}>
                  {headerMap[header] ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{headerMap[header]}</span>
                      <span className="text-xs text-gray-500">
                        (from: {header})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 line-through">
                      {header} (skipped)
                    </span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className={
                      !headerMap[preview.headers[cellIndex]]
                        ? "text-gray-400"
                        : ""
                    }
                  >
                    {cell || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setStep("map")}>
          Back to Mapping
        </Button>
        <Button onClick={handleContinue}>
          Import Data <Upload className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {step === "upload" && renderUploadStep()}
      {step === "map" && renderMapStep()}
      {step === "preview" && renderPreviewStep()}
    </div>
  );
}
