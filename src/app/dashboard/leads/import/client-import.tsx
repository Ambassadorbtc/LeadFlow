"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import CSVImport from "@/components/dashboard/csv-import";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  Download,
  History,
  RotateCcw,
  Clock,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { mapCSVToLeads } from "./csv-parser";
import { CSV_TEMPLATE_HEADERS } from "./csv-template";
import { Tables } from "@/types/supabase";

type ImportHistory = Tables<"import_history"> & {
  can_revert?: boolean;
};

export default function LeadsImportClient() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    count: number;
    importId?: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [isReverting, setIsReverting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("import_history")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("import_type", "leads")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Mark the most recent import as revertible
      const historyWithRevertFlag =
        data?.map((item, index) => ({
          ...item,
          can_revert: index === 0 && item.status === "completed",
        })) || [];

      setImportHistory(historyWithRevertFlag);
    } catch (error) {
      console.error("Error fetching import history:", error);
    }
  };

  const handleImport = async (data: any[]) => {
    if (data.length === 0 && !selectedFile) {
      setError("No data to import");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // If we have data from the CSVImport component, use it
      if (data.length > 0) {
        const { data: userData, error: authError } =
          await supabase.auth.getUser();

        if (authError) {
          console.error("Authentication error:", authError);
          throw new Error("Authentication failed. Please sign in again.");
        }

        if (!userData?.user) {
          // Try to refresh the session before giving up
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession();

          if (refreshError || !refreshData?.user) {
            console.error("Session refresh failed:", refreshError);
            // Redirect to sign-in page
            router.push(
              "/sign-in?error=Your session has expired. Please sign in again.",
            );
            return;
          }

          // Use the refreshed user data
          userData.user = refreshData.user;
        }

        // Create an import history record first
        const { data: importRecord, error: importHistoryError } = await supabase
          .from("import_history")
          .insert({
            user_id: userData.user.id,
            import_type: "leads",
            file_name: selectedFile?.name || "CSV Import",
            record_count: data.length,
            status: "processing",
            metadata: { source: "csv_upload" },
          })
          .select()
          .single();

        if (importHistoryError) {
          console.error("Error creating import history:", importHistoryError);
          throw importHistoryError;
        }

        // Process and validate the data using the mapper function
        const processedData = mapCSVToLeads(data, userData.user.id);

        // Add import batch ID to each lead and ensure all required fields are set
        processedData.forEach((lead) => {
          // Set default values for interest fields if undefined
          lead.ba_interest =
            lead.ba_interest === undefined ? false : lead.ba_interest;
          lead.bf_interest =
            lead.bf_interest === undefined ? false : lead.bf_interest;
          lead.ct_interest =
            lead.ct_interest === undefined ? false : lead.ct_interest;

          // Set created_at and updated_at if not present
          lead.created_at = lead.created_at || new Date().toISOString();
          lead.updated_at = new Date().toISOString();

          // Set status if not present
          lead.status = lead.status || "New";

          // Set prospect_id if not present
          lead.prospect_id =
            lead.prospect_id || `LEAD-${Math.floor(Math.random() * 10000)}`;

          // Add import batch ID
          lead.import_batch_id = importRecord.id;
        });

        // Insert the data into the leads table with conflict handling
        const { data: insertedLeads, error: insertError } = await supabase
          .from("leads")
          .upsert(processedData, {
            onConflict: "prospect_id",
            ignoreDuplicates: false,
          })
          .select();

        if (insertError) {
          // Update import history to failed
          await supabase
            .from("import_history")
            .update({
              status: "failed",
              metadata: { error: insertError.message },
            })
            .eq("id", importRecord.id);

          console.error("Database error:", insertError);
          throw insertError;
        }

        // Update the import history with the actual count
        await supabase
          .from("import_history")
          .update({
            record_count: processedData.length,
            status: "completed",
            metadata: {
              ...importRecord.metadata,
              completed_at: new Date().toISOString(),
            },
          })
          .eq("id", importRecord.id);

        clearInterval(progressInterval);
        setUploadProgress(100);
        setSuccess({
          message: "Leads imported successfully",
          count: processedData.length,
          importId: importRecord.id,
        });

        // Refresh the import history
        fetchImportHistory();

        // Redirect to the leads page after successful import
        setTimeout(() => {
          router.push("/dashboard/leads");
          router.refresh();
        }, 2000);
      }
      // If we don't have data but have a file, submit it directly to the API
      else if (selectedFile) {
        const formData = new FormData();
        formData.append("csvFile", selectedFile);

        const response = await fetch("/api/leads/import", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          clearInterval(progressInterval);
          setUploadProgress(100);
          setSuccess({
            message: result.message || "Leads imported successfully",
            count: result.leads?.length || 0,
            importId: result.importId,
          });

          // Refresh the import history
          fetchImportHistory();

          // Redirect to the leads page after successful import
          setTimeout(() => {
            router.push("/dashboard/leads");
            router.refresh();
          }, 2000);
        } else {
          throw new Error(result.error || "Failed to import leads");
        }
      }
    } catch (error: any) {
      console.error("Error importing leads:", error);
      setError(error?.message || "Failed to import leads. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  const handleRevertImport = async (importId: string) => {
    if (!importId || isReverting) return;

    setIsReverting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads/revert-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ importId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to revert import");
      }

      // Show success message
      setSuccess({
        message: result.message || "Import successfully reverted",
        count: result.deletedCount || 0,
      });

      // Refresh the import history
      fetchImportHistory();
    } catch (error: any) {
      console.error("Error reverting import:", error);
      setError(error?.message || "Failed to revert import. Please try again.");
    } finally {
      setIsReverting(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
  };

  const handleViewLeads = () => {
    router.push("/dashboard/leads");
  };

  const handleDownloadTemplate = () => {
    const csvContent = CSV_TEMPLATE_HEADERS.join(",");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "leads-import-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Import Leads</CardTitle>
              <CardDescription>
                Upload a CSV file to import leads into your CRM
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1"
            >
              <History className="h-4 w-4" />
              {showHistory ? "Hide History" : "Import History"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showHistory ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Imports</h3>
              {importHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No import history found.
                </p>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                          File
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                          Records
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {importHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/50">
                          <td className="px-4 py-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {formatDate(item.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.file_name || "CSV Import"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.record_count}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : item.status === "failed" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : item.status === "reverted" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"}`}
                            >
                              {item.status.charAt(0).toUpperCase() +
                                item.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {item.can_revert && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevertImport(item.id)}
                                disabled={isReverting}
                                className="h-8 px-2 text-xs"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Revert
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                >
                  Back to Import
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="upload">Upload CSV</TabsTrigger>
                <TabsTrigger value="template">Download Template</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                {!selectedFile && !isLoading && !success && (
                  <CSVImport
                    onImport={handleImport}
                    type="leads"
                    isLoading={isLoading}
                    onFileSelect={handleFileSelect}
                  />
                )}

                {selectedFile && !isLoading && !success && (
                  <div className="space-y-4">
                    <Alert>
                      <FileSpreadsheet className="h-4 w-4" />
                      <AlertTitle>Ready to import</AlertTitle>
                      <AlertDescription>
                        File: {selectedFile.name} (
                        {Math.round(selectedFile.size / 1024)} KB)
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleImport([])}>
                        <Upload className="mr-2 h-4 w-4" /> Upload and Import
                      </Button>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading and processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we process your file. This may take a
                      moment.
                    </p>
                  </div>
                )}

                {isReverting && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Reverting import...</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we revert your import. This may take a
                      moment.
                    </p>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Operation Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <div className="space-y-4">
                    <Alert
                      variant="default"
                      className="border-green-500 bg-green-50 dark:bg-green-900/20"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700 dark:text-green-300">
                        Operation Successful
                      </AlertTitle>
                      <AlertDescription>
                        {success.message}. {success.count} leads were{" "}
                        {success.importId ? "imported" : "affected"}.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleCancel}>
                        {success.importId ? "Import Another File" : "Continue"}
                      </Button>
                      <Button onClick={handleViewLeads}>View Leads</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="template" className="space-y-4">
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Download CSV Template
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Use this template to format your lead data correctly for
                    import
                  </p>
                  <Button onClick={handleDownloadTemplate}>
                    <Download className="mr-2 h-4 w-4" /> Download Template
                  </Button>

                  <div className="mt-6 text-left">
                    <h4 className="font-medium mb-2">Required Fields:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Prospect ID - A unique identifier for the lead</li>
                      <li>Business Name - Name of the business</li>
                      <li>Contact Name - Name of the primary contact</li>
                      <li>
                        Contact Email - Email address of the primary contact
                      </li>
                      <li>Phone Number - Contact phone number</li>
                      <li>Address - The address of the business</li>
                      <li>Owner - The owner of the lead</li>
                      <li>
                        Created At - Date the lead was created (DD/MM/YYYY
                        format)
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
