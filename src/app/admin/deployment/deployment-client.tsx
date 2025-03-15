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
import { AlertCircle, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { createClient } from "@/supabase/client";

export default function DeploymentClient() {
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("status");
  const [deployingFunctions, setDeployingFunctions] = useState(false);
  const [deploymentResults, setDeploymentResults] = useState<any>(null);

  const fetchDeploymentStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verify-deployment-status");
      const data = await response.json();
      setDeploymentStatus(data);
    } catch (error) {
      console.error("Error fetching deployment status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deployEdgeFunctions = async () => {
    setDeployingFunctions(true);
    try {
      const response = await fetch("/api/deploy-edge-functions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          functionNames: [
            "sync_auth_users",
            "create_users_table_if_not_exists",
            "create_user_settings_if_not_exists",
            "add_missing_columns",
          ],
        }),
      });
      const data = await response.json();
      setDeploymentResults(data);
      // Refresh deployment status after deploying functions
      fetchDeploymentStatus();
    } catch (error) {
      console.error("Error deploying edge functions:", error);
    } finally {
      setDeployingFunctions(false);
    }
  };

  useEffect(() => {
    fetchDeploymentStatus();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
      case "Connected":
      case "Working":
      case "Available":
      case "Complete":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
      case "error":
      case "Error":
      case "Missing":
      case "Missing Required Functions":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Deployment Status</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchDeploymentStatus}
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
                Refresh Status
              </>
            )}
          </Button>
          <Button onClick={deployEdgeFunctions} disabled={deployingFunctions}>
            {deployingFunctions ? "Deploying..." : "Deploy Edge Functions"}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="status"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="functions">Edge Functions</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Results</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          {deploymentStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>
                    Status of required environment variables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    {getStatusBadge(
                      deploymentStatus.environmentVariables.status,
                    )}
                  </div>
                  {deploymentStatus.environmentVariables.missingVars.length >
                    0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-500 dark:text-red-400">
                        Missing Variables:
                      </p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {deploymentStatus.environmentVariables.missingVars.map(
                          (variable: string) => (
                            <li key={variable}>{variable}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
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
                    <span>Status</span>
                    {getStatusBadge(deploymentStatus.database.status)}
                  </div>
                  {deploymentStatus.database.error && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-500 dark:text-red-400">
                        Error:
                      </p>
                      <p className="text-sm mt-1">
                        {deploymentStatus.database.error}
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
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    {getStatusBadge(deploymentStatus.edgeFunctions.status)}
                  </div>
                  {deploymentStatus.edgeFunctions.error && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-500 dark:text-red-400">
                        Error:
                      </p>
                      <p className="text-sm mt-1">
                        {deploymentStatus.edgeFunctions.error}
                      </p>
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
                    {getStatusBadge(deploymentStatus.authentication.status)}
                  </div>
                  {deploymentStatus.authentication.error && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-500 dark:text-red-400">
                        Error:
                      </p>
                      <p className="text-sm mt-1">
                        {deploymentStatus.authentication.error}
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
                      <p className="mt-4">Loading deployment status...</p>
                    </div>
                  ) : (
                    <p>
                      No deployment status available. Click refresh to check.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          {deploymentStatus ? (
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
                      {Object.entries(
                        deploymentStatus.environmentVariables.envStatus,
                      ).map(([key, value]: [string, any]) => (
                        <tr key={key} className="border-b dark:border-gray-700">
                          <td className="py-3 px-4">{key}</td>
                          <td className="py-3 px-4">
                            {value ? (
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
                      ))}
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
          {deploymentStatus ? (
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
                      {deploymentStatus.database.tables.map(
                        (table: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b dark:border-gray-700"
                          >
                            <td className="py-3 px-4">{table.table}</td>
                            <td className="py-3 px-4">
                              {table.exists ? (
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
                              {table.error || "-"}
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
          {deploymentStatus ? (
            <Card>
              <CardHeader>
                <CardTitle>Edge Functions</CardTitle>
                <CardDescription>
                  List of available edge functions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deploymentStatus.edgeFunctions.functions.length > 0 ? (
                        deploymentStatus.edgeFunctions.functions.map(
                          (func: any) => (
                            <tr
                              key={func.id}
                              className="border-b dark:border-gray-700"
                            >
                              <td className="py-3 px-4">{func.name}</td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant="success"
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Active
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {new Date(func.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ),
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-4 px-4 text-center text-gray-500 dark:text-gray-400"
                          >
                            No edge functions found
                          </td>
                        </tr>
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
                  {deployingFunctions ? (
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4">Deploying edge functions...</p>
                    </div>
                  ) : (
                    <p>
                      No deployment results available. Click "Deploy Edge
                      Functions" to start a deployment.
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
