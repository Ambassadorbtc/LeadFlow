"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
        variant: "success",
      });

      router.push("/sign-in");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80"
            alt="Authentication"
            className="h-full w-full object-cover opacity-50"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img
            src="/images/leadflow-logo-with-icon.svg"
            alt="LeadFlow"
            width={150}
            height={40}
            className="invert"
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This CRM has completely transformed how our sales team
              operates. We&apos;ve increased our close rate by 40% since
              implementing it.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/images/leadflow-logo-with-icon.svg"
                alt="LeadFlow"
                width={180}
                height={45}
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your new password below
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Input
                    id="password"
                    name="password"
                    placeholder="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Reset Password"}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link
                href="/sign-in"
                className="underline underline-offset-4 hover:text-primary"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
