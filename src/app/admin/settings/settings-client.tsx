"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SystemSettings {
  id?: string;
  site_name?: string;
  company_name?: string;
  contact_email?: string;
  support_email?: string;
  enable_notifications?: boolean;
  enable_user_registration?: boolean;
  maintenance_mode?: boolean;
  welcome_message?: string;
  privacy_policy?: string;
  terms_of_service?: string;
  created_at?: string;
  updated_at?: string;
}

interface AdminSettingsClientProps {
  settings: SystemSettings;
}

export default function AdminSettingsClient({
  settings: initialSettings,
}: AdminSettingsClientProps) {
  const [settings, setSettings] = useState<SystemSettings>(
    initialSettings || {
      site_name: "LeadFlow CRM",
      company_name: "LeadFlow Inc.",
      contact_email: "contact@leadflowapp.online",
      support_email: "support@leadflowapp.online",
      enable_notifications: true,
      enable_user_registration: true,
      maintenance_mode: false,
      welcome_message: "Welcome to LeadFlow CRM! We're glad you're here.",
      privacy_policy: "# Privacy Policy\n\nThis is the default privacy policy.",
      terms_of_service:
        "# Terms of Service\n\nThis is the default terms of service.",
    },
  );

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const supabase = createClient();

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Check if settings record exists
      const { data: existingSettings, error: fetchError } = await supabase
        .from("system_settings")
        .select("id")
        .limit(1);

      if (fetchError) {
        console.error("Error fetching settings:", fetchError);
        throw fetchError;
      }

      let result;
      if (existingSettings && existingSettings.length > 0) {
        // Update existing record
        result = await supabase
          .from("system_settings")
          .update({
            site_name: settings.site_name || null,
            company_name: settings.company_name || null,
            contact_email: settings.contact_email || null,
            support_email: settings.support_email || null,
            enable_notifications:
              settings.enable_notifications !== undefined
                ? settings.enable_notifications
                : true,
            enable_user_registration:
              settings.enable_user_registration !== undefined
                ? settings.enable_user_registration
                : true,
            maintenance_mode:
              settings.maintenance_mode !== undefined
                ? settings.maintenance_mode
                : false,
            welcome_message: settings.welcome_message || null,
            privacy_policy: settings.privacy_policy || null,
            terms_of_service: settings.terms_of_service || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSettings[0].id);
      } else {
        // Insert new record
        result = await supabase.from("system_settings").insert({
          site_name: settings.site_name || null,
          company_name: settings.company_name || null,
          contact_email: settings.contact_email || null,
          support_email: settings.support_email || null,
          enable_notifications:
            settings.enable_notifications !== undefined
              ? settings.enable_notifications
              : true,
          enable_user_registration:
            settings.enable_user_registration !== undefined
              ? settings.enable_user_registration
              : true,
          maintenance_mode:
            settings.maintenance_mode !== undefined
              ? settings.maintenance_mode
              : false,
          welcome_message: settings.welcome_message || null,
          privacy_policy: settings.privacy_policy || null,
          terms_of_service: settings.terms_of_service || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      if (result.error) {
        console.error("Error details:", result.error);
        throw result.error;
      }

      setStatusMessage("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      setStatusMessage("Failed to save settings");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const resetToDefaults = async () => {
    const defaultSettings = {
      site_name: "LeadFlow CRM",
      company_name: "LeadFlow Inc.",
      contact_email: "contact@leadflowapp.online",
      support_email: "support@leadflowapp.online",
      enable_notifications: true,
      enable_user_registration: true,
      maintenance_mode: false,
      welcome_message: "Welcome to LeadFlow CRM! We're glad you're here.",
      privacy_policy: "# Privacy Policy\n\nThis is the default privacy policy.",
      terms_of_service:
        "# Terms of Service\n\nThis is the default terms of service.",
    };

    setSettings(defaultSettings);
    setIsResetDialogOpen(false);
    setStatusMessage("Settings reset to defaults");
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mb-4 p-3 rounded-md ${statusMessage.includes("success") ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
        >
          {statusMessage}
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic information about your CRM system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name || ""}
                  onChange={(e) => handleChange("site_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={settings.company_name || ""}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="maintenance_mode"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Switch
                    id="maintenance_mode"
                    checked={settings.maintenance_mode || false}
                    onCheckedChange={(checked) =>
                      handleChange("maintenance_mode", checked)
                    }
                  />
                  <span>Maintenance Mode</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, only admins can access the system
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure email addresses used by the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email || ""}
                  onChange={(e) =>
                    handleChange("contact_email", e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Used for general inquiries
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={settings.support_email || ""}
                  onChange={(e) =>
                    handleChange("support_email", e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Used for support requests
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>
                Enable or disable system features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="enable_notifications"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Switch
                    id="enable_notifications"
                    checked={settings.enable_notifications || false}
                    onCheckedChange={(checked) =>
                      handleChange("enable_notifications", checked)
                    }
                  />
                  <span>Enable Notifications</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow the system to send notifications to users
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="enable_user_registration"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Switch
                    id="enable_user_registration"
                    checked={settings.enable_user_registration || false}
                    onCheckedChange={(checked) =>
                      handleChange("enable_user_registration", checked)
                    }
                  />
                  <span>Enable User Registration</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>
                Customize system messages and legal content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  value={settings.welcome_message || ""}
                  onChange={(e) =>
                    handleChange("welcome_message", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy_policy">Privacy Policy</Label>
                <Textarea
                  id="privacy_policy"
                  value={settings.privacy_policy || ""}
                  onChange={(e) =>
                    handleChange("privacy_policy", e.target.value)
                  }
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Supports Markdown formatting
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms_of_service">Terms of Service</Label>
                <Textarea
                  id="terms_of_service"
                  value={settings.terms_of_service || ""}
                  onChange={(e) =>
                    handleChange("terms_of_service", e.target.value)
                  }
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Supports Markdown formatting
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset to Defaults Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Defaults</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all settings to their default
              values? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetToDefaults}>
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
