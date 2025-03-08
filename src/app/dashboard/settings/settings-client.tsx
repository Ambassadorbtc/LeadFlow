"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Moon,
  Sun,
  Palette,
  Globe,
  Shield,
  Database,
  Mail,
} from "lucide-react";

type SettingsClientProps = {
  user: any;
  settings: any;
};

export default function SettingsClient({
  user,
  settings,
}: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Default settings
  const defaultSettings = {
    theme_preference: "system",
    email_notifications: true,
    lead_notifications: true,
    deal_notifications: true,
    task_notifications: true,
    default_currency: "USD",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
    language: "en",
    auto_refresh_dashboard: true,
    show_deal_values: true,
    compact_view: false,
  };

  // Form state
  const [formData, setFormData] = useState({
    ...defaultSettings,
    ...settings,
  });

  // Update theme when theme preference changes
  useEffect(() => {
    if (formData.theme_preference === "system") {
      setTheme("system");
    } else {
      setTheme(formData.theme_preference);
    }
  }, [formData.theme_preference, setTheme]);

  const handleSwitchChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Apply theme change immediately
    if (name === "theme_preference") {
      setTheme(value === "system" ? "system" : value);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Save settings to database
      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccessMessage("Settings saved successfully");
      router.refresh();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setErrorMessage(error.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    setFormData(defaultSettings);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md dark:bg-green-900/20 dark:text-green-300">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md dark:bg-red-900/20 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <TabsContent value="appearance">
          <Card className="p-6 dark:bg-gray-800">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
                  <Palette className="mr-2 h-5 w-5" />
                  Theme Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme_preference">Theme Mode</Label>
                    <Select
                      value={formData.theme_preference}
                      onValueChange={(value) =>
                        handleSelectChange("theme_preference", value)
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem
                          value="light"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center">
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="dark"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center">
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="system"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center">
                            <div className="mr-2 h-4 w-4 flex">
                              <Sun className="h-4 w-4 -mr-1" />
                              <Moon className="h-4 w-4" />
                            </div>
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compact_view">Compact View</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="compact_view"
                        checked={formData.compact_view}
                        onCheckedChange={() =>
                          handleSwitchChange("compact_view")
                        }
                      />
                      <Label
                        htmlFor="compact_view"
                        className="dark:text-gray-300"
                      >
                        {formData.compact_view ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="dark:bg-gray-700" />

              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
                  <Globe className="mr-2 h-5 w-5" />
                  Regional Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        handleSelectChange("language", value)
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem
                          value="en"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          English
                        </SelectItem>
                        <SelectItem
                          value="es"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          Spanish
                        </SelectItem>
                        <SelectItem
                          value="fr"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          French
                        </SelectItem>
                        <SelectItem
                          value="de"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          German
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_currency">Default Currency</Label>
                    <Select
                      value={formData.default_currency}
                      onValueChange={(value) =>
                        handleSelectChange("default_currency", value)
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem
                          value="USD"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          USD ($)
                        </SelectItem>
                        <SelectItem
                          value="EUR"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          EUR (€)
                        </SelectItem>
                        <SelectItem
                          value="GBP"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          GBP (£)
                        </SelectItem>
                        <SelectItem
                          value="JPY"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          JPY (¥)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_format">Date Format</Label>
                    <Select
                      value={formData.date_format}
                      onValueChange={(value) =>
                        handleSelectChange("date_format", value)
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem
                          value="MM/DD/YYYY"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          MM/DD/YYYY
                        </SelectItem>
                        <SelectItem
                          value="DD/MM/YYYY"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          DD/MM/YYYY
                        </SelectItem>
                        <SelectItem
                          value="YYYY-MM-DD"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          YYYY-MM-DD
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time_format">Time Format</Label>
                    <Select
                      value={formData.time_format}
                      onValueChange={(value) =>
                        handleSelectChange("time_format", value)
                      }
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem
                          value="12h"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          12-hour (AM/PM)
                        </SelectItem>
                        <SelectItem
                          value="24h"
                          className="dark:text-white dark:hover:bg-gray-700"
                        >
                          24-hour
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6 dark:bg-gray-800">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
                <Bell className="mr-2 h-5 w-5" />
                Notification Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="email_notifications"
                      className="text-base dark:text-white"
                    >
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive email notifications
                    </p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={formData.email_notifications}
                    onCheckedChange={() =>
                      handleSwitchChange("email_notifications")
                    }
                  />
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="lead_notifications"
                      className="text-base dark:text-white"
                    >
                      Lead Notifications
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified about new leads
                    </p>
                  </div>
                  <Switch
                    id="lead_notifications"
                    checked={formData.lead_notifications}
                    onCheckedChange={() =>
                      handleSwitchChange("lead_notifications")
                    }
                    disabled={!formData.email_notifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="deal_notifications"
                      className="text-base dark:text-white"
                    >
                      Deal Notifications
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified about deal updates
                    </p>
                  </div>
                  <Switch
                    id="deal_notifications"
                    checked={formData.deal_notifications}
                    onCheckedChange={() =>
                      handleSwitchChange("deal_notifications")
                    }
                    disabled={!formData.email_notifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="task_notifications"
                      className="text-base dark:text-white"
                    >
                      Task Notifications
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified about task deadlines
                    </p>
                  </div>
                  <Switch
                    id="task_notifications"
                    checked={formData.task_notifications}
                    onCheckedChange={() =>
                      handleSwitchChange("task_notifications")
                    }
                    disabled={!formData.email_notifications}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="p-6 dark:bg-gray-800">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
                <Shield className="mr-2 h-5 w-5" />
                Dashboard Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="auto_refresh_dashboard"
                      className="text-base dark:text-white"
                    >
                      Auto-refresh Dashboard
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically refresh dashboard data
                    </p>
                  </div>
                  <Switch
                    id="auto_refresh_dashboard"
                    checked={formData.auto_refresh_dashboard}
                    onCheckedChange={() =>
                      handleSwitchChange("auto_refresh_dashboard")
                    }
                  />
                </div>

                <Separator className="dark:bg-gray-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="show_deal_values"
                      className="text-base dark:text-white"
                    >
                      Show Deal Values
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Display monetary values in deal cards
                    </p>
                  </div>
                  <Switch
                    id="show_deal_values"
                    checked={formData.show_deal_values}
                    onCheckedChange={() =>
                      handleSwitchChange("show_deal_values")
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="p-6 dark:bg-gray-800">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4 flex items-center dark:text-white">
                <Database className="mr-2 h-5 w-5" />
                Data & Privacy
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md dark:bg-yellow-900/20 dark:text-yellow-300">
                  <p>
                    Your data is stored securely and is never shared with third
                    parties without your consent.
                  </p>
                </div>

                <div className="flex flex-col space-y-4">
                  <Button
                    variant="outline"
                    className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Export All Data
                  </Button>
                  <Button
                    variant="outline"
                    className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Request Data Deletion
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={resetSettings}
          className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
