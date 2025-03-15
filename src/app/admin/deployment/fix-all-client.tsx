"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  XCircle,
  Terminal,
  Wrench,
  Info,
} from "lucide-react";

export default function FixAllDeploymentClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fixAllIssues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/verify-and-fix-deployment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Add cache control to prevent caching
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      if (!data.success) {
        setError(data.error || "Unknown error occurred");
      }
    } catch (err: any) {
      console.error("Error fixing deployment issues:", err);
      setError(err.message || "Failed to fix deployment issues");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-retry on initial load if there was an error
  useEffect(() => {
    if (error && retryCount < 2) {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        fixAllIssues();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fix All Deployment Issues</h1>
        <Button onClick={fixAllIssues} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Fixing Issues...
            </>
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-2" />
              Fix All Issues
            </>
          )}
        </Button>
      </div>

      {retryCount > 0 && (
        <Card className="mb-6 border-blue-300 dark:border-blue-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Auto-retry in progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Automatically retrying deployment fix ({retryCount}/2)</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-300 dark:border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Try clicking the "Fix All Issues" button again. If the problem
              persists, check your database connection and environment
              variables.
            </p>
          </CardContent>
        </Card>
      )}

      {results?.success && (
        <Card className="mb-6 border-green-300 dark:border-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{results.message}</p>
          </CardContent>
        </Card>
      )}

      {results?.functionResults && (
        <Card>
          <CardHeader>
            <CardTitle>Edge Function Results</CardTitle>
            <CardDescription>
              Status of edge function deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4">Function</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {results.functionResults.map((result: any, index: number) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                      <td className="py-3 px-4">{result.functionName}</td>
                      <td className="py-3 px-4">
                        {result.success ? (
                          <Badge
                            variant="success"
                            className="flex items-center gap-1 w-fit"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Success
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 w-fit"
                          >
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {result.error || "Deployed successfully"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!results && !error && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-40">
              <Terminal className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-center text-gray-500 dark:text-gray-400">
                Click "Fix All Issues" to automatically fix deployment issues
                including infinite recursion in policies, missing tables, and
                edge function deployment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-40">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-center">
                Fixing deployment issues. This may take a moment...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
