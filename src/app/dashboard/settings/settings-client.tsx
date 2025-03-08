"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";
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
import {
  Bell,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Palette,
  Globe,
  Mail,
} from "lucide-react";

export default function SettingsClient({
  user,
  settings,
}: {
  user: any;
  settings: any;
}) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email_notifications: settings.email_notifications !== false,
    deal_updates: settings.deal_updates !== false,
    contact_updates: settings.contact_updates !== false,
    marketing_emails: settings.marketing_emails !== false,
    theme_preference: settings.theme_preference || "system",
    default_currency: settings.default_currency || "USD",
    default_language: settings.default_language || "en",
    timezone: settings.timezone || "UTC",
    date_format: settings.date_format || "MM/DD/YYYY",
    password: "",
    confirmPassword: "",
  });

  const handleSwitchChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveGeneralSettings = async () => {
    setIsLoading(true);

    try {
      // First, ensure the user_settings table exists
      // Skip the setup step as we've created a migration that ensures all columns exist
      // This avoids CORS issues with edge functions

      // Use the dedicated API endpoint to update settings
      const response = await fetch("/api/settings/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update settings");
      }

      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>Saved</span>
          </div>
        ),
        description: "Your settings have been updated successfully.",
        variant: "success",
      });

      router.refresh();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      // Clear password fields
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error: any) {
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);

    try {
      // In a real app, you would need to implement a secure way to delete user data
      // This is a simplified example
      const { error } = await supabase.rpc("delete_user_account", {
        user_id: user.id,
      });

      if (error) throw error;

      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to home page
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description:
          error.message ||
          "There was an error deleting your account. Please contact support.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance & Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="theme_preference">Theme Preference</Label>
                  <Select
                    value={formData.theme_preference}
                    onValueChange={(value) =>
                      handleSelectChange("theme_preference", value)
                    }
                  >
                    <SelectTrigger id="theme_preference">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Select
                    value={formData.default_currency}
                    onValueChange={(value) =>
                      handleSelectChange("default_currency", value)
                    }
                  >
                    <SelectTrigger id="default_currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="default_language">Language</Label>
                  <Select
                    value={formData.default_language}
                    onValueChange={(value) =>
                      handleSelectChange("default_language", value)
                    }
                  >
                    <SelectTrigger id="default_language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) =>
                      handleSelectChange("timezone", value)
                    }
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">
                        Eastern Time (ET)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (CT)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (MT)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (PT)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        London (GMT)
                      </SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="date_format">Date Format</Label>
                  <Select
                    value={formData.date_format}
                    onValueChange={(value) =>
                      handleSelectChange("date_format", value)
                    }
                  >
                    <SelectTrigger id="date_format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveGeneralSettings} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive email notifications for important updates
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="deal_updates">Deal Updates</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified about changes to your deals
                    </p>
                  </div>
                  <Switch
                    id="deal_updates"
                    checked={formData.deal_updates}
                    onCheckedChange={() => handleSwitchChange("deal_updates")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="contact_updates">Contact Updates</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get notified about changes to your contacts
                    </p>
                  </div>
                  <Switch
                    id="contact_updates"
                    checked={formData.contact_updates}
                    onCheckedChange={() =>
                      handleSwitchChange("contact_updates")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing_emails">Marketing Emails</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    id="marketing_emails"
                    checked={formData.marketing_emails}
                    onCheckedChange={() =>
                      handleSwitchChange("marketing_emails")
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveGeneralSettings} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={changePassword}
                  disabled={isLoading || !formData.password}
                >
                  {isLoading ? "Updating..." : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                <Shield className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 dark:border-red-900 rounded-md bg-red-50 dark:bg-red-900/20">
                  <h3 className="text-lg font-medium text-red-600 dark:text-red-400">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1 mb-4">
                    Once you delete your account, there is no going back. This
                    action cannot be undone.
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteAccount}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isLoading ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
