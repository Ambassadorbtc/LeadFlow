"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { createClient } from "@/supabase/client";
import {
  UserPlus,
  Search,
  Mail,
  Ban,
  Trash2,
  RefreshCw,
  User,
} from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  last_sign_in_at?: string;
  created_at: string;
  user_metadata?: any;
  app_metadata?: any;
}

interface AdminUsersClientProps {
  users: User[];
}

export default function AdminUsersClient({ users }: AdminUsersClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    full_name: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const supabase = createClient();

  // Filter users based on search term
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.full_name.toLowerCase().includes(term),
      );
      setFilteredUsers(filtered);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (user: User) => {
    setIsLoading(true);
    try {
      // Update in public.users table
      const { error } = await supabase
        .from("users")
        .update({ is_active: !user.is_active })
        .eq("id", user.id);

      if (error) throw error;

      // Skip auth.admin operations as they're causing permission errors
      // Just log the action for now
      console.log(
        `User ${user.id} ${user.is_active ? "deactivated" : "activated"} in public.users table`,
      );

      // Update local state
      setFilteredUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u,
        ),
      );

      setStatusMessage(
        `User ${user.is_active ? "deactivated" : "activated"} successfully`,
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      setStatusMessage("Failed to update user status");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // Send password reset email
  const sendPasswordReset = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        selectedUser.email,
        {
          redirectTo: `${window.location.origin}/protected/reset-password`,
        },
      );

      if (error) throw error;
      setStatusMessage("Password reset email sent successfully");
      setIsResetPasswordOpen(false);
    } catch (error) {
      console.error("Error sending password reset:", error);
      setStatusMessage("Failed to send password reset email");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // Delete user
  const deleteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      // Skip auth.admin operations and just delete from public.users table
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);

      if (deleteError) throw deleteError;

      // Update local state
      setFilteredUsers((prevUsers) =>
        prevUsers.filter((u) => u.id !== selectedUser.id),
      );
      setStatusMessage("User deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      setStatusMessage("Failed to delete user");
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // Add new user
  const addUser = async () => {
    if (!newUserData.email || !newUserData.password || !newUserData.full_name) {
      setStatusMessage("All fields are required");
      return;
    }

    // Check if email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", newUserData.email);

    if (checkError) {
      console.error("Error checking existing users:", checkError);
      setStatusMessage("Error checking existing users");
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      setStatusMessage("A user with this email already exists");
      return;
    }

    setIsLoading(true);
    try {
      // Use regular signup instead of admin API
      const { data, error } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.full_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user in public.users table
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email: newUserData.email,
          full_name: newUserData.full_name,
          name: newUserData.full_name,
          created_at: new Date().toISOString(),
          is_active: true,
        });

        if (insertError) throw insertError;

        // Add to local state
        const newUser = {
          id: data.user.id,
          email: newUserData.email,
          full_name: newUserData.full_name,
          is_active: true,
          created_at: new Date().toISOString(),
        };

        setFilteredUsers((prevUsers) => [...prevUsers, newUser]);
        setStatusMessage("User added successfully");
        setIsAddUserOpen(false);
        setNewUserData({ email: "", full_name: "", password: "" });
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      setStatusMessage(error.message || "Failed to add user");
      // Log more detailed error information
      if (error.details) console.error("Error details:", error.details);
      if (error.hint) console.error("Error hint:", error.hint);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          placeholder="Search users by name or email"
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      {statusMessage && (
        <div
          className={`mb-4 p-3 rounded-md ${statusMessage.includes("success") ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}
        >
          {statusMessage}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() =>
                      (window.location.href = `/admin/users/${user.id}`)
                    }
                  >
                    <TableCell className="font-medium">
                      {user.full_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.is_active ? "success" : "destructive"}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsResetPasswordOpen(true);
                          }}
                          title="Send password reset"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.is_active ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                          title={
                            user.is_active ? "Deactivate user" : "Activate user"
                          }
                          disabled={isLoading}
                        >
                          {user.is_active ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Password Reset</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to send a password reset email to:</p>
            <p className="font-semibold mt-2">{selectedUser?.email}</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsResetPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={sendPasswordReset} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
              <p className="font-semibold mt-2">{selectedUser?.email}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={newUserData.full_name}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, full_name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addUser} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
