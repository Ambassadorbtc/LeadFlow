"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import {
  User,
  ClipboardList,
  Mail,
  Phone,
  Calendar,
  Clock,
  UserCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";

export default function ProfileClient({
  user,
  profile,
  recentDeals,
  recentContacts,
}: {
  user: any;
  profile: any;
  recentDeals: any[];
  recentContacts: any[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.user_metadata?.full_name || "",
    email: profile?.email || user?.email || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    job_title: profile?.job_title || "",
    company: profile?.company || "",
    avatar_url: profile?.avatar_url || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the dedicated API endpoint to update profile
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>Saved</span>
          </div>
        ),
        description: "Your profile has been successfully updated.",
        variant: "success",
      });

      router.refresh();
    } catch (error: any) {
      console.error("Error in profile update:", error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`;

    setIsLoading(true);

    try {
      // First, create the bucket if it doesn't exist
      try {
        const { error: createBucketError } =
          await supabase.storage.createBucket("avatars", {
            public: true,
            fileSizeLimit: 1024 * 1024 * 2, // 2MB
          });
        if (
          createBucketError &&
          !createBucketError.message.includes("already exists")
        ) {
          throw createBucketError;
        }
      } catch (bucketError) {
        console.error(
          "Bucket creation error (might already exist):",
          bucketError,
        );
        // Continue anyway
      }

      // Upload the file to storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (data) {
        // Update the form data with the new avatar URL
        setFormData((prev) => ({ ...prev, avatar_url: data.publicUrl }));

        // Use the API endpoint to update the profile with the new avatar URL
        const updatedFormData = { ...formData, avatar_url: data.publicUrl };
        const response = await fetch("/api/profile/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFormData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Failed to update profile with new avatar",
          );
        }

        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Avatar updated</span>
            </div>
          ),
          description: "Your profile picture has been updated.",
          variant: "success",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">My Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={formData.avatar_url}
                      alt={formData.full_name}
                    />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {formData.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isLoading}
                    />
                    <User className="h-4 w-4" />
                  </label>
                </div>
                <h3 className="text-xl font-semibold dark:text-white">
                  {formData.full_name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {formData.job_title}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {formData.company}
                </p>
                <div className="mt-4 w-full">
                  <div className="flex items-center mb-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="full_name"
                        className="text-sm font-medium dark:text-gray-300"
                      >
                        Full Name
                      </label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium dark:text-gray-300"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Your email address"
                        required
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="text-sm font-medium dark:text-gray-300"
                      >
                        Phone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="job_title"
                        className="text-sm font-medium dark:text-gray-300"
                      >
                        Job Title
                      </label>
                      <Input
                        id="job_title"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleChange}
                        placeholder="Your job title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="company"
                        className="text-sm font-medium dark:text-gray-300"
                      >
                        Company
                      </label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="bio"
                      className="text-sm font-medium dark:text-gray-300"
                    >
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Deals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Recent Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentDeals.length > 0 ? (
                  <div className="space-y-4">
                    {recentDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="flex items-start p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900 p-2 mr-3">
                          <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            href={`/dashboard/deals/${deal.id}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {deal.name}
                          </a>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {deal.stage} • $
                            {Number(deal.value).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {new Date(deal.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No recent deals found
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle className="h-5 w-5 mr-2" />
                  Recent Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentContacts.length > 0 ? (
                  <div className="space-y-4">
                    {recentContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-shrink-0 rounded-full bg-purple-100 dark:bg-purple-900 p-2 mr-3">
                          <UserCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            href={`/dashboard/contacts/${contact.id}`}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {contact.name}
                          </a>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {contact.company || "No company"} •{" "}
                            {contact.position || "No position"}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No recent contacts found
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Account Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Deals
                    </div>
                    <div className="text-2xl font-bold mt-1 dark:text-white">
                      {recentDeals.length}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Contacts
                    </div>
                    <div className="text-2xl font-bold mt-1 dark:text-white">
                      {recentContacts.length}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Member Since
                    </div>
                    <div className="text-2xl font-bold mt-1 dark:text-white">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Last Login
                    </div>
                    <div className="text-2xl font-bold mt-1 dark:text-white">
                      {new Date(user.last_sign_in_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
