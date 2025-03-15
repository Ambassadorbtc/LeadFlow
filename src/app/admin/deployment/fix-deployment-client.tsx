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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  XCircle,
  Terminal,
} from "lucide-react";
import { createClient } from "@/supabase/client";

export default function FixDeploymentClient() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("diagnostics");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResults, setDeploymentResults] = useState<any>(null);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/deployment-diagnostics");
      const data = await response.json();
      setDiagnostics(data.diagnostics);
    } catch (error) {
      console.error("Error fetching diagnostics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deployAllEdgeFunctions = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch("/api/deploy-all-edge-functions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setDeploymentResults(data);
      // Refresh diagnostics after deploying
      fetchDiagnostics();
    } catch (error) {
      console.error("Error deploying edge functions:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "✓") {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Success
        </Badge>
      );
    } else if (status.startsWith("✗")) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Unknown
        </Badge>
      );
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Deployment Diagnostics & Fix</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchDiagnostics}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Diagnostics
              </>
            )}
          </Button>
          <Button onClick={deployAllEdgeFunctions} disabled={isDeploying}>
            {isDeploying ? (
              <>
                <Terminal className="h-4 w-4 mr-2 animate-pulse" />
                Deploying...
              </>
            ) : (
              <>
                <Terminal className="h-4 w-4 mr-2" />
                Fix Deployment Issues
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="diagnostics"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Results</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="space-y-6">
          {diagnostics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>
                    Status of required environment variables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(diagnostics.environment).map(
                      ([key, value]: [string, any]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center"
                        >
                          <span>{key}</span>
                          {getStatusBadge(value as string)}
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database</CardTitle>
                  <CardDescription>
                    Status of database connection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span>Connection</span>
                    {getStatusBadge(diagnostics.database)}
                  </div>
                  {diagnostics.database.startsWith("✗") && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-500 dark:text-red-400">
                        Error:
                      </p>
                      <p className="text-sm mt-1">
                        {diagnostics.database.substring(4)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Edge Functions</CardTitle>
                  <CardDescription>Status of edge functions</CardDescription>
                </CardHeader>
                <CardContent>
                  {typeof diagnostics.edgeFunctions === "object" ? (
                    <div className="space-y-2">
                      {Object.entries(diagnostics.edgeFunctions).map(
                        ([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center"
                          >
                            <span>{key}</span>
                            {getStatusBadge(value as string)}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span>Status</span>
                      {getStatusBadge(diagnostics.edgeFunctions)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    Status of authentication system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    {getStatusBadge(diagnostics.auth)}
                  </div>
                  {diagnostics.auth.startsWith("✗") && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-500 dark:text-red-400">
                        Error:
                      </p>
                      <p className="text-sm mt-1">
                        {diagnostics.auth.substring(4)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4">Loading diagnostics...</p>
                    </div>
                  ) : (
                    <p>No diagnostics available. Click refresh to check.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          {diagnostics ? (
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>
                  Detailed status of environment variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4">Variable</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(diagnostics.environment).map(
                        ([key, value]: [string, any]) => (
                          <tr
                            key={key}
                            className="border-b dark:border-gray-700"
                          >
                            <td className="py-3 px-4">{key}</td>
                            <td className="py-3 px-4">
                              {value === "✓" ? (
                                <Badge
                                  variant="success"
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Set
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Missing
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4">Loading environment variables...</p>
                    </div>
                  ) : (
                    <p>No data available. Click refresh to check.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          {diagnostics ? (
            <Card>
              <CardHeader>
                <CardTitle>Database Tables</CardTitle>
                <CardDescription>
                  Status of required database tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4">Table</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(diagnostics.tables || {}).map(
                        ([table, status]: [string, any]) => (
                          <tr
                            key={table}
                            className="border-b dark:border-gray-700"
                          >
                            <td className="py-3 px-4">{table}</td>
                            <td className="py-3 px-4">
                              {status === "✓" ? (
                                <Badge
                                  variant="success"
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Exists
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Missing
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-red-500 dark:text-red-400">
                              {status.startsWith("✗")
                                ? status.substring(4)
                                : "-"}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4">Loading database status...</p>
                    </div>
                  ) : (
                    <p>No data available. Click refresh to check.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="functions" className="space-y-6">
          {diagnostics && diagnostics.functionInvocation ? (
            <Card>
              <CardHeader>
                <CardTitle>Edge Function Invocation</CardTitle>
                <CardDescription>
                  Results of invoking edge functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4">Function</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(diagnostics.functionInvocation).map(
                        ([funcName, status]: [string, any]) => (
                          <tr
                            key={funcName}
                            className="border-b dark:border-gray-700"
                          >
                            <td className="py-3 px-4">{funcName}</td>
                            <td className="py-3 px-4">
                              {status === "✓" ? (
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
                            <td className="py-3 px-4 text-sm text-red-500 dark:text-red-400">
                              {status.startsWith("✗")
                                ? status.substring(4)
                                : "-"}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4">Loading edge functions...</p>
                    </div>
                  ) : (
                    <p>No data available. Click refresh to check.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          {deploymentResults ? (
            <Card>
              <CardHeader>
                <CardTitle>Deployment Results</CardTitle>
                <CardDescription>
                  Results of the last deployment operation
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
                      {deploymentResults.results.map(
                        (result: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b dark:border-gray-700"
                          >
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
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-40">
                  {isDeploying ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4">Deploying edge functions...</p>
                    </div>
                  ) : (
                    <p>
                      No deployment results available. Click "Fix Deployment
                      Issues" to start a deployment.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
