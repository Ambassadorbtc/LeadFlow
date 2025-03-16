"use client";

import { useState } from "react";
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
import CSVPreview from "@/components/dashboard/csv-preview";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { mapCSVToLeads, CSVRow } from "./csv-parser";

export default function LeadsImportClient() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    count: number;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const handleImport = async (data: any[]) => {
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

      // Use the parsed data from CSVPreview component or the data passed in
      const dataToProcess = parsedData.length > 0 ? parsedData : data;

      // Process and validate the data using the mapper function
      const processedData = mapCSVToLeads(dataToProcess, userData.user.id);

      // Insert the data into the leads table
      const { error: insertError } = await supabase
        .from("leads")
        .insert(processedData);

      if (insertError) {
        console.error("Database error:", insertError);
        throw insertError;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess({
        message: "Leads imported successfully",
        count: processedData.length,
      });

      // Redirect to the leads page after successful import
      setTimeout(() => {
        router.push("/dashboard/leads");
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Error importing leads:", error);
      setError(error?.message || "Failed to import leads. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File, data: any[] = []) => {
    setSelectedFile(file);
    setParsedData(data);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    setParsedData([]);
  };

  const handleViewLeads = () => {
    router.push("/dashboard/leads");
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Import Leads</CardTitle>
          <CardDescription>
            Upload a CSV file to import leads into your CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="template">Download Template</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              {!selectedFile && !isLoading && !success && (
                <CSVPreview
                  onFileSelect={handleFileSelect}
                  onCancel={handleCancel}
                  requiredHeaders={["business_name", "contact_name"]}
                  entityType="leads"
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
                    <Button onClick={() => handleImport(parsedData)}>
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

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import Failed</AlertTitle>
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
                      Import Successful
                    </AlertTitle>
                    <AlertDescription>
                      {success.message}. {success.count} leads were imported.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleCancel}>
                      Import Another File
                    </Button>
                    <Button onClick={handleViewLeads}>
                      View Imported Leads
                    </Button>
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
                <Button>Download Template</Button>

                <div className="mt-6 text-left">
                  <h4 className="font-medium mb-2">Required Fields:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>business_name - Name of the business</li>
                    <li>contact_name - Name of the primary contact</li>
                  </ul>

                  <h4 className="font-medium mt-4 mb-2">Optional Fields:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>email - Contact email address</li>
                    <li>phone - Contact phone number</li>
                    <li>status - Lead status (default: "New")</li>
                    <li>source - Where the lead came from</li>
                    <li>notes - Additional notes about the lead</li>
                    <li>deal_value - Potential deal value (numeric)</li>
                    <li>
                      bf_interest - Business Financing interest (true/false)
                    </li>
                    <li>ct_interest - Credit Training interest (true/false)</li>
                    <li>
                      ba_interest - Business Automation interest (true/false)
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
