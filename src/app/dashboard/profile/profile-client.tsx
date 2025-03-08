"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/app/actions";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Building, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileClientProps = {
  user: any;
  profile: any;
};

export default function ProfileClient({ user, profile }: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    company: profile?.company || "",
    position: profile?.position || "",
    address: profile?.address || "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: formData.full_name },
      });

      if (updateError) throw updateError;

      // Update profile in database
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.full_name,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        address: formData.address,
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      setSuccessMessage("Profile updated successfully");
      router.refresh();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setErrorMessage(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setSuccessMessage("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      setErrorMessage(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = formData.full_name || user?.email || "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Summary Card */}
        <div className="md:col-span-1">
          <Card className="p-6 dark:bg-gray-800">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="" alt={formData.full_name} />
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mb-1 dark:text-white">
                {formData.full_name || "User"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {formData.position || ""}
                {formData.position && formData.company ? " at " : ""}
                {formData.company || ""}
              </p>

              <div className="w-full space-y-3 mt-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm dark:text-gray-300">
                    {formData.email}
                  </span>
                </div>
                {formData.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm dark:text-gray-300">
                      {formData.phone}
                    </span>
                  </div>
                )}
                {formData.company && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm dark:text-gray-300">
                      {formData.company}
                    </span>
                  </div>
                )}
                {formData.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm dark:text-gray-300">
                      {formData.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Edit Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="p-6 dark:bg-gray-800">
                <form onSubmit={updateProfile}>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="p-6 dark:bg-gray-800">
                <form onSubmit={changePassword}>
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

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
