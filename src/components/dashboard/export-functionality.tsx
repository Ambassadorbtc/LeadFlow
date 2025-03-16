"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { createClient } from "@/supabase/client";

interface ExportFunctionalityProps {
  entityType: "leads" | "contacts" | "deals" | "companies";
  selectedIds?: string[];
  onExportComplete?: () => void;
}

export default function ExportFunctionality({
  entityType,
  selectedIds = [],
  onExportComplete,
}: ExportFunctionalityProps) {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exportScope, setExportScope] = useState<"all" | "selected">(
    selectedIds.length > 0 ? "selected" : "all",
  );
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    {
      // Common fields
      id: true,
      created_at: true,
      updated_at: true,

      // Entity-specific default fields
      ...(entityType === "leads" && {
        business_name: true,
        contact_name: true,
        email: true,
        phone: true,
        status: true,
        source: true,
        notes: true,
        deal_value: true,
        bf_interest: true,
        ct_interest: true,
        ba_interest: true,
      }),
      ...(entityType === "contacts" && {
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        job_title: true,
        company: true,
        address: true,
      }),
      ...(entityType === "deals" && {
        deal_name: true,
        deal_value: true,
        stage: true,
        closing_date: true,
        contact_name: true,
        company_name: true,
        probability: true,
      }),
      ...(entityType === "companies" && {
        company_name: true,
        industry: true,
        website: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        country: true,
        annual_revenue: true,
        employee_count: true,
      }),
    },
  );

  const getEntityFields = () => {
    switch (entityType) {
      case "leads":
        return [
          { id: "business_name", label: "Business Name" },
          { id: "contact_name", label: "Contact Name" },
          { id: "email", label: "Email" },
          { id: "phone", label: "Phone" },
          { id: "status", label: "Status" },
          { id: "source", label: "Source" },
          { id: "notes", label: "Notes" },
          { id: "deal_value", label: "Deal Value" },
          { id: "bf_interest", label: "Business Financing Interest" },
          { id: "ct_interest", label: "Credit Training Interest" },
          { id: "ba_interest", label: "Business Automation Interest" },
          { id: "created_at", label: "Created Date" },
          { id: "updated_at", label: "Updated Date" },
        ];
      case "contacts":
        return [
          { id: "first_name", label: "First Name" },
          { id: "last_name", label: "Last Name" },
          { id: "email", label: "Email" },
          { id: "phone", label: "Phone" },
          { id: "job_title", label: "Job Title" },
          { id: "company", label: "Company" },
          { id: "address", label: "Address" },
          { id: "city", label: "City" },
          { id: "state", label: "State" },
          { id: "zip", label: "ZIP Code" },
          { id: "country", label: "Country" },
          { id: "notes", label: "Notes" },
          { id: "created_at", label: "Created Date" },
          { id: "updated_at", label: "Updated Date" },
        ];
      case "deals":
        return [
          { id: "deal_name", label: "Deal Name" },
          { id: "deal_value", label: "Deal Value" },
          { id: "stage", label: "Stage" },
          { id: "closing_date", label: "Closing Date" },
          { id: "contact_name", label: "Contact Name" },
          { id: "company_name", label: "Company Name" },
          { id: "probability", label: "Probability" },
          { id: "notes", label: "Notes" },
          { id: "created_at", label: "Created Date" },
          { id: "updated_at", label: "Updated Date" },
        ];
      case "companies":
        return [
          { id: "company_name", label: "Company Name" },
          { id: "industry", label: "Industry" },
          { id: "website", label: "Website" },
          { id: "address", label: "Address" },
          { id: "city", label: "City" },
          { id: "state", label: "State" },
          { id: "zip", label: "ZIP Code" },
          { id: "country", label: "Country" },
          { id: "annual_revenue", label: "Annual Revenue" },
          { id: "employee_count", label: "Employee Count" },
          { id: "notes", label: "Notes" },
          { id: "created_at", label: "Created Date" },
          { id: "updated_at", label: "Updated Date" },
        ];
      default:
        return [];
    }
  };

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldId]: checked,
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    const fields = getEntityFields().reduce(
      (acc, field) => {
        acc[field.id] = checked;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    setSelectedFields(fields);
  };

  const exportData = async () => {
    try {
      const supabase = createClient();

      // Build query
      let query = supabase.from(entityType);

      // Select only the fields that are checked
      const fields = Object.entries(selectedFields)
        .filter(([_, isSelected]) => isSelected)
        .map(([field]) => field)
        .join(", ");

      query = query.select(fields);

      // Filter by selected IDs if in "selected" mode
      if (exportScope === "selected" && selectedIds.length > 0) {
        query = query.in("id", selectedIds);
      }

      // Execute query
      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) {
        alert("No data to export");
        return;
      }

      // Format and download the data
      let content: string;
      let fileName: string;
      let mimeType: string;

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      if (exportFormat === "csv") {
        // Convert to CSV
        const headers = Object.entries(selectedFields)
          .filter(([_, isSelected]) => isSelected)
          .map(([field]) => field)
          .join(",");

        const rows = data
          .map((row) => {
            return Object.entries(selectedFields)
              .filter(([_, isSelected]) => isSelected)
              .map(([field]) => {
                // Handle special cases like booleans, objects, etc.
                const value = row[field];
                if (value === null || value === undefined) return "";
                if (typeof value === "boolean") return value ? "true" : "false";
                if (typeof value === "object") return JSON.stringify(value);
                // Escape commas and quotes in strings
                if (typeof value === "string") {
                  if (value.includes(",") || value.includes('"')) {
                    return `"${value.replace(/"/g, '""')}"`;
                  }
                  return value;
                }
                return String(value);
              })
              .join(",");
          })
          .join("\n");

        content = `${headers}\n${rows}`;
        fileName = `${entityType}_export_${timestamp}.csv`;
        mimeType = "text/csv";
      } else {
        // JSON format
        content = JSON.stringify(data, null, 2);
        fileName = `${entityType}_export_${timestamp}.json`;
        mimeType = "application/json";
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Close dialog and notify parent
      setOpen(false);
      if (onExportComplete) onExportComplete();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Export {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Choose your export options and select the fields to include.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="fields" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Select Fields to Export
              </Label>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-4">
              {getEntityFields().map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={selectedFields[field.id] || false}
                    onCheckedChange={(checked) =>
                      handleFieldToggle(field.id, checked === true)
                    }
                  />
                  <Label htmlFor={`field-${field.id}`} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Export Format</Label>
                <RadioGroup
                  value={exportFormat}
                  onValueChange={(value) =>
                    setExportFormat(value as "csv" | "json")
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="format-csv" />
                    <Label htmlFor="format-csv" className="flex items-center">
                      <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="format-json" />
                    <Label htmlFor="format-json" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" /> JSON
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {selectedIds.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Export Scope</Label>
                  <RadioGroup
                    value={exportScope}
                    onValueChange={(value) =>
                      setExportScope(value as "all" | "selected")
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="scope-all" />
                      <Label htmlFor="scope-all">All Records</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="selected" id="scope-selected" />
                      <Label htmlFor="scope-selected">
                        Selected Records ({selectedIds.length})
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={exportData}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
